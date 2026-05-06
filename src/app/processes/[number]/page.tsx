"use client";

import { useAddPipedriveNote } from "@/app/api/hooks/process/useAddPipedriveNote";
import { useMarkMovementsAsViewed } from "@/app/api/hooks/process/useMarkMovementsAsViewed";
import { useProcessReopen } from "@/app/api/hooks/process/useProcessReopen";
import { useUpdateProcessForm } from "@/app/api/hooks/process/useUpdateProcessForm";
import { useInsertExecution } from "@/app/api/hooks/processes/useInsertExecution";
import { useRemoveProvisionalLawsuit } from "@/app/api/hooks/processes/useRemoveProvisionalLawsuit";
import { useRunLawsuits } from "@/app/api/hooks/run-lawsuit/useRunLawsuits";
import { useProcessAutoRefresh } from "@/app/hooks/useProcessAutoRefresh";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import {
  Company,
  DocumentExtract,
  PeticaoInicialData,
  Process,
  ProcessStatusEnum,
} from "@/app/interfaces/processes";
import { UserRolesEnum } from "@/app/interfaces/user";
import { mascararCNPJ } from "@/app/utils/masks";
import {
  getClaimant,
  getClaimantAttorney,
  getDefendant,
  getProcessTitle,
} from "@/app/utils/processPartsUtils";
import {
  canSync,
  getStatusColor,
  getSyncStatusDescription,
  getSyncType,
  hasError,
  isIntermediateStatus,
  isProcessing,
  isSyncCompleted,
  shouldContinueMonitoring,
} from "@/app/utils/processSyncStatus";
import { getEsteiraLabel, getStageLabel } from "@/app/utils/processUtils";
import { MainShell } from "@/components/layout/MainShell";
import {
  DocumentsCardSkeleton,
  ProcessHeaderSkeleton,
  TimelineCardSkeleton,
} from "@/components/Loading";
import { ActivitiesCard } from "@/components/process/ActivitiesCard";
import { ChangeStageDialog } from "@/components/process/ChangeStageDialog";
import { CompanyModalDialog } from "@/components/process/CompanyModalDialog";
import { DocumentsCard } from "@/components/process/DocumentsCard";
import { PipedriveFormData } from "@/components/process/PipedriveFormCard";
import { ProcessHeader } from "@/components/process/ProcessHeader";
import { ProcessInfoCard } from "@/components/process/ProcessInfoCard";
import { ProcessInstanceCard } from "@/components/process/ProcessInstanceCard";
import { SyncOptionsModal } from "@/components/process/SyncOptionsModal";
import { InstanceEnum, TimelineCard } from "@/components/process/TimelineCard";
import { ProcessOwnerSelector } from "@/components/ProcessOwnerSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Calendar,
  Check,
  ClipboardList,
  FileText,
  Link2,
  RefreshCw,
  Scale,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function ProcessDetailsEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.number as string;
  const searchParams = useSearchParams();

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleStatusChange = (oldStatus: any, newStatus: any) => {
    setCurrentStatusInfo({
      name: newStatus.name,
      log: newStatus.log,
      errorReason: newStatus.errorReason,
      updatedAt: newStatus.updatedAt,
    });

    if (isProcessing(oldStatus) && !isProcessing(newStatus)) {
      setPreviousStatus(oldStatus);
    }
  };

  const {
    process,
    isLoading,
    error,
    refetch: refetchProcess,
    isRefetching,
  } = useProcessAutoRefresh({
    processId: id,
    enabled: false,
    intervalMs: 10000,
    onStatusChange: handleStatusChange,
  });

  const addNoteMutation = useAddPipedriveNote();

  // Nova lógica baseada em oldMoviments - compara length atual com contagem antiga
  const getNewMovements = () => {
    // Se não houver movimentos ou oldMoviments não existir, retornar vazio
    if (!process?.moviments) {
      return {
        PRIMEIRO_GRAU: [],
        SEGUNDO_GRAU: [],
        TST: [],
      };
    }

    // Se oldMoviments não existir OU todos os valores forem null, não há movimentações não lidas
    if (
      !process.oldMoviments ||
      (process.oldMoviments.primeiroGrau === null &&
        process.oldMoviments.segundoGrau === null &&
        process.oldMoviments.tst === null)
    ) {
      return {
        PRIMEIRO_GRAU: [],
        SEGUNDO_GRAU: [],
        TST: [],
      };
    }

    // Filtrar movimentos por instância (ordem DESC - mais recentes primeiro)
    const firstDegreeMovs = process.moviments.filter(
      (m) => m.instancia === InstanceEnum.FIRST_INSTANCE,
    );
    const secondDegreeMovs = process.moviments.filter(
      (m) => m.instancia === InstanceEnum.SECOND_INSTANCE,
    );
    const tstMovs = process.autosData?.movements || [];

    // Pegar contagem antiga (quantos tinha antes da última sincronização)
    // Se for null, significa que não há base de comparação, então não marca como novo
    const oldFirst = process.oldMoviments.primeiroGrau;
    const oldSecond = process.oldMoviments.segundoGrau;
    const oldTst = process.oldMoviments.tst;

    // Calcular quantidade de movimentos novos
    // Se oldMoviments for null para uma instância, não há movimentos novos para ela
    // Se length atual > oldMoviments, os primeiros (length - oldMoviments) são novos
    const countNewFirst =
      oldFirst !== null ? Math.max(0, firstDegreeMovs.length - oldFirst) : 0;
    const countNewSecond =
      oldSecond !== null ? Math.max(0, secondDegreeMovs.length - oldSecond) : 0;
    const countNewTst =
      oldTst !== null ? Math.max(0, tstMovs.length - oldTst) : 0;

    // Retornar apenas os movimentos novos (os primeiros N da lista DESC)
    const newFirstDegree = firstDegreeMovs.slice(0, countNewFirst);
    const newSecondDegree = secondDegreeMovs.slice(0, countNewSecond);
    const newTst = tstMovs.slice(0, countNewTst);

    return {
      PRIMEIRO_GRAU: newFirstDegree,
      SEGUNDO_GRAU: newSecondDegree,
      TST: newTst,
    };
  };

  const newMovements = getNewMovements();

  // Verificar se há movimentos para cada instância
  const hasSecondDegreeMovements =
    process?.moviments?.some(
      (m) => m.instancia === InstanceEnum.SECOND_INSTANCE,
    ) || false;

  const isProcessLoaded = !!process && Object.keys(process).length > 0;
  const hasRequiredData =
    process?.documents && Array.isArray(process.documents);
  const isProcessError =
    !!error ||
    (!isLoading && !isProcessLoaded) ||
    (process && !hasRequiredData);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [showChangeStageDialog, setShowChangeStageDialog] = useState(false);
  const [lastProcessData, setLastProcessData] = useState<any>(null);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [pendingProcessData, setPendingProcessData] = useState<any>(null);
  const [currentStatusInfo, setCurrentStatusInfo] = useState<{
    name: string;
    log?: string;
    errorReason?: string;
    updatedAt: string;
  } | null>(null);
  const [, setPreviousStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const initialRightTab = useMemo<"documents" | "activities">(() => {
    const tab = searchParams.get("tab");
    return tab === "activities" ? "activities" : "documents";
  }, [searchParams]);

  const [showSyncCompleteDialog, setShowSyncCompleteDialog] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [activeRightTab, setActiveRightTab] = useState<
    "documents" | "activities"
  >(initialRightTab);
  const [activeInstance, setActiveInstance] = useState<
    "1grau" | "2grau" | "tst"
  >("1grau");
  const [showProcessInfoModal, setShowProcessInfoModal] = useState(false);
  const [showAssignMemberModal, setShowAssignMemberModal] = useState(false);
  const [
    showRemoveProvisionalLinkConfirm,
    setShowRemoveProvisionalLinkConfirm,
  ] = useState(false);
  const [
    showLinkProvisionalExecutionModal,
    setShowLinkProvisionalExecutionModal,
  ] = useState(false);
  const [linkedDocuments, setLinkedDocuments] = useState<DocumentExtract[]>([]);
  const [executionNumberInput, setExecutionNumberInput] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedClaimant, setEditedClaimant] = useState("");
  const [editedDefendant, setEditedDefendant] = useState("");
  const claimantInputRef = useRef<HTMLInputElement>(null);
  const defendantInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "activities" || tab === "documents") {
      setActiveRightTab(tab);
    }
  }, [searchParams]);

  const runLawsuitsMutation = useRunLawsuits();
  const {
    insertExecution,
    isLoading: isInsertExecutionLoading,
    success: insertExecutionSuccess,
  } = useInsertExecution();
  const updateProcessFormMutation = useUpdateProcessForm(process?.number);

  const [formState, setFormState] = useState<PipedriveFormData>({
    title: "",
    processNumber: "",
    executionNumber: "",
    duplicated: "",
    dl: "",
    firstDegree: "",
    secondDefendantResponsibility: "",
    defendants: "",
    analysis: "",
    prazo: "",
    abatimento: "",
    observacao: "",
    calculoAutos: "",
    calculoAutosValue: "",
    calculoHomologado: "",
    execucaoProvisoria: "",
    sucumbencia: "",
    freeJustice: "",
    conclusion: "",
    observacaoPreAnalise: "",
    value: "",
  });
  const processReopenMutation = useProcessReopen(process?._id);
  const removeProvisionalLawsuitMutation = useRemoveProvisionalLawsuit();
  const markMovementsAsViewedMutation = useMarkMovementsAsViewed();

  const isAdmin = user?.role === UserRolesEnum.ADMIN;

  const handleMarkAsViewed = (instance: "PRIMEIRO_GRAU" | "SEGUNDO_GRAU") => {
    if (!process?.number) return;

    markMovementsAsViewedMutation.mutate(
      {
        processNumber: process.number,
        instance,
      },
      {
        onSuccess: () => {
          toast.success("Movimentações marcadas como visualizadas");
          refetchProcess();
        },
        onError: () => {
          toast.error("Erro ao marcar movimentações como visualizadas");
        },
      },
    );
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  const handleDocumentClick = (documento: DocumentExtract) => {
    if (!process?.number) return;
    if (!documento?._id) {
      // Limpar seleção se documento não tiver _id
      setSelectedDocumentId(null);
      return;
    }
    setSelectedDocumentId(documento._id);
    // Mudar para a aba de Documentos
    setActiveRightTab("documents");
    // Atualizar a URL com o parâmetro tab=documents
    router.push(`/processes/${process.number}?tab=documents`, {
      scroll: false,
    });
  };

  const handleMovementClick = (mov: any) => {
    if (!process?.documents) return;

    // Try to match documents by date similarity (find all matching documents)
    const movementDate = mov.data;
    const matchingDocs = process.documents.filter((doc) => {
      const docDate = doc.date;
      // Simple match: check if dates are similar (same day/month/year)
      // Extract just the date part (YYYY-MM-DD or DD/MM/YYYY) ignoring time
      const normalizeDate = (dateStr: string) => {
        if (!dateStr) return "";
        // If format is "DD/MM/YYYY HH:MM:SS" or similar
        const parts = dateStr.split(" ");
        const dateOnly = parts[0];
        // Check if Brazilian format DD/MM/YYYY
        if (dateOnly.includes("/")) {
          const [day, month, year] = dateOnly.split("/");
          return `${year}-${month}-${day}`;
        }
        // If already in ISO format YYYY-MM-DD
        return dateOnly.substring(0, 10);
      };

      const normalizedMovDate = normalizeDate(movementDate);
      const normalizedDocDate = normalizeDate(docDate);

      return (
        normalizedMovDate &&
        normalizedDocDate &&
        normalizedMovDate === normalizedDocDate
      );
    });

    if (matchingDocs.length > 0) {
      setLinkedDocuments(matchingDocs);
      // Se só houver um documento, seleciona para mostrar o viewer inline
      if (matchingDocs.length === 1) {
        setSelectedDocumentId(matchingDocs[0]._id);
      } else {
        // Se houver múltiplos, mostra a lista e deixa o usuário escolher
        setSelectedDocumentId(null);
      }
    } else {
      setLinkedDocuments([]);
    }
  };

  const updateFormMutation = useUpdateProcessForm(process?.number);

  function handleReopen() {
    processReopenMutation.mutate(undefined, {
      onSuccess: async () => {
        toast.success("Processo reaberto com sucesso!");
        await refetchProcess();
      },
      onError: () => {
        toast.error("Erro ao reabrir processo");
      },
    });
  }

  const handleRemoveProvisionalLink = () => {
    setShowRemoveProvisionalLinkConfirm(true);
  };

  const handleConfirmRemoveProvisionalLink = async () => {
    if (!process?._id) return;

    setShowRemoveProvisionalLinkConfirm(false);

    try {
      await removeProvisionalLawsuitMutation.mutateAsync({
        processId: process._id,
      });

      toast.success("Vínculo com execução provisória removido com sucesso!");
      await refetchProcess();
    } catch (error) {
      toast.error("Erro ao remover vínculo com execução provisória");
      console.error("Erro:", error);
    }
  };

  const handleLinkProvisionalExecution = () => {
    setShowLinkProvisionalExecutionModal(true);
  };

  const handleConfirmLinkProvisionalExecution = async () => {
    if (!process?._id || !executionNumberInput.trim()) {
      toast.error("Insira o número da execução provisória");
      return;
    }

    try {
      await insertExecution(
        process._id,
        executionNumberInput.trim(),
        executionNumberInput.trim(),
      );
      toast.success("Execução provisória vinculada com sucesso!");
      setShowLinkProvisionalExecutionModal(false);
      setExecutionNumberInput("");
      await refetchProcess();
    } catch (error) {
      toast.error("Erro ao vincular execução provisória");
      console.error("Erro:", error);
    }
  };

  const handleStartEditTitle = useCallback(() => {
    // Priorizar dados da Petição Inicial sobre processParts (mesma lógica do ProcessHeader)
    const initialPetition = process?.documents?.find(
      (doc) => doc.title === "Petição Inicial",
    );
    const initialPetitionData = initialPetition?.data as any;

    const claimant = getClaimant(process?.processParts || []);
    const defendant = getDefendant(process?.processParts || []);

    const claimantName =
      initialPetitionData?.qualificacao_reclamante?.nome_completo ||
      claimant?.nome ||
      "";
    const defendantName = defendant?.nome || "";

    // Separar título atual em reclamante e empresa
    const currentTitle = getProcessTitle(
      process?.processParts || [],
      process?.number,
      process?.title || (process as any)?.formPipedrive?.title,
      false, // não usar número como fallback para evitar preencher com o número do processo
    );

    if (
      currentTitle &&
      currentTitle.trim() &&
      currentTitle !== process?.number
    ) {
      // Tentar separar por VS, X, ou x
      const separators = [" VS ", " X ", " x "];
      let parts: string[] = [];

      for (const sep of separators) {
        if (currentTitle.includes(sep)) {
          parts = currentTitle.split(sep);
          break;
        }
      }

      if (parts.length >= 2) {
        setEditedClaimant(parts[0].trim());
        setEditedDefendant(parts.slice(1).join(" VS ").trim());
      } else if (currentTitle.trim()) {
        // Se não conseguiu separar, usa título completo no reclamante
        setEditedClaimant(currentTitle.trim());
        setEditedDefendant("");
      } else {
        // Fallback: usar nomes das partes
        setEditedClaimant(claimantName);
        setEditedDefendant(defendantName);
      }
    } else {
      // Se não tem título válido, usar nomes das partes (priorizando Petição Inicial)
      setEditedClaimant(claimantName);
      setEditedDefendant(defendantName);
    }

    setIsEditingTitle(true);
  }, [
    process?.title,
    process?.formPipedrive?.title,
    process?.processParts,
    process?.documents,
    process?.number,
  ]);

  const handleCancelEditTitle = useCallback(() => {
    setIsEditingTitle(false);
    setEditedClaimant("");
    setEditedDefendant("");
  }, []);

  const handleClaimantChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cursorPosition = e.target.selectionStart;
      setEditedClaimant(e.target.value);

      // Restaurar posição do cursor no próximo frame
      requestAnimationFrame(() => {
        if (claimantInputRef.current && cursorPosition !== null) {
          claimantInputRef.current.setSelectionRange(
            cursorPosition,
            cursorPosition,
          );
        }
      });
    },
    [],
  );

  const handleDefendantChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cursorPosition = e.target.selectionStart;
      setEditedDefendant(e.target.value);

      // Restaurar posição do cursor no próximo frame
      requestAnimationFrame(() => {
        if (defendantInputRef.current && cursorPosition !== null) {
          defendantInputRef.current.setSelectionRange(
            cursorPosition,
            cursorPosition,
          );
        }
      });
    },
    [],
  );

  const handleSaveTitle = useCallback(async () => {
    if (!process?.number) {
      toast.error("Número do processo não encontrado");
      return;
    }

    if (!editedClaimant.trim() && !editedDefendant.trim()) {
      toast.error("Preencha pelo menos um dos campos");
      return;
    }

    try {
      // Unificar reclamante e empresa em um único título
      let unifiedTitle = "";

      if (editedClaimant.trim() && editedDefendant.trim()) {
        unifiedTitle = `${editedClaimant.trim()} VS ${editedDefendant.trim()}`;
      } else if (editedClaimant.trim()) {
        unifiedTitle = editedClaimant.trim();
      } else {
        unifiedTitle = editedDefendant.trim();
      }

      await updateProcessFormMutation.mutateAsync({
        processNumber: process.number,
        formData: {
          title: unifiedTitle, // Título unificado
        },
      });

      setFormState((prev) => ({ ...prev, title: unifiedTitle }));
      setIsEditingTitle(false);
      toast.success("Título atualizado com sucesso!");
      await refetchProcess();
    } catch (error) {
      toast.error("Erro ao atualizar título");
      console.error("Erro:", error);
    }
  }, [
    process?.number,
    editedClaimant,
    editedDefendant,
    updateProcessFormMutation,
    refetchProcess,
  ]);

  const handleSyncConfirm = async (options: {
    movements: boolean;
    documents: boolean;
  }) => {
    try {
      if (!process?.number) {
        toast.error("Número do processo não encontrado.");
        return;
      }

      await runLawsuitsMutation.mutateAsync({
        lawsuits: [process.number],
        movements: options.movements,
        documents: options.documents,
      });
      setSyncModalOpen(false);

      // Limpar documentos vinculados e selecionados
      setLinkedDocuments([]);
      setSelectedDocumentId(null);

      await refetchProcess();

      // O toast será exibido automaticamente pelo useEffect que monitora o status
    } catch (error) {
      toast.error("Erro ao sincronizar processo.");
    }
  };

  const handleAcceptUpdate = () => {
    if (pendingProcessData) {
      setLastProcessData(pendingProcessData);
      setHasUnsavedChanges(false);
      setShowUpdateConfirmation(false);
      setPendingProcessData(null);

      toast.info("Dados atualizados com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleRejectUpdate = () => {
    setShowUpdateConfirmation(false);
    setPendingProcessData(null);

    toast.warning(
      "Atualização cancelada. Seus dados não salvos foram preservados.",
      {
        position: "top-right",
        autoClose: 4000,
      },
    );
  };

  const claimant = getClaimant(process?.processParts || []);
  const initialPetition = process?.documents?.find(
    (doc) => doc.title === "Petição Inicial",
  );
  const initialPetitionData = initialPetition?.data as
    | PeticaoInicialData
    | undefined;

  useEffect(() => {
    if (process && !lastProcessData) {
      setLastProcessData(process);
    }
  }, [process, lastProcessData]);

  // Efeito para selecionar automaticamente a Petição Inicial quando o processo carregar
  useEffect(() => {
    if (process?.documents && !selectedDocumentId) {
      const peticaoDoc = process.documents.find(
        (doc) => doc.title === "Petição Inicial" && doc.data,
      );

      if (peticaoDoc) {
        setSelectedDocumentId(peticaoDoc._id);
      }
    }
  }, [process?.documents, selectedDocumentId]);

  // Resetar para 1° grau se a instância ativa não existir mais
  useEffect(() => {
    if (activeInstance === "2grau" && !hasSecondDegreeMovements) {
      setActiveInstance("1grau");
    }
    if (activeInstance === "tst" && !process?.autosData) {
      setActiveInstance("1grau");
    }
  }, [activeInstance, hasSecondDegreeMovements, process?.autosData]);

  useEffect(() => {
    if (process?.processStatus && !currentStatusInfo) {
      setCurrentStatusInfo({
        name: process.processStatus.name,
        log: process.processStatus.log,
        errorReason: process.processStatus.errorReason,
        updatedAt: process.processStatus.updatedAt,
      });
    }
  }, [process?.processStatus, currentStatusInfo]);

  useEffect(() => {
    if (!process?.processStatus) return;

    const isCurrentlySyncing = isProcessing(process.processStatus);
    const isIntermediate = isIntermediateStatus(process.processStatus);
    const isFinalSyncCompleted = isSyncCompleted(process.processStatus);
    const hasErrorStatus = hasError(process.processStatus);

    if (isSyncing && !isCurrentlySyncing) {
      if (hasErrorStatus) {
        toast.error("Erro na sincronização do processo!", {
          position: "top-right",
          autoClose: 5000,
          toastId: "sync-error",
        });
        setShowSyncCompleteDialog(true);
        setIsSyncing(false);
      } else if (isIntermediate) {
        // Status intermediário - movimentações concluídas, mas continua para documentos
        toast.info(getSyncStatusDescription(process.processStatus), {
          position: "top-right",
          autoClose: 4000,
          toastId: "sync-movements-done",
        });
        // NÃO desliga o monitoramento - isSyncing permanece true
        // Polling continuará até chegar em "Extração finalizada"
        // NÃO abre o modal aqui - só quando finalizar completamente
      } else if (isFinalSyncCompleted) {
        // Sincronização completamente finalizada

        toast.success(
          `${getSyncStatusDescription(process.processStatus)} com sucesso!`,
          {
            position: "top-right",
            autoClose: 3000,
            toastId: "sync-success",
          },
        );

        // Agora sim, abre o modal e para o monitoramento
        setShowSyncCompleteDialog(true);
        setIsSyncing(false);
      }
    }

    if (!isSyncing && isCurrentlySyncing) {
      // Dismiss any existing sync toast before showing a new one
      toast.dismiss("sync-started");
      toast.info("Sincronização iniciada! Aguarde a conclusão...", {
        position: "top-right",
        autoClose: 3000,
        toastId: "sync-started",
      });
      setIsSyncing(true);
    }
  }, [process?.processStatus, isSyncing]);

  useEffect(() => {
    if (!isSyncing) return;
    if (!shouldContinueMonitoring(process?.processStatus)) {
      setIsSyncing(false);
      return;
    }

    const interval = setInterval(async () => {
      try {
        await refetchProcess();
      } catch (error) {}
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isSyncing, process?.processStatus, refetchProcess]);

  useEffect(() => {
    if (process && lastProcessData && !isEditing) {
      const expectedTitle = getProcessTitle(
        process?.processParts || [],
        process?.number,
        process?.title || process?.formPipedrive?.title,
        false, // Não usar número do processo como fallback
      );

      const hasFormChanges =
        formState.title !== expectedTitle ||
        formState.processNumber !==
          (process?.formPipedrive?.processNumber || process?.number || "") ||
        formState.executionNumber !==
          (process?.formPipedrive?.executionNumber ||
            process?.calledByProvisionalLawsuitNumber ||
            "") ||
        formState.observacao !==
          (process?.observation?.description ||
            process?.formPipedrive?.observacao ||
            "");

      setHasUnsavedChanges(hasFormChanges);
      setHasChanges(hasFormChanges);
    }
  }, [formState, process, lastProcessData, isEditing]);

  useEffect(() => {
    if (!process) return;

    if (isEditing) return;

    const processTitle = getProcessTitle(
      process?.processParts || [],
      process?.number,
      process?.title || process?.formPipedrive?.title,
      false, // Não usar número do processo como fallback
    );
    if (process?.formPipedrive) {
      setFormState({
        title: processTitle,
        processNumber:
          process?.formPipedrive?.processNumber || process?.number || "",
        executionNumber:
          process?.formPipedrive?.executionNumber ||
          process?.calledByProvisionalLawsuitNumber ||
          "",
        duplicated: process?.formPipedrive?.duplicated || "",
        dl: process?.formPipedrive?.dl || "",
        firstDegree: process?.formPipedrive?.firstDegree || "",
        secondDefendantResponsibility:
          process?.formPipedrive?.secondDefendantResponsibility || "",
        defendants:
          process?.companies
            ?.map((c) => {
              const solvencyParts: string[] = [];
              if (typeof c.score === "number")
                solvencyParts.push(`Score: ${c.score}`);
              if (c.porte) solvencyParts.push(`Porte: ${c.porte}`);
              if (c.registrationStatus)
                solvencyParts.push(`Registro: ${c.registrationStatus}`);
              if (c.specialRule)
                solvencyParts.push(`Solvência: ${c.specialRule}`);
              const solvency = solvencyParts.length
                ? ` - ${solvencyParts.join(" | ")}`
                : "";
              return `${c.name} (${mascararCNPJ(c.cnpj)})${solvency}`;
            })
            .join(", ") ||
          process?.formPipedrive?.defendants ||
          "",
        analysis: process?.formPipedrive?.analysis || "",
        prazo: process?.parametersStepDeadlineInMonths
          ? process.parametersStepDeadlineInMonths.toString()
          : process?.formPipedrive?.prazo || "",
        abatimento: process?.formPipedrive?.abatimento || "",
        observacao:
          process?.observation?.description ||
          process?.formPipedrive?.observacao ||
          "",
        observacaoPreAnalise:
          (process?.formPipedrive as any)?.observacaoPreAnalise || "",
        calculoAutos: (process?.formPipedrive as any)?.calculoAutos || "",
        calculoAutosValue:
          (process?.formPipedrive as any)?.calculoAutosValue || "",
        calculoHomologado:
          (process?.formPipedrive as any)?.calculoHomologado || "",
        execucaoProvisoria:
          (process?.formPipedrive as any)?.execucaoProvisoria || "",
        sucumbencia: (process?.formPipedrive as any)?.sucumbencia || "",
        freeJustice: (process?.formPipedrive as any)?.freeJustice || "",
        conclusion: (process?.formPipedrive as any)?.conclusion || "",
        value: (process?.formPipedrive as any)?.value || "",
        stageLabel: process?.stage,
      });
    } else {
      // Quando não tem formPipedrive, extrair defendants de processParts
      const defendantParts =
        process?.processParts?.filter(
          (part) =>
            part.polo === "PASSIVO" &&
            (part.tipo?.toLowerCase() === "reclamado" ||
              part.tipo?.toLowerCase() === "réu"),
        ) || [];

      const defendantNames = new Set(defendantParts.map((part) => part.nome));

      const defendantsFromParts = Array.from(defendantNames).map((name) => {
        const company = process?.companies?.find(
          (c) => c.name.toLowerCase() === name.toLowerCase(),
        );

        if (company) {
          const solvencyParts: string[] = [];
          if (typeof company.score === "number")
            solvencyParts.push(`Score: ${company.score}`);
          if (company.porte) solvencyParts.push(`Porte: ${company.porte}`);
          if (company.registrationStatus)
            solvencyParts.push(`Registro: ${company.registrationStatus}`);
          if (company.specialRule)
            solvencyParts.push(`Solvência: ${company.specialRule}`);
          const solvency = solvencyParts.length
            ? ` - ${solvencyParts.join(" | ")}`
            : "";
          return `${company.name} (${mascararCNPJ(company.cnpj)})${solvency}`;
        }
        return name;
      });

      setFormState((prevState) => ({
        ...prevState,
        title: processTitle,
        processNumber: process.number || "",
        executionNumber: process.calledByProvisionalLawsuitNumber || "",
        duplicated: "",
        dl: "",
        firstDegree: "",
        secondDefendantResponsibility: "",
        defendants: defendantsFromParts.join(", ") || "",
        analysis: "",
        prazo: process.parametersStepDeadlineInMonths
          ? process.parametersStepDeadlineInMonths.toString()
          : "",
        abatimento: "",
        observacao: process.observation?.description || "",
        observacaoPreAnalise: "",
        calculoAutos: "",
        calculoAutosValue: "",
        calculoHomologado: "",
        execucaoProvisoria: "",
        sucumbencia: "",
        freeJustice: "",
        conclusion: "",
        value: "",
        stageLabel: process.stage,
      }));
    }
  }, [process, isEditing]);

  // UseEffect para detectar quando a integração de execução provisória foi bem-sucedida
  useEffect(() => {
    if (insertExecutionSuccess && showLinkProvisionalExecutionModal) {
      // Fechar modal e refetch já são feitos no handleConfirmLinkProvisionalExecution
      // Este useEffect é apenas para garantir que o processo seja atualizado
      const timer = setTimeout(() => {
        refetchProcess();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [insertExecutionSuccess, showLinkProvisionalExecutionModal]);

  // Removido useEffect que causava re-render e perda de foco
  // A separação do título agora só acontece no handleStartEditTitle

  useEffect(() => {
    let lastNoteContent = "";
    let lastNoteTime = 0;

    function handleCalcNote(data: any) {
      if (data?.type === "CALC_NOTE" && typeof data?.note === "string") {
        const now = Date.now();
        if (data.note === lastNoteContent && now - lastNoteTime < 1000) {
          return;
        }

        lastNoteContent = data.note;
        lastNoteTime = now;

        setFormState((prev) => ({
          ...prev,
          analysis: (prev.analysis ? `${prev.analysis}\n\n` : "") + data.note,
        }));
        setHasUnsavedChanges(true);
        setHasChanges(true);

        if (process?.dealId) {
          addNoteMutation.mutate(
            { content: data.note, dealId: process.dealId },
            {
              onSuccess: () => {
                toast.success("Nota enviada ao Pipedrive.");
              },
              onError: (error) => {
                toast.error("Falha ao enviar nota ao Pipedrive.");
              },
            },
          );
        } else {
          toast.success("Notas da planilha adicionadas ao formulário.");
        }
      }
    }

    function handleCustomEvent(e: CustomEvent) {
      handleCalcNote(e.detail);
    }

    window.addEventListener("calc-note", handleCustomEvent as EventListener);

    function handleMessage(e: MessageEvent) {
      handleCalcNote(e.data);
    }
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener(
        "calc-note",
        handleCustomEvent as EventListener,
      );
      window.removeEventListener("message", handleMessage);
    };
  }, [process, addNoteMutation]);

  if (isLoading) {
    return (
      <MainShell>
        <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <ProcessHeaderSkeleton />
          <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 overflow-y-auto flex flex-col min-h-0">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 transition-all duration-300 min-w-0 lg:grid-cols-6 flex-1 overflow-hidden items-start">
              {/* Left column - Instance tabs and Timeline */}
              <div className="flex flex-col gap-3 transition-all duration-300 min-w-0 lg:col-span-2 h-full">
                {/* Instance Selection Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-shrink-0">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse border-2 border-blue-500 dark:border-blue-400"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                </div>

                {/* Timeline Card Skeleton */}
                <div className="h-[calc(100vh-320px)]">
                  <TimelineCardSkeleton />
                </div>
              </div>

              {/* Right column - Document Viewer */}
              <div className="lg:col-span-4 h-[calc(100vh-267px)]">
                <DocumentsCardSkeleton />
              </div>
            </div>
          </main>
        </div>
      </MainShell>
    );
  }

  if (isProcessError) {
    return (
      <MainShell>
        <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <Card className="w-96 text-center border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Processo não encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {error
                  ? "Ocorreu um erro ao carregar os dados do processo."
                  : "Os dados do processo estão incompletos ou corrompidos."}
                <br />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tente novamente mais tarde ou verifique o número informado.
                </span>
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl px-6 py-3 font-medium transition-colors"
                >
                  Voltar ao Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-6 py-3 font-medium transition-colors"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainShell>
    );
  }

  return (
    <MainShell>
      <div className="flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ProcessHeader
          process={process as Process}
          onReopen={handleReopen}
          isPending={false}
          isRefetching={isRefetching}
          isSyncing={isSyncing}
          onCompanyClick={handleCompanyClick}
          // onViewPreAnalysis={() => {
          //   window.open(`/processes/${process?.number}/pre-analysis`, '_blank');
          // }}
          onViewAnalysis={() => {
            window.open(`/processes/${process?.number}/analysis`, "_blank");
          }}
          isEditingTitle={isEditingTitle}
          editedClaimant={editedClaimant}
          editedDefendant={editedDefendant}
          onStartEditTitle={handleStartEditTitle}
          onCancelEditTitle={handleCancelEditTitle}
          onSaveTitle={handleSaveTitle}
          onClaimantChange={handleClaimantChange}
          onDefendantChange={handleDefendantChange}
          isSavingTitle={updateProcessFormMutation.isPending}
          claimantInputRef={claimantInputRef}
          defendantInputRef={defendantInputRef}
          onSync={async () => {
            if (!process?.number) {
              toast.error("Número do processo não encontrado.");
              return;
            }

            if (!canSync(process?.processStatus, process?.synchronizedAt)) {
              if (process?.synchronizedAt) {
                const lastSync = new Date(process.synchronizedAt);
                const now = new Date();
                const diffInMinutes = Math.floor(
                  (now.getTime() - lastSync.getTime()) / (1000 * 60),
                );
                const remainingMinutes = 30 - diffInMinutes;

                toast.warning(
                  `Aguarde mais ${remainingMinutes} minuto${remainingMinutes > 1 ? "s" : ""} para sincronizar novamente.`,
                  {
                    position: "top-right",
                    autoClose: 4000,
                  },
                );
              } else {
                toast.error(
                  "Só é permitido sincronizar caso synchronizedAt já tenha passado 30 minutos.",
                );
              }
              return;
            }

            setSyncModalOpen(true);
          }}
          onViewProcessInfo={() => setShowProcessInfoModal(true)}
          onAssignMember={() => setShowAssignMemberModal(true)}
          onChangeStage={() => setShowChangeStageDialog(true)}
          onRemoveProvisionalLink={handleRemoveProvisionalLink}
          onLinkProvisionalExecution={handleLinkProvisionalExecution}
          isAdmin={isAdmin}
        />
        <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 overflow-y-auto flex flex-col min-h-0">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 transition-all duration-300 min-w-0 lg:grid-cols-6 flex-1 items-start">
            <div className="flex flex-col gap-3 transition-all duration-300 min-w-0 lg:col-span-2 order-1">
              {/* Instance Selection Cards */}
              <div className="grid grid-cols-3 gap-2 flex-shrink-0">
                <ProcessInstanceCard
                  instance="1grau"
                  title="1° Grau"
                  processNumber={process?.number}
                  onClick={() => setActiveInstance("1grau")}
                  isActive={activeInstance === "1grau"}
                />
                {hasSecondDegreeMovements && (
                  <ProcessInstanceCard
                    instance="2grau"
                    title="2° Grau"
                    processNumber={process?.number}
                    onClick={() => setActiveInstance("2grau")}
                    isActive={activeInstance === "2grau"}
                  />
                )}
                {process?.autosData && (
                  <ProcessInstanceCard
                    instance="tst"
                    title="TST"
                    processNumber={process?.autosData?.number}
                    onClick={() => setActiveInstance("tst")}
                    isActive={activeInstance === "tst"}
                  />
                )}
              </div>

              {/* Content based on active instance */}
              <div className="h-[500px] sm:h-[600px] lg:h-[calc(100vh-255px)]">
                {activeInstance === "1grau" && (
                  <TimelineCard
                    title="Timeline da 1º Instância"
                    moviments={process?.moviments || []}
                    instancia={InstanceEnum.FIRST_INSTANCE}
                    processNumber={process?.number}
                    newMovements={newMovements.PRIMEIRO_GRAU.map((mov) => ({
                      ...mov,
                      instancia: InstanceEnum.FIRST_INSTANCE,
                    }))}
                    onMovementClick={handleMovementClick}
                    documents={process?.documents || []}
                    onDocumentClick={handleDocumentClick}
                    onMarkAsViewed={() => handleMarkAsViewed("PRIMEIRO_GRAU")}
                    isMarkingAsViewed={markMovementsAsViewedMutation.isPending}
                  />
                )}

                {activeInstance === "2grau" && (
                  <TimelineCard
                    title="Timeline da 2º Instância"
                    moviments={process?.moviments || []}
                    instancia={InstanceEnum.SECOND_INSTANCE}
                    processNumber={process?.number}
                    newMovements={newMovements.SEGUNDO_GRAU.map((mov) => ({
                      ...mov,
                      instancia: InstanceEnum.SECOND_INSTANCE,
                    }))}
                    onMovementClick={handleMovementClick}
                    documents={process?.documents || []}
                    onDocumentClick={handleDocumentClick}
                    onMarkAsViewed={() => handleMarkAsViewed("SEGUNDO_GRAU")}
                    isMarkingAsViewed={markMovementsAsViewedMutation.isPending}
                  />
                )}

                {activeInstance === "tst" && process?.autosData && (
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <CardTitle className="text-primary">
                          Dados do TST
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4 flex-shrink-0">
                        <div>
                          <Label className="font-semibold mb-1">Turma</Label>
                          <p>{process.autosData.class ?? "-"}</p>
                        </div>
                        <div>
                          <Label className="font-semibold mb-1">Relator</Label>
                          <p>{process.autosData.relator ?? "-"}</p>
                        </div>
                        <div>
                          <Label className="font-semibold mb-1">Ativo</Label>
                          <p>{process.autosData.ativo ?? "-"}</p>
                        </div>
                        <div>
                          <Label className="font-semibold mb-1">Passivo</Label>
                          <p>{process.autosData.passivo ?? "-"}</p>
                        </div>
                        <div>
                          <Label className="font-semibold mb-1">
                            Data Distribuição
                          </Label>
                          <p>{process.autosData.dateOfDistribution ?? "-"}</p>
                        </div>
                        <div>
                          <Label className="font-semibold mb-1">
                            Data Trânsito
                          </Label>
                          <p>{process.autosData.dateOfTransit ?? "-"}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex-1 flex flex-col min-h-0">
                        <Label className="font-semibold mb-2">
                          Movimentações TST
                        </Label>
                        {process.autosData.movements?.length ? (
                          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            {process.autosData.movements.map((mov) => (
                              <div
                                key={mov.id}
                                className="border border-border rounded-lg p-3"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium text-sm text-muted-foreground">
                                    {mov.data}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {mov.conteudo}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                            <p>Nenhuma movimentação registrada no TST.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Sidebar - Documents Card e Activities Card com tabs */}
            <div className="lg:col-span-4 h-[500px] sm:h-[600px] lg:h-[calc(100vh-200px)] order-2">
              <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Tabs para alternar entre Documentos e Atividades */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    onClick={() => setActiveRightTab("documents")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeRightTab === "documents"
                        ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <span className="relative z-10">Documentos</span>
                    {activeRightTab === "documents" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveRightTab("activities")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeRightTab === "activities"
                        ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <span className="relative z-10">Atividades</span>
                    {activeRightTab === "activities" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                    )}
                  </button>
                </div>

                {/* Conteúdo baseado na tab ativa */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {activeRightTab === "documents" ? (
                    <DocumentsCard
                      documents={
                        linkedDocuments.length > 0
                          ? linkedDocuments
                          : process?.documents || []
                      }
                      selectedDocumentId={selectedDocumentId}
                      processNumber={process?.number || ""}
                      dealId={process?.dealId}
                      onManagePrompts={() => {
                        // Abrir gerenciamento de prompts em nova aba para não perder contexto
                        window.open(`/dashboard?view=prompts`, "_blank");
                      }}
                    />
                  ) : (
                    <div className="h-full overflow-hidden">
                      <ActivitiesCard
                        process={process ?? null}
                        onUpdate={refetchProcess}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <CompanyModalDialog
          cnpj={selectedCompany?.cnpj || ""}
          isOpen={isCompanyModalOpen}
          onClose={() => {
            setIsCompanyModalOpen(false);
            setSelectedCompany(null);
          }}
        />

        {/* Change Stage Dialog - Admin only */}
        {isAdmin && (
          <ChangeStageDialog
            process={process || null}
            open={showChangeStageDialog}
            onOpenChange={setShowChangeStageDialog}
            onSuccess={refetchProcess}
          />
        )}

        {/* Modal de confirmação de atualização de dados */}
        <Dialog
          open={showUpdateConfirmation}
          onOpenChange={setShowUpdateConfirmation}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Dados Atualizados Disponíveis
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-base">
              <p className="mb-3">
                Novos dados do processo foram detectados e estão disponíveis
                para atualização.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Atenção:</strong> Você possui alterações não salvas no
                  formulário. Se aceitar a atualização, suas alterações serão
                  perdidas.
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleRejectUpdate}>
                Manter Minhas Alterações
              </Button>
              <Button
                variant="default"
                onClick={handleAcceptUpdate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Atualizar Dados
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de sincronização concluída */}
        <Dialog
          open={showSyncCompleteDialog}
          onOpenChange={setShowSyncCompleteDialog}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {hasError(process?.processStatus) ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Erro na Sincronização
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    Sincronização Concluída
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-base">
              {hasError(process?.processStatus) ? (
                <>
                  <p className="mb-3">
                    Ocorreu um erro durante a sincronização do processo.
                    Verifique os detalhes abaixo e tente novamente mais tarde.
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-2">
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <strong>Processo:</strong> {process?.number}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <strong>Status:</strong>{" "}
                      {process?.processStatus?.name || ProcessStatusEnum.ERROR}
                    </div>
                    {process?.processStatus?.errorReason && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <strong>Motivo:</strong>{" "}
                        {process.processStatus.errorReason}
                      </div>
                    )}
                    {process?.processStatus?.log && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <strong>Log:</strong> {process.processStatus.log}
                      </div>
                    )}
                    {process?.processStatus?.updatedAt && (
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <strong>Data:</strong>{" "}
                        {new Date(
                          process.processStatus.updatedAt,
                        ).toLocaleString("pt-BR")}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-3">
                    {getSyncStatusDescription(process?.processStatus)}
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-2">
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <strong>Processo:</strong> {process?.number}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <strong>Status:</strong>{" "}
                      {process?.processStatus?.name ||
                        ProcessStatusEnum.PROCESSED}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <strong>Tipo:</strong>{" "}
                      {getSyncType(process?.processStatus)}
                    </div>
                    {process?.processStatus?.log && (
                      <div className="text-sm text-green-700 dark:text-green-300">
                        <strong>Detalhes:</strong> {process.processStatus.log}
                      </div>
                    )}
                    {process?.synchronizedAt && (
                      <div className="text-sm text-green-700 dark:text-green-300">
                        <strong>Sincronizado em:</strong>{" "}
                        {new Date(process.synchronizedAt).toLocaleString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          },
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      {process?.processStatus?.name ===
                      ProcessStatusEnum.EXTRACTION_FINISHED
                        ? "⚠️ Para visualizar os novos documentos, clique em 'Recarregar Dados' abaixo."
                        : "✓ Clique em 'Recarregar Dados' para visualizar as atualizações."}
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSyncCompleteDialog(false)}
              >
                Fechar
              </Button>
              {!hasError(process?.processStatus) &&
                !isIntermediateStatus(process?.processStatus) && (
                  <Button
                    variant="default"
                    onClick={() => {
                      setShowSyncCompleteDialog(false);
                      // Recarregar a página completamente para garantir que todos os dados sejam atualizados
                      window.location.reload();
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Recarregar Dados
                  </Button>
                )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Opções de Sincronização */}
        <SyncOptionsModal
          isOpen={syncModalOpen}
          onClose={() => setSyncModalOpen(false)}
          onConfirm={handleSyncConfirm}
          isPending={runLawsuitsMutation.isPending}
        />

        {/* Modal de Informações do Processo */}
        <Dialog
          open={showProcessInfoModal}
          onOpenChange={setShowProcessInfoModal}
        >
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Informações do Processo
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
              {/* Detalhes Gerais do Processo */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Detalhes Gerais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Número do Processo
                    </Label>
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="font-mono text-xs text-gray-900 dark:text-gray-100 truncate">
                        {process?.number || "-"}
                      </span>
                    </div>
                  </div>

                  {process?.processStatus &&
                    (() => {
                      const statusColor = getStatusColor(process.processStatus);
                      return (
                        <div className="flex flex-col gap-2">
                          <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 rounded-full ${statusColor.dot}`}
                            ></div>
                            Status
                          </Label>
                          <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <span
                              className={`text-xs font-medium ${statusColor.text}`}
                            >
                              {process.processStatus.name}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                  {process?.stage && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Etapa
                      </Label>
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {getStageLabel(process.stage)}
                        </span>
                      </div>
                    </div>
                  )}

                  {process?.stageId && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Esteira
                      </Label>
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          {getEsteiraLabel(process.stageId)}
                        </span>
                      </div>
                    </div>
                  )}

                  {process?.legalNature && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5" />
                        Natureza Jurídica
                      </Label>
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-900 dark:text-gray-100">
                          {process.legalNature}
                        </span>
                      </div>
                    </div>
                  )}

                  {process?.class && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        Tipo
                      </Label>
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span
                          className={`text-xs font-medium ${
                            process.class === "MAIN"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {process.class === "MAIN"
                            ? "Principal"
                            : "Execução Provisória"}
                        </span>
                      </div>
                    </div>
                  )}

                  {process?.processOwner?.user?.email && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        Responsável
                      </Label>
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-900 dark:text-gray-100">
                          {process.processOwner.user.email}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Informações Detalhadas (ProcessInfoCard) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Dados Complementares
                </h3>
                <ProcessInfoCard
                  process={process}
                  claimant={claimant}
                  initialPetition={initialPetitionData}
                  onProcessUpdate={refetchProcess}
                  isAdmin={isAdmin}
                  isRefetching={isRefetching}
                  isSyncing={isSyncing}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowProcessInfoModal(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Gerenciar Responsável */}
        <Dialog
          open={showAssignMemberModal}
          onOpenChange={setShowAssignMemberModal}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Atribuir Responsável
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ProcessOwnerSelector
                processId={(process as any)?.id}
                currentOwnerEmail={process?.processOwner?.user?.email}
                onSuccess={() => {
                  refetchProcess();
                  setShowAssignMemberModal(false);
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAssignMemberModal(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação - Remover Vínculo com Execução Provisória */}
        <Dialog
          open={showRemoveProvisionalLinkConfirm}
          onOpenChange={setShowRemoveProvisionalLinkConfirm}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Confirmar Remoção de Vínculo
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
                Tem certeza que deseja remover o vínculo com a execução
                provisória?
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Atenção:</strong> Esta ação irá desvincular o processo
                  da seguinte execução provisória:
                </p>
                <p className="text-xs font-mono text-amber-900 dark:text-amber-200 mt-2 break-all">
                  {process?.calledByProvisionalLawsuitNumber}
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRemoveProvisionalLinkConfirm(false)}
                disabled={removeProvisionalLawsuitMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmRemoveProvisionalLink}
                disabled={removeProvisionalLawsuitMutation.isPending}
              >
                {removeProvisionalLawsuitMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Removendo...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirmar Remoção
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Vincular Execução Provisória */}
        <Dialog
          open={showLinkProvisionalExecutionModal}
          onOpenChange={setShowLinkProvisionalExecutionModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-yellow-600" />
                Vincular Execução Provisória
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-base text-gray-700 dark:text-gray-300">
                Insira o número da execução provisória que deseja vincular a
                este processo.
              </p>
              <div className="space-y-2">
                <Label
                  htmlFor="execution-number"
                  className="text-sm font-semibold text-foreground"
                >
                  Número da Execução Provisória
                </Label>
                <Input
                  id="execution-number"
                  type="text"
                  placeholder="Ex: 0000000-00.0000.0.00.0000"
                  value={executionNumberInput}
                  onChange={(e) => setExecutionNumberInput(e.target.value)}
                  className="w-full bg-card text-card-foreground border-border"
                  disabled={isInsertExecutionLoading}
                />
              </div>
              <div className="bg-secondary/10 dark:bg-secondary-foreground/10 border border-secondary dark:border-secondary-foreground rounded-lg p-3">
                <p className="text-sm text-secondary dark:text-secondary-foreground">
                  <strong>Atenção:</strong> Certifique-se de que o número da
                  execução provisória está correto antes de vincular.
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLinkProvisionalExecutionModal(false);
                  setExecutionNumberInput("");
                }}
                disabled={isInsertExecutionLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmLinkProvisionalExecution}
                disabled={
                  isInsertExecutionLoading || !executionNumberInput.trim()
                }
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isInsertExecutionLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Vinculando...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Vincular
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainShell>
  );
}
