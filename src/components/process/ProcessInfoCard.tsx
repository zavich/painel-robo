import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  FileText,
  Link2,
  User,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { capitalizeWords } from "@/app/utils/format";
import { formatProcessNumber } from "@/app/utils/masks";
import { formatCurrency, formatDate } from "@/app/utils/processUtils";
import {
  PeticaoInicialData,
  Process,
  Situation,
} from "@/app/interfaces/processes";
import Link from "next/link";
import { formatCpf } from "@/app/utils/masks";
import { useInsertExecution } from "@/app/api/hooks/processes/useInsertExecution";
import { useRemoveProvisionalLawsuit } from "@/app/api/hooks/processes/useRemoveProvisionalLawsuit";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProcessStatusComponent } from "@/components/ProcessStatusComponent";

interface ProcessInfoCardProps {
  process?: Process;
  claimant: any;
  isEditing?: boolean;
  initialPetition?: PeticaoInicialData;
  onProcessUpdate?: () => void;
  isAdmin?: boolean;
  isLoading?: boolean;
  isRefetching?: boolean;
  isSyncing?: boolean;
}

export function ProcessInfoCard({
  process,
  claimant,
  isEditing,
  initialPetition,
  onProcessUpdate,
  isAdmin = false,
  isLoading = false,
  isRefetching = false,
  isSyncing = false,
}: ProcessInfoCardProps) {
  const [showProcessInfo, setShowProcessInfo] = useState(true);

  // Hook para integração
  const {
    insertExecution,
    isLoading: isInsertLoading,
    error: insertError,
    success: insertSuccess,
  } = useInsertExecution();
  const [executionInput, setExecutionInput] = useState("");
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);

  // Hook para remoção de processo provisório
  const removeProvisionalLawsuit = useRemoveProvisionalLawsuit();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const showInsertExecution =
    process?.class === "MAIN" && !process?.calledByProvisionalLawsuitNumber;

  function handleInsertExecution() {
    if (!process?._id || !executionInput) return;
    const formatted = formatProcessNumber(executionInput);
    setHasShownSuccessToast(false); // Reset flag para nova integração
    insertExecution(process._id, formatted, formatted);
  }

  const handleCopyProcessNumber = async (processNumber: string) => {
    try {
      await navigator.clipboard.writeText(processNumber);
      toast.success("Número do processo copiado!");
    } catch (error) {
      toast.error("Erro ao copiar número do processo");
    }
  };

  // UseEffect para detectar quando a integração foi bem-sucedida
  useEffect(() => {
    if (insertSuccess && onProcessUpdate && !isRemoving && !hasShownSuccessToast) {
      // Mostrar toast de sucesso apenas uma vez
      toast.success("Processo provisória integrado com sucesso!");
      setHasShownSuccessToast(true);

      // Aguardar um pouco para garantir que o backend processou a integração
      setTimeout(() => {
        onProcessUpdate();
        // Limpar o input após sucesso
        setExecutionInput("");
      }, 1000);
    }
  }, [insertSuccess, onProcessUpdate, isRemoving, hasShownSuccessToast]);

  // Função para mostrar modal de confirmação
  const handleRemoveProvisionalLawsuit = () => {
    if (!process?._id) return;
    setShowRemoveModal(true);
  };

  // Função para confirmar remoção
  const confirmRemoveProvisionalLawsuit = async () => {
    if (!process?._id) return;

    setIsRemoving(true);
    setShowRemoveModal(false);

    try {
      await removeProvisionalLawsuit.mutateAsync({
        processId: process._id,
      });

      toast.success("Vínculo com processo provisório removido com sucesso!");

      if (onProcessUpdate) {
        onProcessUpdate();
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao remover vínculo do processo provisório");
      console.error("Erro ao remover processo provisório:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm animate-pulse mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 min-w-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                Informações do Processo
                {process?.class === "MAIN" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-1.5"></div>
                    Principal
                  </span>
                )}
              </CardTitle>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRefetching && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <RefreshCw className="h-3 w-3 text-blue-500 dark:text-blue-400 animate-spin" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Atualizando...
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowProcessInfo((v) => !v)}
            aria-label={showProcessInfo ? "Recolher" : "Expandir"}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {showProcessInfo ? <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
          </Button>
        </div>
      </CardHeader>
      {showProcessInfo && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max items-start min-w-0">
            {(initialPetition?.qualificacao_reclamante?.nome_completo || claimant?.nome) && (
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0">
                <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                    Reclamante
                  </Label>
                  {initialPetition?.qualificacao_reclamante?.nome_completo && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                      Extraído
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <Input
                    value={initialPetition?.qualificacao_reclamante?.nome_completo || claimant?.nome}
                    onChange={(e) => {
                      // handleInputChange("reclamante", e.target.value)
                    }}
                    className="font-medium border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                ) : (
                  <div className="min-h-[2.5rem] flex items-start min-w-0">
                    <p 
                      className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight break-words hyphens-auto min-w-0 overflow-hidden line-clamp-3"
                      title={capitalizeWords(initialPetition?.qualificacao_reclamante?.nome_completo || claimant?.nome)}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}
                    >
                      {capitalizeWords(initialPetition?.qualificacao_reclamante?.nome_completo || claimant?.nome)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {initialPetition &&
              initialPetition?.qualificacao_reclamante?.cpf && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0">
                  <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                      CPF
                    </Label>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                      Extraído
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-all min-w-0">
                    {formatCpf(initialPetition.qualificacao_reclamante.cpf)}
                  </p>
                </div>
              )}

            {initialPetition &&
              initialPetition?.qualificacao_reclamante?.rg && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0">
                  <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                    <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                      RG
                    </Label>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                      Extraído
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-all min-w-0">
                    {initialPetition.qualificacao_reclamante.rg}
                  </p>
                </div>
              )}

            {initialPetition &&
              initialPetition?.qualificacao_reclamante?.data_nascimento && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0">
                  <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                    <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                      Data de Nascimento
                    </Label>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                      Extraído
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words min-w-0">
                    {formatDate(
                      initialPetition.qualificacao_reclamante.data_nascimento
                    )}
                  </p>
                </div>
              )}

            {initialPetition &&
              initialPetition.qualificacao_reclamante?.nacionalidade && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0">
                  <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                      Nacionalidade
                    </Label>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                      Extraído
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words min-w-0">
                    {capitalizeWords(
                      initialPetition.qualificacao_reclamante.nacionalidade
                    )}
                  </p>
                </div>
              )}

            {initialPetition &&
              initialPetition?.qualificacao_reclamante?.estado_civil && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0">
                  <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                    <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                      Estado Civil
                    </Label>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                      Extraído
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words min-w-0">
                    {capitalizeWords(
                      initialPetition.qualificacao_reclamante.estado_civil
                    )}
                  </p>
                </div>
              )}

            {initialPetition &&
              initialPetition?.qualificacao_reclamante?.filiacao && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0">
                  <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                    <div className="w-8 h-8 bg-pink-50 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                      Nome da Mãe
                    </Label>
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                      Extraído
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words min-w-0">
                    {capitalizeWords(
                      initialPetition.qualificacao_reclamante.filiacao
                    )}
                  </p>
                </div>
              )}

            <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Valor da Causa
                </Label>
              </div>
              {isEditing ? (
                <Input
                  type="number"
                  value={process?.valueCase || 0}
                  onChange={(e) => {
                    // handleInputChange(
                    //   "valorCausa",
                    //   parseFloat(e.target.value) || 0
                    // )
                  }}
                  className="font-medium border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg whitespace-nowrap">
                  {formatCurrency(process?.valueCase || 0)}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Data de Distribuição
                </Label>
              </div>
              {isEditing ? (
                <Input
                  type="date"
                  value={process?.createdAt.split("T")[0]}
                  onChange={(e) => {
                    // handleInputChange("dataDistribuicao", e.target.value)
                  }}
                  className="font-medium border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words">
                  {process?.createdAt && formatDate(process.createdAt)}
                </p>
              )}
            </div>


            {/* Processo provisória */}
            {process?.class === "MAIN" &&
              process?.calledByProvisionalLawsuitNumber && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0">
                  <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                    <div className="w-8 h-8 bg-gray-50 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                      Processo provisória
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <a
                        href={`/processes/${process.calledByProvisionalLawsuitNumber}`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors break-all"
                      >
                        {process.calledByProvisionalLawsuitNumber}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => process.calledByProvisionalLawsuitNumber && handleCopyProcessNumber(process.calledByProvisionalLawsuitNumber)}
                        className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex-shrink-0"
                        title="Copiar número do processo provisório"
                      >
                        <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </Button>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveProvisionalLawsuit}
                        disabled={removeProvisionalLawsuit.isPending || isSyncing}
                        className="h-7 px-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isSyncing ? "Aguarde a sincronização terminar para remover o vínculo" : "Remover vínculo com processo provisório"}
                      >
                        {removeProvisionalLawsuit.isPending ? (
                          <>
                            <div className="animate-spin mr-1 h-3 w-3 border border-red-400 border-t-transparent rounded-full"></div>
                            Removendo...
                          </>
                        ) : isSyncing ? (
                          <>
                            <div className="animate-spin mr-1 h-3 w-3 border border-red-400 border-t-transparent rounded-full"></div>
                            Sincronizando...
                          </>
                        ) : (
                          <>
                            <svg
                              className="mr-1 h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remover vínculo
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}

            {process?.class === "PROVISIONAL_EXECUTION" &&
              process?.processMain?.number && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0">
                  <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                    <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                      Processo Principal
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/processes/${process.processMain.number}`}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 break-all"
                    >
                      {process.processMain.number}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => process.processMain?.number && handleCopyProcessNumber(process.processMain.number)}
                      className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex-shrink-0"
                      title="Copiar número do processo principal"
                    >
                      <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </div>
                </div>
              )}

            {/* Pipedrive */}
            {(process?.dealId || process?.processExecution?.dealId) && (
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Link2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Pipedrive
                  </Label>
                </div>
                <Link
                  href={`https://prosolutti.pipedrive.com/deal/${process?.dealId || process?.processExecution?.dealId
                    }`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200 break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver no pipedrive
                </Link>
              </div>
            )}
          </div>
          <div className="pt-4 pb-0">
            {initialPetition &&
              initialPetition?.qualificacao_reclamante?.endereco_completo && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow mb-4">
                  <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                    <div className="w-8 h-8 bg-gray-50 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                      Endereço
                    </Label>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 break-words">
                    {initialPetition.qualificacao_reclamante.endereco_completo}
                  </p>
                </div>
              )}
            {initialPetition && initialPetition?.dados_contrato && (
              <div className="mt-4">
                <Label className="block text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Dados de contrato
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 auto-rows-max items-start min-w-0">
                  {initialPetition?.dados_contrato?.data_admissao && (
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                        <div className="w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                          Data de Admissão
                        </Label>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                          Extraído
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words min-w-0">
                        {formatDate(
                          initialPetition?.dados_contrato?.data_admissao
                        )}
                      </p>
                    </div>
                  )}
                  {initialPetition?.dados_contrato?.data_demissao && (
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                        <div className="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                          Data de Demissão
                        </Label>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                          Extraído
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words min-w-0">
                        {formatDate(
                          initialPetition?.dados_contrato?.data_demissao
                        )}
                      </p>
                    </div>
                  )}
                  {initialPetition?.dados_contrato?.funcao_exercida && (
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                          Função Exercida
                        </Label>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                          Extraído
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words min-w-0">
                        {initialPetition?.dados_contrato?.funcao_exercida}
                      </p>
                    </div>
                  )}
                  {initialPetition?.dados_contrato?.modalidade_demissao && (
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                        <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                          Modalidade de Demissão
                        </Label>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                          Extraído
                        </span>
                      </div>
                      <p 
                        className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words min-w-0 leading-tight"
                        title={capitalizeWords(
                          initialPetition?.dados_contrato?.modalidade_demissao.replace(
                            /_/g,
                            " "
                          )
                        )}
                      >
                        {capitalizeWords(
                          initialPetition?.dados_contrato?.modalidade_demissao.replace(
                            /_/g,
                            " "
                          )
                        )}
                      </p>
                    </div>
                  )}
                  {initialPetition?.dados_contrato?.ultimo_salario && (
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-2 min-w-0 flex-wrap">
                        <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">
                          Último Salário
                        </Label>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0">
                          Extraído
                        </span>
                      </div>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg break-words">
                        {formatCurrency(
                          initialPetition?.dados_contrato?.ultimo_salario
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {showInsertExecution && (
            <div data-execution-section className="mt-4 mb-4 p-6 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold text-base mb-1">
                    Processo sem vinculação
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Este processo não possui Processo provisória vinculado. Para vincular, insira o número da execução provisória abaixo e clique em Integrar.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Input
                  placeholder="Número da execução provisória"
                  value={formatProcessNumber(executionInput)}
                  onChange={(e) => setExecutionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && executionInput && !isInsertLoading) {
                      handleInsertExecution();
                    }
                  }}
                  className="flex-1 rounded-xl border-yellow-300 dark:border-yellow-700 focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-yellow-500 dark:focus:ring-yellow-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleInsertExecution}
                  disabled={isInsertLoading || !executionInput}
                  className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white rounded-xl px-6 py-2 flex-shrink-0"
                >
                  {isInsertLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Integrando...
                    </>
                  ) : (
                    "Integrar"
                  )}
                </Button>
              </div>
              {insertError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                    Erro ao integrar: {String(insertError)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
      {/* Modal de confirmação de remoção */}
      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar remoção
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-left space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Processo:</span>
                    <span className="ml-2 font-mono text-gray-900">{process?.number}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Processo provisório:</span>
                    <span className="ml-2 font-mono text-gray-900">{process?.calledByProvisionalLawsuitNumber}</span>
                  </div>
                </div>
                <div className="text-gray-600">
                  Esta ação irá <strong>remover o vínculo</strong> entre os processos e não poderá ser desfeita.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRemoveModal(false)}
              disabled={isRemoving}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemoveProvisionalLawsuit}
              disabled={isRemoving}
              className="flex-1 sm:flex-none"
            >
              {isRemoving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border border-white border-t-transparent rounded-full"></div>
                  Removendo...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Confirmar remoção
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
