"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { marked } from 'marked';
import TurndownService from 'turndown';

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
import {
  ClipboardList,
  User,
  CheckCircle2,
  Check,
  XCircle,
  Plus,
  Edit2,
  Calendar,
  FileText,
  Bell,
  ArrowUp,
  Clock,
  MoreVertical,
  Building2,
} from "lucide-react";
import { useCreateActivity, ActivityType, Activity } from "@/app/api/hooks/process/useCreateActivity";
import { useCompleteActivity } from "@/app/api/hooks/process/useCompleteActivity";
import { useChangeActivityAssignee } from "@/app/api/hooks/process/useChangeActivityAssignee";
import { useUpdateActivityNotes } from "@/app/api/hooks/process/useUpdateActivityNotes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAssignableUsers, AssignableUser } from "@/app/api/hooks/users/useAssignableUsers";
import { useReasonLoss } from "@/app/api/hooks/reason-loss/useReasonLoss";
import { Process } from "@/app/interfaces/processes";
import { getStageLabel } from "@/app/utils/processUtils";
import { StageProcess } from "@/app/interfaces/processes";
import { useTheme } from "@/app/hooks/use-theme-client";
import { toast } from "react-toastify";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { UserRolesEnum } from "@/app/interfaces/user";

interface ActivitiesCardProps {
  process: Process | null;
  onUpdate?: () => void;
}

const ACTIVITY_TYPES: { value: ActivityType; label: string; stage: StageProcess }[] = [
  { value: "PRE_ANALISE", label: "Pré-Análise", stage: StageProcess.PRE_ANALYSIS },
  { value: "ANALISE", label: "Análise", stage: StageProcess.ANALYSIS },
  { value: "CALCULO", label: "Cálculo", stage: StageProcess.CALCULATION },
];

