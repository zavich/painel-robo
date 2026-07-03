"use client";

import { useLawsuit } from "@/app/api/hooks/lawsuit/useLawsuit";
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
import { mapLawsuitMoviments, mapLawsuitPartes } from "@/app/utils/lawsuitMappers";
import { getClaimant } from "@/app/utils/processPartsUtils";
import { InstanceEnum } from "@/components/process/TimelineCard.types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getInitialPetitionData } from "./processPageState.utils";
import { useProcessFormState } from "./useProcessFormState";
import { useProcessTitleEditor } from "./useProcessTitleEditor";
import { useProcessUpdateMonitor } from "./useProcessUpdateMonitor";

export function useProcessPageState() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.number as string;

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
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
    error,
    refetch: refetchProcess,
    isRefetching,
  } = useProcessAutoRefresh({
    processId: id,
    enabled: true,
    onStatusChange: handleStatusChange,
  });

  // Número do processo, instâncias, movimentações e partes vêm do PJe via
  // Athena (módulo lawsuits no robo-api) — substituem os dados equivalentes
  // que vinham do Mongo. Busca pelo número da URL diretamente (não pelo
  // process do Mongo): a existência do processo (achar/não achar) passa a
  // depender só do Athena, independente do Mongo ter ou não o registro.
  const { data: lawsuit, isLoading: isLawsuitLoading } = useLawsuit(id);
  const lawsuitParts = useMemo(() => mapLawsuitPartes(lawsuit), [lawsuit]);
  const lawsuitMoviments = useMemo(
    () => mapLawsuitMoviments(lawsuit),
    [lawsuit],
  );

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

  const clearEditingState = useCallback(() => setIsEditing(false), []);

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
    clearEditingState,
    clearFormChanges: resetChangeFlags,
    currentStatusInfo,
    hasUnsavedChanges,
    isEditing,
    process,
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
        logger.error("Erro ao atualizar título:", error as object);
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
  const hasSecondDegreeMovements = useMemo(
    () =>
      lawsuitMoviments.some(
        (movement) => movement.instancia === InstanceEnum.SECOND_INSTANCE,
      ),
    [lawsuitMoviments],
  );
  // TERCEIRO_GRAU no Athena corresponde ao TST — substitui o antigo painel
  // baseado em process.autosData (Mongo) pela timeline vinda do Athena.
  const hasThirdInstanceMovements = useMemo(
    () =>
      lawsuitMoviments.some(
        (movement) => movement.instancia === InstanceEnum.THIRD_INSTANCE,
      ),
    [lawsuitMoviments],
  );
  const claimant = useMemo(
    () => getClaimant(lawsuitParts),
    [lawsuitParts],
  );
  const initialPetitionData = useMemo(
    () => getInitialPetitionData(process),
    [process],
  );
  // A existência do processo depende só do Athena (/lawsuits): a página
  // renderiza assim que ele responder, sem esperar o Mongo. O processo do
  // Mongo (documents, activities, etc) preenche as seções dependentes dele
  // progressivamente, quando/se estiver disponível.
  const isLoading = isLawsuitLoading;
  const isProcessError = !isLawsuitLoading && !lawsuit;

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
    if (activeInstance === "tst" && !hasThirdInstanceMovements) {
      setActiveInstance("1grau");
    }
  }, [activeInstance, hasSecondDegreeMovements, hasThirdInstanceMovements]);

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  const handleDocumentClick = (document: DocumentExtract) => {
    if (!process?.number) {
      return;
    }

    setMovementDocumentPreview(null);

    if (!document?._id) {
      setSelectedDocumentId(null);
      return;
    }

    setSelectedDocumentId(document._id);
    router.push(`/processes/${process.number}`, {
      scroll: false,
    });
  };

  const [movementDocumentPreview, setMovementDocumentPreview] = useState<{
    title: string;
    blob: Blob;
    movementId: number;
    texto: string;
  } | null>(null);

  const handleViewMovementDocument = (
    title: string,
    blob: Blob,
    movementId: number,
    texto: string,
  ) => {
    setMovementDocumentPreview({ title, blob, movementId, texto });
  };

  const handleCloseMovementDocument = () => {
    setMovementDocumentPreview(null);
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

    setMovementDocumentPreview(null);
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
      logger.error("Erro ao remover vínculo com execução provisória:", error as object);
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
      logger.error("Erro ao vincular execução provisória:", error as object);
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
      logger.error("Erro ao sincronizar processo:", error as object);
      toast.error("Erro ao sincronizar processo.");
    }
  };

  return {
    activeInstance,
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
    handleCloseMovementDocument,
    handleDefendantChange,
    handleDocumentClick,
    handleLinkProvisionalExecution,
    handleMovementClick,
    handleRejectUpdate,
    handleViewMovementDocument,
    handleRemoveProvisionalLink,
    handleReopen,
    handleSaveTitle,
    handleStartEditTitle,
    handleSyncConfirm,
    hasChanges,
    hasSecondDegreeMovements,
    hasThirdInstanceMovements,
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
    lawsuitCnjNumber: lawsuit?.cnjNumber,
    lawsuitMotivoErro: lawsuit?.motivoErro,
    lawsuitStatusColeta: lawsuit?.statusColeta,
    lawsuitMoviments,
    lawsuitParts,
    linkedDocuments,
    movementDocumentPreview,
    process,
    processReopenPending: processReopenMutation.isPending,
    refetchProcess,
    removeProvisionalLawsuitMutation,
    router,
    runLawsuitsMutation,
    selectedCompany,
    selectedDocumentId,
    setActiveInstance,
    setExecutionNumberInput,
    setFormState,
    setIsCompanyModalOpen,
    setIsEditing,
    setSelectedCompany,
    setShowLinkProvisionalExecutionModal,
    setShowRemoveProvisionalLinkConfirm,
    setShowSyncCompleteDialog,
    setShowUpdateConfirmation,
    showLinkProvisionalExecutionModal,
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
