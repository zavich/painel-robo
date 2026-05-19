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
  Movimentacoes,
  PeticaoInicialData,
  ProcessStatus,
} from "@/app/interfaces/processes";
import { UserRolesEnum } from "@/app/interfaces/user";
import { mascararCNPJ } from "@/app/utils/masks";
import {
  getClaimant,
  getDefendant,
  getProcessTitle,
} from "@/app/utils/processPartsUtils";
import {
  getSyncStatusDescription,
  getSyncType,
  hasError,
  isIntermediateStatus,
  isProcessing,
  isSyncCompleted,
  shouldContinueMonitoring,
} from "@/app/utils/processSyncStatus";
import { PipedriveFormData } from "@/components/process/PipedriveFormCard";
import { InstanceEnum } from "@/components/process/TimelineCard";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

export function useProcessPageState() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.number as string;
  const searchParams = useSearchParams();

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleStatusChange = (oldStatus: ProcessStatus, newStatus: ProcessStatus) => {
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

  const handleMovementClick = (mov: Movimentacoes) => {
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
    const initialPetitionData = initialPetition?.data;

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
      process?.title || process?.formPipedrive?.title,
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
          process?.formPipedrive?.observacaoPreAnalise || "",
        calculoAutos: process?.formPipedrive?.calculoAutos || "",
        calculoAutosValue:
          process?.formPipedrive?.calculoAutosValue || "",
        calculoHomologado:
          process?.formPipedrive?.calculoHomologado || "",
        execucaoProvisoria:
          process?.formPipedrive?.execucaoProvisoria || "",
        sucumbencia: process?.formPipedrive?.sucumbencia || "",
        freeJustice: process?.formPipedrive?.freeJustice || "",
        conclusion: process?.formPipedrive?.conclusion || "",
        value: process?.formPipedrive?.value || "",
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

    function handleCalcNote(data: { type: string; note: string }) {
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

  return {
    // Auth & routing
    user,
    router,
    id,
    isAdmin,
    // Process data
    process,
    isLoading,
    error,
    refetchProcess,
    isRefetching,
    isProcessError,
    // Movements
    newMovements,
    hasSecondDegreeMovements,
    // Derived data
    claimant,
    initialPetitionData,
    // Form state
    formState,
    setFormState,
    isEditing,
    setIsEditing,
    hasChanges,
    hasUnsavedChanges,
    // UI state
    selectedCompany,
    isCompanyModalOpen,
    setIsCompanyModalOpen,
    setSelectedCompany,
    showChangeStageDialog,
    setShowChangeStageDialog,
    showUpdateConfirmation,
    setShowUpdateConfirmation,
    currentStatusInfo,
    isSyncing,
    showSyncCompleteDialog,
    setShowSyncCompleteDialog,
    syncModalOpen,
    setSyncModalOpen,
    selectedDocumentId,
    activeRightTab,
    setActiveRightTab,
    activeInstance,
    setActiveInstance,
    showProcessInfoModal,
    setShowProcessInfoModal,
    showAssignMemberModal,
    setShowAssignMemberModal,
    showRemoveProvisionalLinkConfirm,
    setShowRemoveProvisionalLinkConfirm,
    showLinkProvisionalExecutionModal,
    setShowLinkProvisionalExecutionModal,
    linkedDocuments,
    executionNumberInput,
    setExecutionNumberInput,
    isEditingTitle,
    editedClaimant,
    editedDefendant,
    claimantInputRef,
    defendantInputRef,
    // Mutation states
    updateProcessFormMutation,
    runLawsuitsMutation,
    removeProvisionalLawsuitMutation,
    markMovementsAsViewedMutation,
    isInsertExecutionLoading,
    // Handlers
    handleMarkAsViewed,
    handleCompanyClick,
    handleDocumentClick,
    handleMovementClick,
    handleReopen,
    handleRemoveProvisionalLink,
    handleConfirmRemoveProvisionalLink,
    handleLinkProvisionalExecution,
    handleConfirmLinkProvisionalExecution,
    handleStartEditTitle,
    handleCancelEditTitle,
    handleClaimantChange,
    handleDefendantChange,
    handleSaveTitle,
    handleSyncConfirm,
    handleAcceptUpdate,
    handleRejectUpdate,
    // Unused but kept for completeness
    updateFormMutation,
  };
}