export function ActivitiesCard({ process, onUpdate }: ActivitiesCardProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRolesEnum.ADMIN;
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState<ActivityType | null>(null);
  const [showChangeAssigneeDialog, setShowChangeAssigneeDialog] = useState<ActivityType | null>(null);
  const [selectedType, setSelectedType] = useState<ActivityType | "">("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [completeNotes, setCompleteNotes] = useState("");
  const [completeNotesMarkdown, setCompleteNotesMarkdown] = useState("");
  const [completeStatus, setCompleteStatus] = useState<"APPROVE" | "LOSS" | "">("");
  const [completeLossReason, setCompleteLossReason] = useState<string>("");
  const [newAssignee, setNewAssignee] = useState<string>("");
  const lastProcessedNotesRef = useRef<string | undefined>(undefined);

  const { data: usersData } = useAssignableUsers();
  const { data: reasonLossData } = useReasonLoss();
  const createActivityMutation = useCreateActivity(process?._id);
  const completeActivityMutation = useCompleteActivity(process?._id);
  const changeAssigneeMutation = useChangeActivityAssignee(process?._id);
  const updateNotesMutation = useUpdateActivityNotes(process?._id);
  
  const [showEditNotesDialog, setShowEditNotesDialog] = useState<{ activityType: ActivityType; currentNotes: string } | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editNotesMarkdown, setEditNotesMarkdown] = useState("");
  const [editAssignee, setEditAssignee] = useState<string>("");
  const lastProcessedEditNotesRef = useRef<string | undefined>(undefined);

  // Assumindo que as atividades vêm do processo (precisaremos adicionar isso na interface Process)
  const activities: Activity[] = (process as any)?.activities || [];
  const processDecisions = process?.processDecisions;

  const handleCreateActivity = async () => {
    if (!selectedType || !selectedAssignee) {
      toast.error("Selecione o tipo e o responsável");
      return;
    }

    try {
      await createActivityMutation.mutateAsync({
        type: selectedType as ActivityType,
        assignedTo: selectedAssignee,
      });
      toast.success("Atividade criada com sucesso");
      setShowCreateDialog(false);
      setSelectedType("");
      setSelectedAssignee("");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao criar atividade");
    }
  };

  // Converter HTML para Markdown quando abrir o modal de conclusão
  useEffect(() => {
    if (showCompleteDialog && completeNotes) {
      // Se contém HTML, converter para Markdown
      if (completeNotes && /<[a-z][\s\S]*>/i.test(completeNotes)) {
        try {
          const turndownService = new TurndownService();
          const markdown = turndownService.turndown(completeNotes);
          setCompleteNotesMarkdown(markdown);
          lastProcessedNotesRef.current = completeNotes;
        } catch (error) {
          console.error('Erro ao converter HTML para Markdown:', error);
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = completeNotes;
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          setCompleteNotesMarkdown(textContent);
          lastProcessedNotesRef.current = completeNotes;
        }
      } else if (completeNotes) {
        setCompleteNotesMarkdown(completeNotes);
        lastProcessedNotesRef.current = completeNotes;
      } else {
        setCompleteNotesMarkdown('');
        lastProcessedNotesRef.current = completeNotes;
      }
    } else if (showCompleteDialog && !completeNotes) {
      setCompleteNotesMarkdown('');
      lastProcessedNotesRef.current = undefined;
    }
  }, [showCompleteDialog, completeNotes]);

  // Converter HTML para Markdown quando abrir o modal de edição
  useEffect(() => {
    if (showEditNotesDialog && editNotes) {
      // Se contém HTML, converter para Markdown
      if (editNotes && /<[a-z][\s\S]*>/i.test(editNotes)) {
        try {
          const turndownService = new TurndownService();
          const markdown = turndownService.turndown(editNotes);
          setEditNotesMarkdown(markdown);
          lastProcessedEditNotesRef.current = editNotes;
        } catch (error) {
          console.error('Erro ao converter HTML para Markdown:', error);
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = editNotes;
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          setEditNotesMarkdown(textContent);
          lastProcessedEditNotesRef.current = editNotes;
        }
      } else if (editNotes) {
        setEditNotesMarkdown(editNotes);
        lastProcessedEditNotesRef.current = editNotes;
      } else {
        setEditNotesMarkdown('');
        lastProcessedEditNotesRef.current = editNotes;
      }
    } else if (showEditNotesDialog && !editNotes) {
      setEditNotesMarkdown('');
      lastProcessedEditNotesRef.current = undefined;
    }
  }, [showEditNotesDialog, editNotes]);

  const handleNotesChange = async (markdownValue: string | undefined) => {
    const value = markdownValue || '';
    setCompleteNotesMarkdown(value);
    try {
      const htmlValue = value ? await marked(value) : '';
      setCompleteNotes(htmlValue);
      lastProcessedNotesRef.current = htmlValue;
    } catch (error) {
      setCompleteNotes(value);
      lastProcessedNotesRef.current = value;
    }
  };

  const handleEditNotesChange = async (markdownValue: string | undefined) => {
    const value = markdownValue || '';
    setEditNotesMarkdown(value);
    try {
      const htmlValue = value ? await marked(value) : '';
      setEditNotes(htmlValue);
      lastProcessedEditNotesRef.current = htmlValue;
    } catch (error) {
      setEditNotes(value);
      lastProcessedEditNotesRef.current = value;
    }
  };

  const handleUpdateNotes = async () => {
    if (!showEditNotesDialog) return;

    try {
      // Atualizar notas
      await updateNotesMutation.mutateAsync({
        type: showEditNotesDialog.activityType,
        notes: editNotes.trim(),
      });

      // Se o responsável foi alterado e o usuário é admin, atualizar também
      if (isAdmin) {
        const activity = getActivityByType(showEditNotesDialog.activityType);
        const currentAssigneeId = activity ? getUserId(activity.assignedTo) : null;
        if (editAssignee && activity && currentAssigneeId !== editAssignee) {
          await changeAssigneeMutation.mutateAsync({
            type: showEditNotesDialog.activityType,
            assignedTo: editAssignee,
          });
        }
      }

      toast.success("Nota atualizada com sucesso");
      setShowEditNotesDialog(null);
      setEditNotes("");
      setEditNotesMarkdown("");
      setEditAssignee("");
      lastProcessedEditNotesRef.current = undefined;
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar nota");
    }
  };

  const handleCompleteActivity = async () => {
    if (!showCompleteDialog || !completeStatus) {
      toast.error("Selecione o status da atividade");
      return;
    }

    if (completeStatus === "LOSS" && !completeLossReason) {
      toast.error("Selecione o motivo da perda");
      return;
    }

    try {
      await completeActivityMutation.mutateAsync({
        type: showCompleteDialog,
        notes: completeNotes.trim() || undefined,
        status: completeStatus,
        lossReason: completeStatus === "LOSS" ? completeLossReason : undefined,
      });
      toast.success("Atividade concluída com sucesso");
      setShowCompleteDialog(null);
      setCompleteNotes("");
      setCompleteNotesMarkdown("");
      setCompleteStatus("");
      setCompleteLossReason("");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao concluir atividade");
    }
  };

  const handleChangeAssignee = async () => {
    if (!showChangeAssigneeDialog || !newAssignee) {
      toast.error("Selecione o novo responsável");
      return;
    }

    try {
      await changeAssigneeMutation.mutateAsync({
        type: showChangeAssigneeDialog,
        assignedTo: newAssignee,
      });
      toast.success("Responsável alterado com sucesso");
      setShowChangeAssigneeDialog(null);
      setNewAssignee("");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao alterar responsável");
    }
  };

  const getActivityByType = (type: ActivityType): Activity | undefined => {
    return activities.find((a) => a.type === type);
  };

  // Helper para extrair ID de assignedTo, assignedBy ou completedBy (pode ser string ou objeto)
  const getUserId = (user: string | { _id: string; email?: string } | null | undefined): string | null => {
    if (!user) return null;
    if (typeof user === "string") return user;
    return user._id;
  };

  // Helper para extrair email de assignedTo, assignedBy ou completedBy (pode ser string ou objeto)
  const getUserEmail = (user: string | { _id: string; email?: string } | null | undefined): string => {
    if (!user) return "-";
    if (typeof user === "string") {
      const foundUser = usersData?.users?.find((u) => u._id === user);
      return foundUser?.email || user;
    }
    return user.email || user._id;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Hoje";
    } else if (diffDays === 1) {
      return "Ontem";
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    }
    
    const day = date.getDate();
    const month = date.toLocaleDateString("pt-BR", { month: "long" });
    const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${day} de ${month}${date.getHours() || date.getMinutes() ? ` às ${time}` : ""}`;
  };

  // Combinar atividades e decisões em uma timeline
  interface TimelineEvent {
    id: string;
    type: "activity" | "decision" | "stage_change";
    date: string;
    title: string;
    user?: string;
    notes?: string;
    isCompleted?: boolean;
    activityType?: ActivityType;
    activityId?: string; // ID da atividade para edição
    assignedTo?: string; // ID do responsável pela atividade
    activityStatus?: "APPROVE" | "LOSS"; // Status da atividade (APPROVE ou LOSS)
    lossReason?: string; // Motivo da recusa da atividade
    stage?: StageProcess;
    status?: "APPROVED" | "REJECTED";
    rejectionReason?: string;
    rejectionDescription?: string;
  }

  const buildTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Adicionar atividades - mostrar apenas um evento por atividade
    activities.forEach((activity) => {
      // Se a atividade está concluída, mostrar apenas o evento de conclusão
      if (activity.isCompleted && activity.completedAt) {
        const activityLabel = ACTIVITY_TYPES.find((t) => t.value === activity.type)?.label || activity.type;
        
        events.push({
          id: `activity-${activity.type}-completed`,
          type: "activity",
          date: activity.completedAt,
          title: activityLabel, // Título sem status
          user: activity.completedBy ? getUserEmail(activity.completedBy) : undefined,
          notes: activity.notes || undefined,
          isCompleted: true,
          activityType: activity.type,
          activityId: activity._id, // ID da atividade para edição
          assignedTo: getUserId(activity.assignedTo) || undefined, // ID do responsável
          activityStatus: activity.status, // Status da atividade
          lossReason: activity.lossReason || undefined, // Motivo da recusa
        });
      } else {
        // Se não está concluída, mostrar apenas o evento de criação
        events.push({
          id: `activity-${activity.type}-created`,
          type: "activity",
          date: activity.createdAt,
          title: ACTIVITY_TYPES.find((t) => t.value === activity.type)?.label || activity.type,
          user: getUserEmail(activity.assignedTo),
          notes: activity.notes || undefined,
          activityType: activity.type,
          isCompleted: false,
          activityId: activity._id, // ID da atividade para edição
          assignedTo: getUserId(activity.assignedTo) || undefined, // ID do responsável
        });
      }
    });

    // Adicionar decisões do processo
    if (processDecisions?.history) {
      processDecisions.history.forEach((decision, index) => {
        const stageLabel = decision.stage ? getStageLabel(decision.stage) : "";
        const statusValue = decision.status as string;
        const statusLabel = statusValue === "APPROVED" ? "Aprovado" : statusValue === "LOSS" || statusValue === "REJECTED" ? "Recusado" : "";
        
        // Só adicionar decisões que tenham um status válido ou um stage definido
        // Evitar mostrar "Decisão" genérico sem informações úteis
        if (statusValue || decision.stage) {
          let title = "";
          if (stageLabel && statusLabel) {
            title = `${stageLabel} - ${statusLabel}`;
          } else if (statusLabel) {
            title = statusLabel;
          } else if (stageLabel) {
            title = stageLabel;
          } else {
            // Se não tem nem stage nem status, não adicionar à timeline
            return;
          }
          
          events.push({
            id: `decision-${processDecisions._id}-${index}`,
            type: "decision",
            date: decision.createdAt,
            title: title,
            user: decision.user_id ? getUserEmail(decision.user_id) : undefined,
            stage: decision.stage,
            status: (statusValue === "APPROVED" ? "APPROVED" : statusValue === "LOSS" || statusValue === "REJECTED" ? "REJECTED" : undefined) as "APPROVED" | "REJECTED" | undefined,
            rejectionReason: decision.rejection_reason,
            rejectionDescription: decision.rejection_description,
          });
        }
      });
    }

    // Ordenar por data (mais recente primeiro)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineEvents = buildTimeline();

  return (
    <>
      <div className={`h-full flex flex-col ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <div className="px-6 pt-6 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"
              }`}>
                <ClipboardList className={`h-4 w-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Atividades
              </h3>
            </div>
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="h-8 px-3 text-xs"
                disabled={createActivityMutation.isPending}
              >
                <Plus className="h-3 w-3 mr-1" />
                Nova
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {timelineEvents.length === 0 ? (
            <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma atividade ou decisão registrada</p>
            </div>
          ) : (
            <div className="relative">
              <div className="space-y-0">
                {timelineEvents.map((event, index) => {
                  const isFirstActivity = index === 0 && event.type === "activity";
                  const isLastActivity = index === timelineEvents.length - 1 && event.type === "activity";
                  const getEventIcon = () => {
                    if (event.type === "activity") {
                      // Sempre usar ícone de check quando concluída, ou sino quando pendente
                      if (event.isCompleted) {
                        return <CheckCircle2 className="h-4 w-4" />;
                      }
                      return <Bell className="h-4 w-4" />;
                    }
                    if (event.type === "decision") {
                      if (event.status === "APPROVED") {
                        return <CheckCircle2 className="h-4 w-4" />;
                      }
                      if (event.status === "REJECTED") {
                        return <XCircle className="h-4 w-4" />;
                      }
                      return <Clock className="h-4 w-4" />;
                    }
                    return <ArrowUp className="h-4 w-4" />;
                  };

                  const getEventIconColor = () => {
                    if (event.type === "activity") {
                      // Sempre verde quando concluída, cinza quando pendente
                      if (event.isCompleted) {
                        return theme === "dark" ? "text-green-400" : "text-green-600";
                      }
                      return theme === "dark" ? "text-gray-400" : "text-gray-500";
                    }
                    if (event.type === "decision") {
                      if (event.status === "APPROVED") {
                        return theme === "dark" ? "text-green-400" : "text-green-600";
                      }
                      if (event.status === "REJECTED") {
                        return theme === "dark" ? "text-red-400" : "text-red-600";
                      }
                      return theme === "dark" ? "text-gray-400" : "text-gray-500";
                    }
                    return theme === "dark" ? "text-blue-400" : "text-blue-600";
                  };

                  const getEventIconBg = () => {
                    if (event.type === "activity") {
                      if (event.isCompleted) {
                        // Se a atividade está concluída, verificar o status
                        if (event.activityStatus === "LOSS") {
                          return theme === "dark" ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-200";
                        }
                        // APPROVE ou sem status definido
                        return theme === "dark" ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200";
                      }
                      return theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200";
                    }
                    if (event.type === "decision") {
                      if (event.status === "APPROVED") {
                        return theme === "dark" ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200";
                      }
                      if (event.status === "REJECTED") {
                        return theme === "dark" ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-200";
                      }
                      return theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200";
                    }
                    return theme === "dark" ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200";
                  };

                  // Renderizar cards de notas para atividades
                  if (event.type === "activity") {
                    const activity = getActivityByType(event.activityType!);
                    const assignedByUser = activity?.assignedBy && typeof activity.assignedBy === 'object' ? activity.assignedBy : null;
                    
                    // Determinar cor da linha baseada no status
                    const getLineColor = () => {
                      if (!event.isCompleted) return theme === "dark" ? "#4b5563" : "#d1d5db";
                      if (event.activityStatus === "LOSS") return "#dc2626"; // Vermelho para recusado
                      if (event.activityStatus === "APPROVE") return "#16a34a"; // Verde para aprovado
                      return theme === "dark" ? "#4b5563" : "#d1d5db";
                    };
                    
                    return (
                      <div key={event.id} className="mb-4 relative pl-8">
                        {/* Segmento de linha pontilhada para esta atividade - mostra o status (vermelho se recusado) */}
                        {/* O segmento começa do topo (primeira atividade) ou do ponto, e vai até o próximo ponto ou final */}
                        <div 
                          className="absolute left-0"
                          style={{
                            left: '18px',
                            width: '1px',
                            top: isFirstActivity ? '0px' : '16px', // Primeira começa do topo, outras do ponto
                            bottom: isLastActivity ? '0px' : '-16px', // Vai até o próximo ponto
                            borderLeft: `1px dashed ${getLineColor()}`,
                            marginLeft: '-0.5px',
                            zIndex: 1,
                          }}
                        />
                        
                        {/* Ponto na linha da timeline - verde quando aprovado, vermelho quando recusado, cinza quando pendente */}
                        <div className={`absolute left-0 top-4 w-3 h-3 rounded-full border-2 z-10 ${
                          event.isCompleted
                            ? event.activityStatus === "LOSS"
                              ? "bg-red-500 border-red-600"
                              : "bg-green-500 border-green-600"
                            : theme === "dark" ? "bg-gray-500 border-gray-500" : "bg-gray-400 border-gray-400"
                        }`} style={{ left: '18px', marginLeft: '-6px' }} />
                        
                        {/* Card de nota */}
                        <div className={`rounded-lg border overflow-hidden ${
                          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white shadow-sm"
                        }`}>
                          {/* Header do card (fundo branco) */}
                          <div className={`px-4 py-3 border-b ${
                            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                          }`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Ícone - círculo verde com checkmark branco quando concluída */}
                                {event.type === "activity" && event.isCompleted ? (
                                  <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                  </div>
                                ) : (
                                  <div className={`flex-shrink-0 mt-0.5 ${getEventIconColor()}`}>
                                    {getEventIcon()}
                                  </div>
                                )}
                                
                                {/* Título e informações */}
                                <div className="flex-1 min-w-0">
                                  <div className={`font-semibold text-sm ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                                    {event.title}
                                  </div>
                                  <div className={`text-xs mt-1 flex items-center gap-2 flex-wrap ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                    <span>{formatDateShort(event.date)}</span>
                                    {event.user && (
                                      <>
                                        <span>·</span>
                                        <span>{event.user}</span>
                                      </>
                                    )}
                                    {assignedByUser && (
                                      <>
                                        <span>·</span>
                                        <div className="flex items-center gap-1">
                                          <Building2 className="h-3 w-3" />
                                          <span>Oficial - {assignedByUser.name || assignedByUser.email}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Menu de opções */}
                              {event.activityType && 
                               (isAdmin || (event.assignedTo && user?._id === event.assignedTo)) && (
                                <div className="flex-shrink-0">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-7 w-7 p-0 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                                      >
                                        <MoreVertical className={`h-4 w-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className={theme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
                                      {!event.isCompleted && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setShowCompleteDialog(event.activityType!);
                                            setCompleteNotes(event.notes || "");
                                            setCompleteNotesMarkdown("");
                                            setCompleteStatus("");
                                            setCompleteLossReason("");
                                            lastProcessedNotesRef.current = undefined;
                                          }}
                                          className={theme === "dark" ? "text-gray-200 hover:bg-gray-700" : ""}
                                        >
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                          Marcar como concluída
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        onClick={() => {
                                          const activity = getActivityByType(event.activityType!);
                                          setShowEditNotesDialog({
                                            activityType: event.activityType!,
                                            currentNotes: event.notes || "",
                                          });
                                          setEditNotes(event.notes || "");
                                          // Só setar o responsável se o usuário for admin
                                          if (isAdmin) {
                                            setEditAssignee(getUserId(activity?.assignedTo) || "");
                                          } else {
                                            setEditAssignee("");
                                          }
                                        }}
                                        className={theme === "dark" ? "text-gray-200 hover:bg-gray-700" : ""}
                                      >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        {event.notes ? "Editar Nota" : "Adicionar Nota"}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Conteúdo do card (fundo amarelo claro) */}
                          <div className={`px-4 py-3 ${theme === "dark" ? "bg-gray-800/50" : "bg-yellow-50"}`}>
                            {/* Notas */}
                            {event.notes && (
                              <div 
                                dangerouslySetInnerHTML={{ __html: event.notes }} 
                                className={`text-sm ${
                                  theme === "dark" 
                                    ? "text-gray-300" 
                                    : "text-gray-900"
                                }`}
                                style={{
                                  lineHeight: '1.6',
                                  whiteSpace: 'pre-wrap',
                                }}
                              />
                            )}
                            
                            {/* Motivo de rejeição */}
                            {event.activityStatus === "LOSS" && event.lossReason && (
                              <div className={`mt-2 pt-2 border-t ${
                                theme === "dark" ? "border-red-800" : "border-red-200"
                              }`}>
                                <div className={`font-semibold text-sm ${theme === "dark" ? "text-red-300" : "text-red-700"}`}>
                                  Motivo: {event.lossReason}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Para decisões, manter o formato de timeline
                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Ícone na timeline */}
                      <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventIconBg()} ${getEventIconColor()}`}>
                        {getEventIcon()}
                      </div>
                      
                      {/* Conteúdo do evento */}
                      <div className="flex-1 min-w-0 pb-4">
                        <div className={`flex items-start justify-between gap-2 mb-1`}>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                              {event.title}
                            </div>
                            <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                              {formatDateShort(event.date)}
                              {event.user && ` · ${event.user}`}
                            </div>
                          </div>
                        </div>
                        
                        {/* Motivo de rejeição da decisão */}
                        {event.type === "decision" && event.status === "REJECTED" && event.rejectionReason && (
                          <div className={`mt-2 p-3 rounded text-xs ${
                            theme === "dark" ? "bg-red-900/20 border border-red-700" : "bg-red-50 border border-red-200"
                          }`}>
                            <div className={`font-semibold mb-1 ${theme === "dark" ? "text-red-300" : "text-red-700"}`}>
                              Motivo: {event.rejectionReason}
                            </div>
                            {event.rejectionDescription && (
                              <div className={theme === "dark" ? "text-red-200" : "text-red-600"}>
                                {event.rejectionDescription}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para criar atividade */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}>
          <DialogHeader>
            <DialogTitle className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
              Criar Nova Atividade
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Tipo de Atividade
              </Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as ActivityType)}
              >
                <SelectTrigger className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Responsável
              </Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {usersData?.users?.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateActivity}
              disabled={!selectedType || !selectedAssignee || createActivityMutation.isPending}
            >
              {createActivityMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para concluir atividade */}
      <Dialog open={!!showCompleteDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCompleteDialog(null);
          setCompleteNotes("");
          setCompleteNotesMarkdown("");
          setCompleteStatus("");
          setCompleteLossReason("");
          lastProcessedNotesRef.current = undefined;
        }
      }}>
        <DialogContent className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}>
          <DialogHeader>
            <DialogTitle className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
              Concluir Atividade
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {showCompleteDialog &&
                `Deseja concluir a atividade de ${ACTIVITY_TYPES.find((t) => t.value === showCompleteDialog)?.label}?`}
            </p>
            
            <div>
              <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Status *
              </Label>
              <Select value={completeStatus} onValueChange={(value) => {
                setCompleteStatus(value as "APPROVE" | "LOSS");
                if (value === "APPROVE") {
                  setCompleteLossReason("");
                }
              }}>
                <SelectTrigger className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVE">Aprovar</SelectItem>
                  <SelectItem value="LOSS">Recusar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {completeStatus === "LOSS" && (
              <div>
                <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                  Motivo da Recusa *
                </Label>
                <Select value={completeLossReason} onValueChange={setCompleteLossReason}>
                  <SelectTrigger className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonLossData?.reasonLoss?.map((reason) => (
                      <SelectItem key={reason._id} value={reason.label}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Notas (opcional)
              </Label>
              <div className="mt-2" data-color-mode={theme}>
                <MDEditor
                  value={completeNotesMarkdown}
                  onChange={handleNotesChange}
                  preview="edit"
                  height={300}
                  visibleDragbar={false}
                  data-color-mode={theme}
                />
              </div>
              <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                Você pode usar formatação Markdown (negrito, itálico, listas, etc.)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCompleteDialog(null);
              setCompleteNotes("");
              setCompleteNotesMarkdown("");
              setCompleteStatus("");
              setCompleteLossReason("");
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCompleteActivity}
              disabled={completeActivityMutation.isPending || !completeStatus || (completeStatus === "LOSS" && !completeLossReason)}
            >
              {completeActivityMutation.isPending ? "Concluindo..." : "Concluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para alterar responsável */}
      <Dialog open={!!showChangeAssigneeDialog} onOpenChange={(open) => !open && setShowChangeAssigneeDialog(null)}>
        <DialogContent className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}>
          <DialogHeader>
            <DialogTitle className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
              Alterar Responsável
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {showChangeAssigneeDialog &&
                `Selecione o novo responsável para a atividade de ${ACTIVITY_TYPES.find((t) => t.value === showChangeAssigneeDialog)?.label}`}
            </p>
            <div>
              <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Novo Responsável
              </Label>
              <Select value={newAssignee} onValueChange={setNewAssignee}>
                <SelectTrigger className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {usersData?.users?.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeAssigneeDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleChangeAssignee}
              disabled={!newAssignee || changeAssigneeMutation.isPending}
            >
              {changeAssigneeMutation.isPending ? "Alterando..." : "Alterar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar nota */}
      <Dialog open={!!showEditNotesDialog} onOpenChange={(open) => {
        if (!open) {
          setShowEditNotesDialog(null);
          setEditNotes("");
          setEditNotesMarkdown("");
          setEditAssignee("");
          lastProcessedEditNotesRef.current = undefined;
        }
      }}>
        <DialogContent className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}>
          <DialogHeader>
            <DialogTitle className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
              Editar Nota
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {showEditNotesDialog &&
                `Edite a nota da atividade de ${ACTIVITY_TYPES.find((t) => t.value === showEditNotesDialog.activityType)?.label}`}
            </p>
            
            {isAdmin && (
              <div>
                <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                  Responsável
                </Label>
                <Select value={editAssignee} onValueChange={setEditAssignee}>
                  <SelectTrigger className={theme === "dark" ? "bg-gray-700 border-gray-600" : ""}>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData?.users?.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                Notas
              </Label>
              <div className="mt-2" data-color-mode={theme}>
                <MDEditor
                  value={editNotesMarkdown}
                  onChange={handleEditNotesChange}
                  preview="edit"
                  height={300}
                  visibleDragbar={false}
                  data-color-mode={theme}
                />
              </div>
              <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                Você pode usar formatação Markdown (negrito, itálico, listas, etc.)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditNotesDialog(null);
              setEditNotes("");
              setEditNotesMarkdown("");
              setEditAssignee("");
              lastProcessedEditNotesRef.current = undefined;
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateNotes}
              disabled={updateNotesMutation.isPending}
            >
              {updateNotesMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

