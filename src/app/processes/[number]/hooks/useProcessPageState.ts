"use client";

import { useLawsuit } from "@/app/api/hooks/lawsuit/useLawsuit";
import { useProcessReopen } from "@/app/api/hooks/process/useProcessReopen";
import { useUpdateProcessForm } from "@/app/api/hooks/process/useUpdateProcessForm";
import { useInsertExecution } from "@/app/api/hooks/processes/useInsertExecution";
import { useRemoveProvisionalLawsuit } from "@/app/api/hooks/processes/useRemoveProvisionalLawsuit";
import { useSyncLawsuit } from "@/app/api/hooks/lawsuit/useSyncLawsuit";
import { useSearchLawsuit } from "@/app/api/hooks/lawsuit/useSearchLawsuit";
import { useInsertLawsuit } from "@/app/api/hooks/lawsuit/useInsertLawsuit";
import { useProcessAutoRefresh } from "@/app/hooks/useProcessAutoRefresh";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { Company, Movimentacoes, ProcessStatus } from "@/app/interfaces/processes";
import { UserRolesEnum } from "@/app/interfaces/user";
import { logger } from "@/app/lib/logger";
import { mapLawsuitMoviments, mapLawsuitPartes } from "@/app/utils/lawsuitMappers";
import { getClaimant } from "@/app/utils/processPartsUtils";
import { generateTextPdf } from "@/app/utils/textToPdf";
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
  const [executionNumberInput, setExecutionNumberInput] = useState("");
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
  const {
    data: lawsuit,
    isLoading: isLawsuitLoading,
    refetch: refetchLawsuit,
  } = useLawsuit(id, {
    // Enquanto o status ficar "SINCRONIZANDO" (marcado no Redis assim que o
    // sync é disparado, antes do webhook real voltar), continua consultando
    // de tempos em tempos — sem isso, a tela ficava travada em
    // "Sincronizando" até um F5 manual, mesmo depois do backend já ter
    // atualizado o Redis/Athena com o resultado real.
    refetchInterval: (query) =>
      query.state.data?.statusColeta === "SINCRONIZANDO" ? 4000 : false,
  });
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

  const syncLawsuitMutation = useSyncLawsuit();
  const searchLawsuitMutation = useSearchLawsuit();
  const insertLawsuitMutation = useInsertLawsuit();
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
  // Processos que começam direto na 2ª instância (ex: Ação Rescisória) não
  // têm movimentações de 1º grau — sem esse check, a aba "1° Grau" ficava
  // selecionada por padrão mesmo vazia, escondendo a única instância real.
  const hasFirstDegreeMovements = useMemo(
    () =>
      lawsuitMoviments.some(
        (movement) => movement.instancia === InstanceEnum.FIRST_INSTANCE,
      ),
    [lawsuitMoviments],
  );
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

  // Lembra pra qual CNJ já disparamos a checagem automática, pra não repetir
  // a cada re-render.
  const [insertAttemptedFor, setInsertAttemptedFor] = useState<string | null>(
    null,
  );

  // Assim que o Athena confirma "não encontrado", verifica sozinho (sem
  // clique do usuário) se já existe dado real em comunicacao-spot (de outro
  // coletor, nunca migrado pro Athena). Se existir, o backend já joga esse
  // JSON pro cache no Redis — só precisa refazer a consulta pra sair do
  // estado de "não encontrado". Se não existir, só grava o marcador
  // BUSCANDO (sem custo de captcha) e a tela mostra "não encontrado" de fato.
  useEffect(() => {
    if (!isProcessError || !id || insertAttemptedFor === id) {
      return;
    }

    setInsertAttemptedFor(id);

    insertLawsuitMutation.mutate(id, {
      onSuccess: async (result) => {
        if (result.cached) {
          toast.success(
            "Processo encontrado em comunicacao-spot — carregando o detalhe.",
          );
          await refetchLawsuit();
        }
      },
      onError: (error) => {
        logger.error("Erro ao verificar comunicacao-spot:", error as object);
        toast.error("Erro ao verificar/inserir o processo em comunicacao-spot.");
      },
    });
  }, [isProcessError, id, insertAttemptedFor, insertLawsuitMutation, refetchLawsuit]);

  // Enquanto isso for true, ainda estamos checando o comunicacao-spot pra
  // esse CNJ — só depois é que dá pra afirmar "não encontrado" de fato (nem
  // no Athena, nem em comunicacao-spot), sem nenhuma ação do usuário.
  const isCheckingNewLawsuit =
    isProcessError &&
    (insertAttemptedFor !== id || insertLawsuitMutation.isPending);

  useEffect(() => {
    // Corrige a aba ativa pra uma que realmente tenha movimentações — o
    // estado inicial sempre parte de "1grau" antes do lawsuit carregar, mas
    // processos sem 1º grau (ex: Ação Rescisória, que começa direto na 2ª
    // instância) precisam cair pra "2grau"/"tst" assim que os dados chegam.
    const fallbackInstance = hasFirstDegreeMovements
      ? "1grau"
      : hasSecondDegreeMovements
        ? "2grau"
        : hasThirdInstanceMovements
          ? "tst"
          : "1grau";

    if (activeInstance === "1grau" && !hasFirstDegreeMovements) {
      setActiveInstance(fallbackInstance);
    }
    if (activeInstance === "2grau" && !hasSecondDegreeMovements) {
      setActiveInstance(fallbackInstance);
    }
    if (activeInstance === "tst" && !hasThirdInstanceMovements) {
      setActiveInstance(fallbackInstance);
    }
  }, [
    activeInstance,
    hasFirstDegreeMovements,
    hasSecondDegreeMovements,
    hasThirdInstanceMovements,
  ]);

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  const [movementDocumentPreview, setMovementDocumentPreview] = useState<{
    title: string;
    blob: Blob;
    movementId: number;
    texto: string;
  } | null>(null);

  const handleCloseMovementDocument = () => {
    setMovementDocumentPreview(null);
  };

  // Documentos vêm 100% do Athena agora — o texto já está embutido na
  // própria movimentação via `mov.texto` (não cruza mais com
  // `process.documents`, array do Mongo que não é mais preenchido desde que
  // o handler de webhook que gravava lá foi removido). O card só é clicável
  // quando `mov.texto` existe (ver `MovementCard`), então esse handler só é
  // chamado nesse caso.
  const handleMovementClick = async (movement: Movimentacoes) => {
    if (!movement.texto) {
      return;
    }

    const blob = await generateTextPdf(movement.texto);
    const title = movement.conteudo
      ? `${movement.conteudo} - ${movement.data}`
      : `Documento - ${movement.data}`;
    setMovementDocumentPreview({
      title,
      blob,
      movementId: movement.id,
      texto: movement.texto,
    });
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

  // Processo ainda não encontrado no Athena (`isProcessError`) — dispara uma
  // primeira busca (sem documentos restritos) em vez do `/sync`, que é pra
  // re-sincronizar um processo já existente.
  const handleSearchNewLawsuit = async () => {
    try {
      await searchLawsuitMutation.mutateAsync(id);
      toast.success(
        "Busca iniciada! Isso pode levar alguns minutos — atualize a página em instantes.",
      );
    } catch (error) {
      logger.error("Erro ao buscar processo:", error as object);
      toast.error("Erro ao iniciar a busca do processo.");
    }
  };

  const handleSyncConfirm = async () => {
    try {
      if (!lawsuit?.cnjNumber) {
        toast.error("Número do processo não encontrado.");
        return;
      }

      await syncLawsuitMutation.mutateAsync(lawsuit.cnjNumber);

      setSyncModalOpen(false);
      setMovementDocumentPreview(null);
      // O backend já marca o processo como SINCRONIZANDO no Redis assim que
      // a extração é disparada — refaz a consulta pro Athena/Redis (não só
      // o Mongo) pra esse status aparecer no header sem precisar recarregar.
      await Promise.all([refetchProcess(), refetchLawsuit()]);
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
    handleLinkProvisionalExecution,
    handleMovementClick,
    handleRejectUpdate,
    handleRemoveProvisionalLink,
    handleReopen,
    handleSaveTitle,
    handleSearchNewLawsuit,
    handleStartEditTitle,
    handleSyncConfirm,
    hasChanges,
    hasFirstDegreeMovements,
    hasSecondDegreeMovements,
    hasThirdInstanceMovements,
    hasUnsavedChanges,
    id,
    initialPetitionData,
    isAdmin,
    isCheckingNewLawsuit,
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
    movementDocumentPreview,
    process,
    processReopenPending: processReopenMutation.isPending,
    refetchProcess,
    removeProvisionalLawsuitMutation,
    router,
    searchLawsuitMutation,
    syncLawsuitMutation,
    selectedCompany,
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
