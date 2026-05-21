"use client";

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
  ProcessStatus,
} from "@/app/interfaces/processes";
import { UserRolesEnum } from "@/app/interfaces/user";
import { logger } from "@/app/lib/logger";
import { getClaimant } from "@/app/utils/processPartsUtils";
import { InstanceEnum } from "@/components/process/TimelineCard.types";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getInitialPetitionData,
  getNewMovements,
} from "./processPageState.utils";
import { useProcessFormState } from "./useProcessFormState";
import { useProcessTitleEditor } from "./useProcessTitleEditor";
import { useProcessUpdateMonitor } from "./useProcessUpdateMonitor";

export function useProcessPageState() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.number as string;
  const searchParams = useSearchParams();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [showChangeStageDialog, setShowChangeStageDialog] = useState(false);
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
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [currentStatusInfo, setCurrentStatusInfo] = useState<{
    errorReason?: string;
    log?: string;
    name: string;
    updatedAt: string;
  } | null>(null);
  const initialRightTab = useMemo<"documents" | "activities">(() => {
    const tab = searchParams.get("tab");
    return tab === "activities" ? "activities" : "documents";
  }, [searchParams]);
  const [activeRightTab, setActiveRightTab] = useState<
    "documents" | "activities"
  >(initialRightTab);
  const [activeInstance, setActiveInstance] = useState<
    "1grau" | "2grau" | "tst"
  >("1grau");
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  const handleStatusChange = useCallback(
    (_oldStatus: ProcessStatus, newStatus: ProcessStatus) => {
      setCurrentStatusInfo({
        name: newStatus.name,
        log: newStatus.log,
        errorReason: newStatus.errorReason,
        updatedAt: newStatus.updatedAt,
      });
    },
    [],
  );

  const {
    process,
    isLoading,
    error,
    refetch: refetchProcess,
    isRefetching,
  } = useProcessAutoRefresh({
    processId: id,
    enabled: true,
    intervalMs: 10000,
    onStatusChange: handleStatusChange,
  });

  const {
    formState,
    setFormState,
    hasChanges,
    hasUnsavedChanges,
    resetChangeFlags,
  } = useProcessFormState({
    process,
    isEditing,
  });

  const {
    currentStatusInfo: monitoredStatusInfo,
    handleAcceptUpdate,
    handleRejectUpdate,
    isSyncing,
    setShowSyncCompleteDialog,
    setShowUpdateConfirmation,
    showSyncCompleteDialog,
    showUpdateConfirmation,
  } = useProcessUpdateMonitor({
    clearEditingState: () => setIsEditing(false),
    clearFormChanges: resetChangeFlags,
    currentStatusInfo,
    hasUnsavedChanges,
    isEditing,
    process,
    refetchProcess,
    setCurrentStatusInfo,
  });

  const runLawsuitsMutation = useRunLawsuits();
  const {
    insertExecution,
    isLoading: isInsertExecutionLoading,
  } = useInsertExecution();
  const updateProcessFormMutation = useUpdateProcessForm(process?.number);
  const processReopenMutation = useProcessReopen(process?._id);
  const removeProvisionalLawsuitMutation = useRemoveProvisionalLawsuit();
  const markMovementsAsViewedMutation = useMarkMovementsAsViewed();

  const handlePersistTitle = useCallback(
    async (unifiedTitle: string) => {
      if (!process?.number) {
        toast.error("Número do processo não encontrado");
        return;
      }

      try {
        await updateProcessFormMutation.mutateAsync({
          processNumber: process.number,
          formData: {
            title: unifiedTitle,
          },
        });

        setFormState((currentState) => ({
          ...currentState,
          title: unifiedTitle,
        }));
        toast.success("Título atualizado com sucesso!");
        await refetchProcess();
      } catch (error) {
        toast.error("Erro ao atualizar título");
        logger.error("Erro ao atualizar título:", error);
        throw error;
      }
    },
    [process?.number, refetchProcess, setFormState, updateProcessFormMutation],
  );

  const {
    claimantInputRef,
    defendantInputRef,
    editedClaimant,
    editedDefendant,
    handleCancelEditTitle,
    handleClaimantChange,
    handleDefendantChange,
    handleSaveTitle,
    handleStartEditTitle,
    isEditingTitle,
  } = useProcessTitleEditor({
    process,
    onSaveTitle: handlePersistTitle,
  });

  const isAdmin = user?.role === UserRolesEnum.ADMIN;
  const newMovements = useMemo(() => getNewMovements(process), [process]);
  const hasSecondDegreeMovements = useMemo(
    () =>
      process?.moviments?.some(
        (movement) => movement.instancia === InstanceEnum.SECOND_INSTANCE,
      ) || false,
    [process?.moviments],
  );
  const claimant = useMemo(
    () => getClaimant(process?.processParts || []),
    [process?.processParts],
  );
  const initialPetitionData = useMemo(
    () => getInitialPetitionData(process),
    [process],
  );
  const isProcessLoaded = !!process && Object.keys(process).length > 0;
  const hasRequiredData = process?.documents && Array.isArray(process.documents);
  const isProcessError =
    !!error ||
    (!isLoading && !isProcessLoaded) ||
    (!!process && !hasRequiredData);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "activities" || tab === "documents") {
      setActiveRightTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (process?.documents && !selectedDocumentId) {
      const peticaoDoc = process.documents.find(
        (document) => document.title === "Petição Inicial" && document.data,
      );

      if (peticaoDoc) {
        setSelectedDocumentId(peticaoDoc._id);
      }
    }
  }, [process?.documents, selectedDocumentId]);

  useEffect(() => {
    if (activeInstance === "2grau" && !hasSecondDegreeMovements) {
      setActiveInstance("1grau");
    }
    if (activeInstance === "tst" && !process?.autosData) {
      setActiveInstance("1grau");
    }
  }, [activeInstance, hasSecondDegreeMovements, process?.autosData]);

  const handleMarkAsViewed = (instance: "PRIMEIRO_GRAU" | "SEGUNDO_GRAU") => {
    if (!process?.number) {
      return;
    }

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

  const handleDocumentClick = (document: DocumentExtract) => {
    if (!process?.number) {
      return;
    }

    if (!document?._id) {
      setSelectedDocumentId(null);
      return;
    }

    setSelectedDocumentId(document._id);
    setActiveRightTab("documents");
    router.push(`/processes/${process.number}?tab=documents`, {
      scroll: false,
    });
  };

  const handleMovementClick = (movement: Movimentacoes) => {
    if (!process?.documents) {
      return;
    }

    const normalizeDate = (dateString: string) => {
      if (!dateString) {
        return "";
      }

      const [dateOnly] = dateString.split(" ");
      if (dateOnly.includes("/")) {
        const [day, month, year] = dateOnly.split("/");
        return `${year}-${month}-${day}`;
      }

      return dateOnly.substring(0, 10);
    };

    const normalizedMovementDate = normalizeDate(movement.data);
    const matchingDocs = process.documents.filter((document) => {
      const normalizedDocDate = normalizeDate(document.date);

      return (
        normalizedMovementDate &&
        normalizedDocDate &&
        normalizedMovementDate === normalizedDocDate
      );
    });

    if (matchingDocs.length === 0) {
      setLinkedDocuments([]);
      return;
    }

    setLinkedDocuments(matchingDocs);
    setSelectedDocumentId(
      matchingDocs.length === 1 ? matchingDocs[0]._id : null,
    );
  };

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
    if (!process?._id) {
      return;
    }

    setShowRemoveProvisionalLinkConfirm(false);

    try {
      await removeProvisionalLawsuitMutation.mutateAsync({
        processId: process._id,
      });

      toast.success("Vínculo com execução provisória removido com sucesso!");
      await refetchProcess();
    } catch (error) {
      toast.error("Erro ao remover vínculo com execução provisória");
      logger.error("Erro ao remover vínculo com execução provisória:", error);
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
      logger.error("Erro ao vincular execução provisória:", error);
    }
  };

  const handleSyncConfirm = async (options: {
    documents: boolean;
    movements: boolean;
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
      setLinkedDocuments([]);
      setSelectedDocumentId(null);
      await refetchProcess();
    } catch (error) {
      logger.error("Erro ao sincronizar processo:", error);
      toast.error("Erro ao sincronizar processo.");
    }
  };

  return {
    activeInstance,
    activeRightTab,
    claimant,
    claimantInputRef,
    currentStatusInfo: monitoredStatusInfo,
    defendantInputRef,
    editedClaimant,
    editedDefendant,
    error,
    executionNumberInput,
    formState,
    handleAcceptUpdate,
    handleCancelEditTitle,
    handleClaimantChange,
    handleCompanyClick,
    handleConfirmLinkProvisionalExecution,
    handleConfirmRemoveProvisionalLink,
    handleDefendantChange,
    handleDocumentClick,
    handleLinkProvisionalExecution,
    handleMarkAsViewed,
    handleMovementClick,
    handleRejectUpdate,
    handleRemoveProvisionalLink,
    handleReopen,
    handleSaveTitle,
    handleStartEditTitle,
    handleSyncConfirm,
    hasChanges,
    hasSecondDegreeMovements,
    hasUnsavedChanges,
    id,
    initialPetitionData,
    isAdmin,
    isCompanyModalOpen,
    isEditing,
    isEditingTitle,
    isInsertExecutionLoading,
    isLoading,
    isProcessError,
    isRefetching,
    isSyncing,
    linkedDocuments,
    markMovementsAsViewedMutation,
    newMovements,
    process,
    processReopenPending: processReopenMutation.isPending,
    refetchProcess,
    removeProvisionalLawsuitMutation,
    router,
    runLawsuitsMutation,
    selectedCompany,
    selectedDocumentId,
    setActiveInstance,
    setActiveRightTab,
    setExecutionNumberInput,
    setFormState,
    setIsCompanyModalOpen,
    setIsEditing,
    setSelectedCompany,
    setShowAssignMemberModal,
    setShowChangeStageDialog,
    setShowLinkProvisionalExecutionModal,
    setShowProcessInfoModal,
    setShowRemoveProvisionalLinkConfirm,
    setShowSyncCompleteDialog,
    setShowUpdateConfirmation,
    showAssignMemberModal,
    showChangeStageDialog,
    showLinkProvisionalExecutionModal,
    showProcessInfoModal,
    showRemoveProvisionalLinkConfirm,
    showSyncCompleteDialog,
    showUpdateConfirmation,
    syncModalOpen,
    setSyncModalOpen,
    updateFormMutation: updateProcessFormMutation,
    updateProcessFormMutation,
    user,
  };
}
