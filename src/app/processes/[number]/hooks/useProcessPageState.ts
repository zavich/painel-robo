"use client";

import axios from "axios";
import { useLawsuit } from "@/app/api/hooks/lawsuit/useLawsuit";
import { useSyncLawsuit } from "@/app/api/hooks/lawsuit/useSyncLawsuit";
import { useSearchLawsuit } from "@/app/api/hooks/lawsuit/useSearchLawsuit";
import { useInsertLawsuit } from "@/app/api/hooks/lawsuit/useInsertLawsuit";
import { Movimentacoes } from "@/app/interfaces/processes";
import { logger } from "@/app/lib/logger";
import { mapLawsuitMoviments, mapLawsuitPartes } from "@/app/utils/lawsuitMappers";
import { getClaimant } from "@/app/utils/processPartsUtils";
import { generateTextPdf } from "@/app/utils/textToPdf";
import { InstanceEnum } from "@/components/process/TimelineCard.types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

export function useProcessPageState() {
  const router = useRouter();
  const params = useParams();
  const id = params?.number as string;

  const [activeInstance, setActiveInstance] = useState<
    "1grau" | "2grau" | "tst"
  >("1grau");
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  // Número do processo, instâncias, movimentações e partes vêm do PJe via
  // Athena (módulo lawsuits no robo-api) — essa é a única fonte de dados da
  // tela de detalhe agora (Mongo removido: título/empresa/execução
  // provisória/reabertura eram as últimas seções que dependiam dele).
  const {
    data: lawsuit,
    isLoading: isLawsuitLoading,
    isFetching: isLawsuitFetching,
    error: lawsuitError,
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

  const syncLawsuitMutation = useSyncLawsuit();
  const searchLawsuitMutation = useSearchLawsuit();
  const insertLawsuitMutation = useInsertLawsuit();

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

  // A existência do processo depende só do Athena (/lawsuits) agora.
  const isLoading = isLawsuitLoading;
  const isProcessError = !isLawsuitLoading && !lawsuit;
  // Só dispara o fluxo de "processo não encontrado" (busca automática em
  // comunicacao-spot) quando o Athena de fato respondeu 404 — outros erros
  // (500, timeout, rede) também caem em `isProcessError` (pra não deixar a
  // tela em branco), mas sem isso qualquer falha transitória acionava a
  // mesma checagem/insert automática de um processo que pode existir.
  const isLawsuitNotFound =
    isProcessError &&
    axios.isAxiosError(lawsuitError) &&
    lawsuitError.response?.status === 404;

  // Lembra pra qual CNJ já disparamos a checagem automática, pra não repetir
  // a cada re-render.
  const [insertAttemptedFor, setInsertAttemptedFor] = useState<string | null>(
    null,
  );

  // Assim que o Athena/Redis confirmam "não encontrado", garante sozinho
  // (sem clique do usuário) o marcador BUSCANDO em comunicacao-spot — só pra
  // sinalizar a quem lê o S3 direto (ex.: communication-ingestor-juri) que
  // uma busca está para começar; sem custo de captcha, e sem disparar
  // extração nenhuma. Comunicacao-spot não é mais fonte de consulta (só
  // Redis + Athena), então essa chamada nunca "acha" o processo — depois
  // dela a tela sempre segue pro estado de "não encontrado", com o botão
  // "Buscar processo" (`handleSearchNewLawsuit`, dispara `/search`).
  useEffect(() => {
    if (!isLawsuitNotFound || !id || insertAttemptedFor === id) {
      return;
    }

    setInsertAttemptedFor(id);

    insertLawsuitMutation.mutate(id, {
      onError: (error) => {
        logger.error("Erro ao verificar comunicacao-spot:", error as object);
        toast.error("Erro ao verificar/inserir o processo em comunicacao-spot.");
      },
    });
  }, [isLawsuitNotFound, id, insertAttemptedFor, insertLawsuitMutation]);

  // Enquanto isso for true, ainda estamos garantindo o marcador em
  // comunicacao-spot pra esse CNJ — só depois é que a tela mostra o estado
  // de "não encontrado" de fato, sem nenhuma ação do usuário.
  const isCheckingNewLawsuit =
    isLawsuitNotFound &&
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
  // própria movimentação via `mov.texto`.
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

  // Processo ainda não encontrado no Athena (`isProcessError`) — dispara uma
  // primeira busca (sem documentos restritos) em vez do `/sync`, que é pra
  // re-sincronizar um processo já existente. O backend já garante um
  // registro "SINCRONIZANDO" no Redis assim que a busca é disparada (mesmo
  // pra um CNJ nunca visto antes), então o refetch aqui tira a tela do card
  // de erro e leva direto pro layout normal do processo, já mostrando o
  // status "Sincronizando" — o polling embutido em `useLawsuit` (a cada 4s
  // enquanto esse status durar) cuida do resto sozinho.
  const handleSearchNewLawsuit = async () => {
    try {
      await searchLawsuitMutation.mutateAsync(id);
      toast.success(
        "Busca iniciada! Acompanhe o andamento aqui na tela do processo.",
      );
      await refetchLawsuit();
    } catch (error) {
      logger.error("Erro ao buscar processo:", error as object);
      toast.error("Erro ao iniciar a busca do processo.");
    }
  };

  // Trava o botão de Sincronizar desde o clique (isPending vira true no
  // mesmo tick do mutateAsync, sem esperar a rede) até o status realmente
  // sair de SINCRONIZANDO — o que só acontece quando o webhook do
  // scraping-robo-api de fato responde e atualiza o Redis/Athena. Também
  // trava enquanto o GET /lawsuits/{cnj} está em voo (isLawsuitFetching):
  // sem isso, havia uma janela entre o POST /sync resolver (isPending volta
  // a false) e o refetch do GET trazer o status SINCRONIZANDO de volta, em
  // que o botão destravava por um instante com dado desatualizado.
  const isSyncLocked =
    syncLawsuitMutation.isPending ||
    isLawsuitFetching ||
    lawsuit?.statusColeta === "SINCRONIZANDO";

  // `options` (movements/documents) vem do SyncOptionsModal, mas o endpoint
  // /sync ainda não aceita esses filtros — aceita o parâmetro só pra bater
  // com a assinatura exigida por SyncOptionsModalProps.onConfirm.
  const handleSyncConfirm = async (
    _options?: { movements: boolean; documents: boolean },
  ) => {
    // Só chega aqui com o modal já aberto, e o modal só abre depois do
    // mesmo check em `onSync` (page.tsx) — guarda silenciosa (sem toast
    // duplicado) só pra satisfazer o narrowing de tipo do TS abaixo.
    if (!lawsuit?.cnjNumber) {
      return;
    }

    try {
      await syncLawsuitMutation.mutateAsync(lawsuit.cnjNumber);

      setSyncModalOpen(false);
      setMovementDocumentPreview(null);
      await refetchLawsuit();
    } catch (error) {
      logger.error("Erro ao sincronizar processo:", error as object);
      const detalhe = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined;
      toast.error(
        detalhe
          ? `Erro ao sincronizar processo: ${detalhe}`
          : "Erro ao sincronizar processo. Tente novamente em instantes.",
      );
    }
  };

  return {
    activeInstance,
    claimant,
    handleCloseMovementDocument,
    handleMovementClick,
    handleSearchNewLawsuit,
    handleSyncConfirm,
    hasFirstDegreeMovements,
    hasSecondDegreeMovements,
    hasThirdInstanceMovements,
    id,
    isCheckingNewLawsuit,
    isLoading,
    isLawsuitNotFound,
    isProcessError,
    isSyncLocked,
    lawsuitCnjNumber: lawsuit?.cnjNumber,
    lawsuitMotivoErro: lawsuit?.motivoErro,
    lawsuitStatusColeta: lawsuit?.statusColeta,
    lawsuitMoviments,
    lawsuitParts,
    movementDocumentPreview,
    router,
    searchLawsuitMutation,
    syncLawsuitMutation,
    setActiveInstance,
    syncModalOpen,
    setSyncModalOpen,
  };
}
