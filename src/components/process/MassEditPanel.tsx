import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/hooks/use-theme-client";
import { Process } from "@/app/interfaces/processes";
import { X, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateMassActivity } from "@/app/api/hooks/process/useCreateMassActivity";
import { ActivityType } from "@/app/api/hooks/process/useCreateActivity";

interface MassEditPanelProps {
  selectedProcesses: Process[];
  onClose: () => void;
  users?: Array<{ _id?: string; id?: string; email: string }>;
  selectAllMode?: 'page' | 'all' | null;
  totalSelected?: number;
  apiFilters?: any; // Filters to apply when selecting all from DB
  isAdmin?: boolean; // Whether the current user is an admin
}

interface EditField {
  action: "keep" | "edit";
  value: any;
}

export function MassEditPanel({ 
  selectedProcesses, 
  onClose, 
  users = [],
  selectAllMode = null,
  totalSelected = 0,
  apiFilters,
  isAdmin = false
}: MassEditPanelProps) {
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMassActivityMutation = useCreateMassActivity();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fields, setFields] = useState<{
    activity: EditField;
  }>({
    activity: { action: "keep", value: null },
  });

  interface ActivityConfig {
    type: ActivityType | "";
    assignedTo: string;
  }

  const [activities, setActivities] = useState<ActivityConfig[]>([
    { type: "", assignedTo: "" }
  ]);

  const handleFieldChange = (fieldName: keyof typeof fields, action: "keep" | "edit", value?: any) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: { action, value: action === "edit" ? value : null }
    }));
  };

  const handleClose = () => {
    // Clear all fields when closing
    setFields({
      activity: { action: "keep", value: null },
    });
    setActivities([{ type: "", assignedTo: "" }]);
    onClose();
  };

  const addActivity = () => {
    setActivities([...activities, { type: "", assignedTo: "" }]);
  };

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      setActivities(activities.filter((_, i) => i !== index));
    }
  };

  const updateActivity = (index: number, field: keyof ActivityConfig, value: string) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  const handleSubmit = async () => {
    // Only handle mass activity creation
    if (fields.activity.action === "edit") {
      // Validate all activities
      const validActivities = activities.filter(a => a.type && a.assignedTo);
      
      if (validActivities.length === 0) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos uma atividade válida (tipo e responsável).",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      try {
        // Get process IDs - if selectAllMode is 'all', we need to fetch all process IDs from API
        let processIds: string[] = [];
        
        if (selectAllMode === 'all') {
          // For "select all", we need to fetch all process IDs from the API using filters
          toast({
            title: "Buscando processos...",
            description: "Carregando todos os processos filtrados para criar atividades.",
          });

          const { getProcesses } = await import("@/app/api/hooks/processes/useProcesses");
          
          // Fetch all pages to get all process IDs
          const allProcessIds: string[] = [];
          let page = 1;
          let hasMore = true;
          const limit = 50; // Same limit as used in the dashboard
          
          while (hasMore) {
            try {
              const pageData = await getProcesses({
                ...apiFilters,
                page,
                limit,
              });
              
              // Extract process IDs from the processes array
              const pageProcessIds: string[] = (pageData.processes || []).map(p => p._id);
              
              allProcessIds.push(...pageProcessIds);
              
              // Check if there are more pages
              const totalPages = pageData.totalPages || 1;
              
              hasMore = page < totalPages && pageProcessIds.length > 0;
              page++;
              
              // Small delay to avoid overwhelming the server
              if (hasMore) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (pageError) {
              console.error(`Error fetching page ${page}:`, pageError);
              hasMore = false;
            }
          }
          
          processIds = allProcessIds;
          
          if (processIds.length === 0) {
            toast({
              title: "Erro",
              description: "Nenhum processo encontrado com os filtros aplicados.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
        } else {
          processIds = selectedProcesses.map(p => p._id);
        }

        if (processIds.length === 0) {
          toast({
            title: "Erro",
            description: "Nenhum processo selecionado para criar atividade.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        toast({
          title: "Criando atividades...",
          description: `Criando ${validActivities.length} tipo(s) de atividade para ${processIds.length} processo(s)...`,
        });

        // Create all activities sequentially
        let totalCreated = 0;
        let totalFailed = 0;
        const errors: string[] = [];

        for (const activity of validActivities) {
          try {
            const result = await createMassActivityMutation.mutateAsync({
              type: activity.type as ActivityType,
              assignedTo: activity.assignedTo,
              processes: processIds,
            });
            
            totalCreated += result.createdCount || 0;
            totalFailed += result.failedCount || 0;
            
            if (result.errors && result.errors.length > 0) {
              errors.push(...result.errors.map(e => e.error));
            }
          } catch (error: any) {
            console.error(`Error creating activity ${activity.type}:`, error);
            totalFailed += processIds.length;
            errors.push(`Erro ao criar ${activity.type}: ${error?.response?.data?.message || error.message}`);
          }
        }

        toast({
          title: "Atividades criadas",
          description: `${totalCreated} atividade(s) criada(s)${totalFailed > 0 ? `, ${totalFailed} falharam` : ""}.`,
          variant: totalFailed > 0 ? "destructive" : "default",
        });

        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ["processes"] });

        handleClose();
      } catch (error: any) {
        console.error("Error creating mass activities:", error);
        toast({
          title: "Erro ao criar atividades",
          description: error?.response?.data?.message || "Ocorreu um erro ao criar as atividades em massa.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div 
      className={`fixed right-0 w-[400px] shadow-2xl border-l z-50 overflow-y-auto ${
        theme === "dark" 
          ? "bg-gray-800 border-gray-700" 
          : "bg-white border-gray-200"
      }`}
      style={{
        top: 0,
        height: '100vh'
      }}
    >
      {/* Header */}
      <div className={`sticky top-0 px-6 py-4 border-b flex items-center justify-between ${
        theme === "dark" 
          ? "bg-gray-800 border-gray-700" 
          : "bg-white border-gray-200"
      }`}>
        <h2 className={`text-lg font-bold ${
          theme === "dark" ? "text-gray-100" : "text-gray-900"
        }`}>
          Edição em massa
        </h2>
        <button
          onClick={handleClose}
          className={`p-1 rounded-lg transition-colors ${
            theme === "dark" 
              ? "hover:bg-gray-700 text-gray-400" 
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Alert when all processes are selected */}
        {selectAllMode === 'all' && (
          <div className={`p-4 rounded-lg border ${
            theme === "dark"
              ? "bg-blue-900/20 border-blue-700"
              : "bg-blue-50 border-blue-200"
          }`}>
            <p className={`text-sm font-medium ${
              theme === "dark" ? "text-blue-300" : "text-blue-800"
            }`}>
              ⚡ Criando atividades para {totalSelected} processos
            </p>
            <p className={`text-xs mt-1 ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}>
              As atividades serão criadas para todos os processos que correspondem aos filtros atuais
            </p>
          </div>
        )}

        {/* Activity Field - Create Mass Activities - Only for Admins */}
        {isAdmin && (
          <div className="space-y-2">
            <label className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Criar Atividade
            </label>
            <select
              value={fields.activity.action}
              onChange={(e) => handleFieldChange("activity", e.target.value as "keep" | "edit")}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="keep">Não criar atividade</option>
              <option value="edit">Criar atividade em massa...</option>
            </select>
            
            {fields.activity.action === "edit" && (
              <div className="space-y-3 mt-3">
                {/* Activities List */}
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        theme === "dark"
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className={`text-xs font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Atividade {index + 1}
                        </span>
                        {activities.length > 1 && (
                          <button
                            onClick={() => removeActivity(index)}
                            className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                              theme === "dark"
                                ? "text-red-400 hover:bg-red-900/30"
                                : "text-red-600 hover:bg-red-50"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Activity Type */}
                        <div className="space-y-1">
                          <label className={`text-xs font-medium ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Tipo de Atividade *
                          </label>
                          <select
                            value={activity.type}
                            onChange={(e) => updateActivity(index, "type", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              theme === "dark"
                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">Selecione o tipo</option>
                            <option value="PRE_ANALISE">Pré-Análise</option>
                            <option value="ANALISE">Análise</option>
                            <option value="CALCULO">Cálculo</option>
                          </select>
                        </div>

                        {/* Activity Assigned To */}
                        <div className="space-y-1">
                          <label className={`text-xs font-medium ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Responsável *
                          </label>
                          <select
                            value={activity.assignedTo}
                            onChange={(e) => updateActivity(index, "assignedTo", e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${
                              theme === "dark"
                                ? "bg-gray-700 border-gray-600 text-gray-100"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">Selecione um responsável</option>
                            {users && users.length > 0 ? (
                              users.map(user => {
                                const userId = user._id || user.id || '';
                                return (
                                  <option key={userId} value={userId}>
                                    {user.email}
                                  </option>
                                );
                              })
                            ) : (
                              <option value="" disabled>Nenhum responsável disponível</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Activity Button */}
                <Button
                  type="button"
                  onClick={addActivity}
                  variant="outline"
                  className={`w-full flex items-center justify-center gap-2 ${
                    theme === "dark"
                      ? "border-gray-600 hover:bg-gray-700"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Atividade
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Only show button for admins */}
      {isAdmin && (
        <div className={`sticky bottom-0 px-6 py-4 border-t ${
          theme === "dark" 
            ? "bg-gray-800 border-gray-700" 
            : "bg-white border-gray-200"
        }`}>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              fields.activity.action === "keep" || 
              activities.filter(a => a.type && a.assignedTo).length === 0
            }
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {isSubmitting 
              ? "Criando atividades..."
              : `Criar ${activities.filter(a => a.type && a.assignedTo).length} atividade(s) para ${totalSelected || selectedProcesses.length} processo${(totalSelected || selectedProcesses.length) !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      )}
    </div>
  );
}

