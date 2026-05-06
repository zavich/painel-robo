import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Send,
  TrendingUp,
  Settings,
  XCircle,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { DocumentExtract } from "@/app/interfaces/processes";
import CalcNoteModal from "./CalcNoteModal";
import dynamic from "next/dynamic";
import PDFViewerHeader from "@/components/shared/PdfViewerHeader";
const PDFViewer = dynamic(() => import("@/components/shared/PDFViewer"), {
  ssr: false,
});
import InsightGeneric from "@/components/insights/InsightGeneric";
import { useDocumentDetails } from "@/app/api/hooks/process/useDocumentDetails";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useExtractInsights } from "@/app/api/hooks/process/useExtractInsights";
import { usePrompts } from "@/app/api/hooks/process/usePrompts";
import { useRemoveInsights } from "@/app/api/hooks/process/useRemoveInsights";
import { StatusExtractionInsight } from "@/app/interfaces/processes";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { useAddPipedriveNote } from "@/app/api/hooks/process/useAddPipedriveNote";
import { toast } from "react-toastify";
import { useFetchPDF } from "@/app/api/hooks/process/useFetchPDF";

interface DocumentsCardProps {
  documents: DocumentExtract[];
  isLoading?: boolean;
  selectedDocumentId?: string | null;
  processNumber?: string;
  dealId?: number;
  onManagePrompts?: () => void;
}

export function DocumentsCard({
  isLoading = false,
  selectedDocumentId,
  processNumber,
  dealId,
  onManagePrompts,
}: DocumentsCardProps) {
  const [openCalcModal, setOpenCalcModal] = useState(false);
  const { fetchPDF } = useFetchPDF();
  const [calcInitial] = useState<any>(null);
  const [calcDocTitle] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [pdfSearchValue, setPdfSearchValue] = useState("");
  const [searchMatches, setSearchMatches] = useState<Element[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [openInsightsModal, setOpenInsightsModal] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);
  const { user } = useAuth();

  const {
    document,
    loading: documentLoading,
    refetch: refetchDocument,
  } = useDocumentDetails({
    processNumber: processNumber || "",
    documentId: selectedDocumentId || "",
    enabled: !!selectedDocumentId && !!processNumber,
    interval: shouldPoll ? 5000 : 0,
  });

  const {
    extractInsights,
    loading: extractLoading,
    error,
  } = useExtractInsights();
  const {
    removeInsights,
    loading: removeLoading,
    error: errorRemove,
  } = useRemoveInsights();
  const {
    prompts,
    loading: loadingPrompts,
    error: errorPrompts,
  } = usePrompts();
  const addNoteMutation = useAddPipedriveNote();

  const documentStatus = document?.status as StatusExtractionInsight;

  // Função para detectar o prompt baseado no título do documento
  const detectPromptFromTitle = useCallback(
    (title: string): string | null => {
      if (!title || !prompts?.prompts?.length) return null;

      const titleLower = title.toLowerCase();

      // Mapeamento de palavras-chave do título para tipos de prompt
      const promptMappings: { [key: string]: string[] } = {
        PlanilhaCalculo: ["planilha", "cálculo", "calculo"],
        PeticaoInicial: ["petição", "peticao", "inicial"],
        Homologacao: ["homologação", "homologacao", "homologa"],
        SentencaMerito: ["sentença", "sentenca", "mérito", "merito"],
        SentencaED: ["sentença", "sentenca", "ed"],
        SentencaEE: ["sentença", "sentenca", "ee"],
        Acordao: ["acórdão", "acordao", "acordão"],
        RecursoDeRevista: ["recurso", "revista"],
        AcordaoMerito: ["acórdão", "acordao", "mérito", "merito"],
        DecisaoPrevencao: ["decisão", "decisao", "prevenção", "prevencao"],
        AcordaoED: ["acórdão", "acordao", "ed"],
        AgravoPeticao: ["agravo", "petição", "peticao"],
        AdmissibilidadeRR: ["admissibilidade", "rr"],
        AcordoEParcelamento: ["acordo", "parcelamento"],
        Decisao: ["decisão", "decisao"],
        Alvara: ["alvará", "alvara"],
        HomologacaoDeAcordo: ["homologação", "homologacao", "acordo"],
        Garantia: ["garantia"],
      };

      // Procura o prompt que melhor corresponde ao título
      for (const [promptType, keywords] of Object.entries(promptMappings)) {
        if (keywords.some((keyword) => titleLower.includes(keyword))) {
          // Encontra o prompt com esse tipo
          const foundPrompt = prompts?.prompts?.find(
            (p) => p.type === promptType,
          );
          if (foundPrompt) {
            return foundPrompt._id;
          }
        }
      }

      return null;
    },
    [prompts],
  );

  const getIsProcessing = () => {
    // Verifica os estados diretamente para garantir resposta imediata
    // Se isExtracting está ativo, sempre considera como processando (mesmo que o cache ainda mostre COMPLETED)
    if (isExtracting || isRemoving) {
      return true;
    }

    const result =
      documentStatus === StatusExtractionInsight.PROCESSING ||
      // Se completou mas não tem dados ainda e está extraindo, ainda está processando
      (documentStatus === StatusExtractionInsight.COMPLETED && !document?.data);

    return result;
  };

  const getHasInsights = () =>
    !!document?.data && documentStatus === StatusExtractionInsight.COMPLETED;

  useEffect(() => {
    const processing =
      isRemoving ||
      isExtracting ||
      documentStatus === StatusExtractionInsight.PROCESSING ||
      (documentStatus === StatusExtractionInsight.COMPLETED &&
        !document?.data &&
        isExtracting);

    setShouldPoll(processing);

    if (
      documentStatus === StatusExtractionInsight.COMPLETED &&
      document?.data
    ) {
      setIsExtracting(false);
      setIsRemoving(false);
      setShouldPoll(false);
    }

    if (documentStatus === StatusExtractionInsight.ERROR) {
      setIsExtracting(false);
      setIsRemoving(false);
      setShouldPoll(false);
    }
  }, [documentStatus, document?.data, isExtracting, isRemoving]);

  // Seleciona automaticamente o prompt quando o modal abrir e houver documento
  useEffect(() => {
    if (
      openInsightsModal &&
      document?.title &&
      prompts?.prompts &&
      prompts?.prompts?.length > 0
    ) {
      // Sempre detecta e seleciona o prompt quando o modal abrir
      // Isso garante que o prompt correto esteja selecionado para reextração
      const detectedPromptId = detectPromptFromTitle(document.title);
      if (detectedPromptId && !selectedPromptId) {
        setSelectedPromptId(detectedPromptId);
      }
    }
  }, [
    openInsightsModal,
    document?.title,
    prompts?.prompts?.length,
    selectedPromptId,
    detectPromptFromTitle,
  ]);

  async function handleExtractInsights() {
    if (!selectedPromptId || !document?._id) return;

    // Força atualização imediata dos estados para garantir que o carregamento apareça
    flushSync(() => {
      setIsExtracting(true);
      setShouldPoll(true); // ✅ Ativa polling imediatamente
    });

    // Usa requestAnimationFrame para garantir que o DOM seja atualizado antes de continuar
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 0);
        });
      });
    });

    try {
      await extractInsights({
        number: processNumber || "",
        documents: [document._id],
        prompt: selectedPromptId,
      });
      // ✅ Aguarda um pouco antes de refetch para dar tempo do backend processar
      await new Promise((resolve) => setTimeout(resolve, 1000));
      refetchDocument();
    } catch (err) {
      flushSync(() => {
        setIsExtracting(false);
        setShouldPoll(false);
      });
    }
  }

  async function handleReExtractSameType() {
    if (isExtracting || isRemoving || !document?._id) return;

    // Detecta automaticamente o prompt baseado no título do documento
    const detectedPromptId = detectPromptFromTitle(document.title);
    const promptToUse = selectedPromptId || detectedPromptId;

    if (!promptToUse) {
      toast.error(
        "Não foi possível detectar o tipo de prompt. Por favor, selecione um prompt manualmente.",
      );
      return;
    }

    // Força atualização imediata dos estados para garantir que o carregamento apareça
    flushSync(() => {
      setSelectedPromptId(promptToUse);
      setIsRemoving(true);
      setIsExtracting(true);
      setShouldPoll(true);
    });

    // Usa requestAnimationFrame para garantir que o DOM seja atualizado antes de continuar
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 0);
        });
      });
    });

    try {
      await removeInsights({
        processNumber: processNumber || "",
        documentId: document._id,
      });

      // Força refetch imediato para atualizar o status do documento após remoção
      await refetchDocument();

      setIsRemoving(false);

      // Garante que isExtracting continue ativo antes de extrair
      flushSync(() => {
        setIsExtracting(true);
      });

      await extractInsights({
        number: processNumber || "",
        documents: [document._id],
        prompt: promptToUse,
      });

      // ✅ Aguarda um pouco antes de refetch para dar tempo do backend processar
      await new Promise((resolve) => setTimeout(resolve, 1000));
      refetchDocument();
    } catch (err) {
      flushSync(() => {
        setIsExtracting(false);
        setIsRemoving(false);
        setShouldPoll(false);
      });
      toast.error("Erro ao extrair insights novamente. Tente novamente.");
    }
  }

  async function handleRemoveOnly() {
    if (isRemoving || !document?._id) return;

    setIsRemoving(true);
    try {
      await removeInsights({
        processNumber: processNumber || "",
        documentId: document._id,
      });
      setSelectedPromptId("");
      setIsRemoving(false);
      setShouldPoll(false);
      refetchDocument();
    } catch (err) {
      setIsRemoving(false);
    }
  }

  const handleSendCalculationToPipedrive = async (calculationData: any) => {
    if (!processNumber) {
      toast.error("Número do processo não encontrado");
      return;
    }

    if (!dealId) {
      toast.error("Este processo não possui um dealId do Pipedrive");
      return;
    }

    try {
      // Verificar se valor é válido (não null, não undefined, não vazio)
      const isValidValue = (value: any): boolean => {
        if (value === null || value === undefined) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        if (typeof value === "number" && value === 0) return false;
        return true;
      };

      // Formatar valores monetários
      const formatCurrency = (value: any): string | null => {
        // Se já é string formatada (ex: "R$ 18.000,00"), retornar como está
        if (typeof value === "string" && value.includes("R$")) {
          return value;
        }
        // Se é número, formatar
        if (typeof value === "number" && value > 0) {
          return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return null;
      };

      // Formatar datas
      const formatDate = (dateStr: any): string | null => {
        if (!dateStr) return null;
        if (typeof dateStr === "string" && dateStr.includes("/"))
          return dateStr;
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString("pt-BR");
        } catch {
          return null;
        }
      };

      // Montar nota formatada de forma organizada
      const noteParts: string[] = [];

      noteParts.push("📊 PLANILHA DE CÁLCULO\n");

      // Seção 1: Responsável
      const responsavel: string[] = [];

      if (isValidValue(calculationData.owner)) {
        responsavel.push(`   Nome: ${calculationData.owner}`);
      }

      if (
        isValidValue(calculationData.owner_type || calculationData.ownerType)
      ) {
        const ownerType =
          calculationData.owner_type || calculationData.ownerType;
        responsavel.push(
          `   Tipo: ${ownerType.charAt(0).toUpperCase() + ownerType.slice(1)}`,
        );
      }

      if (responsavel.length > 0) {
        noteParts.push("👤 RESPONSÁVEL PELO CÁLCULO");
        noteParts.push(...responsavel);
        noteParts.push("");
      }

      // Seção 2: Valores Principais
      const valoresPrincipais: string[] = [];

      const liquido = formatCurrency(calculationData.liquido);
      if (liquido) valoresPrincipais.push(`   Valor Líquido: ${liquido}`);

      const bruto = formatCurrency(calculationData.bruto);
      if (bruto) valoresPrincipais.push(`   Valor Bruto: ${bruto}`);

      const fgts = formatCurrency(calculationData.fgts);
      if (fgts) valoresPrincipais.push(`   FGTS: ${fgts}`);

      const inssReclamante = formatCurrency(calculationData.inss_reclamante);
      if (inssReclamante)
        valoresPrincipais.push(`   INSS Reclamante: ${inssReclamante}`);

      const irpfReclamante = formatCurrency(calculationData.irpf_reclamante);
      if (irpfReclamante)
        valoresPrincipais.push(`   IRPF Reclamante: ${irpfReclamante}`);

      if (valoresPrincipais.length > 0) {
        noteParts.push("💰 VALORES CALCULADOS");
        noteParts.push(...valoresPrincipais);
        noteParts.push("");
      }

      // Seção 3: Valores com Margem
      const valoresMargem: string[] = [];

      if (isValidValue(calculationData.margem_percentual)) {
        valoresMargem.push(
          `   Margem Percentual: ${calculationData.margem_percentual}`,
        );
      }

      const valorComMargem = formatCurrency(calculationData.valor_com_margem);
      if (valorComMargem)
        valoresMargem.push(`   Valor com Margem: ${valorComMargem}`);

      const valorPosFgts = formatCurrency(calculationData.valor_pos_fgts);
      if (valorPosFgts)
        valoresMargem.push(`   Valor após FGTS: ${valorPosFgts}`);

      const valorPosHonorarios = formatCurrency(
        calculationData.valor_pos_honorarios,
      );
      if (valorPosHonorarios)
        valoresMargem.push(`   Valor após Honorários: ${valorPosHonorarios}`);

      if (valoresMargem.length > 0) {
        noteParts.push("📈 ANÁLISE COM MARGEM");
        noteParts.push(...valoresMargem);
        noteParts.push("");
      }

      // Seção 4: Cenários de Deságio
      const cenariosDesagio: string[] = [];

      const desagio50 = formatCurrency(calculationData.desagio_50);
      if (desagio50) cenariosDesagio.push(`   Deságio 50%: ${desagio50}`);

      const desagio30 = formatCurrency(calculationData.desagio_30);
      if (desagio30) cenariosDesagio.push(`   Deságio 30%: ${desagio30}`);

      if (cenariosDesagio.length > 0) {
        noteParts.push("💵 CENÁRIOS DE DESÁGIO");
        noteParts.push(...cenariosDesagio);
        noteParts.push("");
      }

      // Seção 5: Informações Complementares
      const infoComplementares: string[] = [];

      const dataCalculo = formatDate(calculationData.data_calculo);
      if (dataCalculo)
        infoComplementares.push(`   Data do Cálculo: ${dataCalculo}`);

      const dataLiquidacao = formatDate(calculationData.data_liquidacao);
      if (dataLiquidacao)
        infoComplementares.push(`   Data de Liquidação: ${dataLiquidacao}`);

      if (isValidValue(calculationData.correcao)) {
        infoComplementares.push(`   Correção: ${calculationData.correcao}`);
      }

      if (isValidValue(calculationData.id)) {
        infoComplementares.push(`   ID do Cálculo: ${calculationData.id}`);
      }

      if (infoComplementares.length > 0) {
        noteParts.push("📋 INFORMAÇÕES COMPLEMENTARES");
        noteParts.push(...infoComplementares);
      }

      const formattedNote = noteParts.join("\n");

      await addNoteMutation.mutateAsync({
        content: formattedNote,
        dealId: dealId,
      });

      toast.success("Dados da planilha enviados ao Pipedrive com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar dados ao Pipedrive");
      throw error;
    }
  };

  const handleSearchNext = () => {
    setSearchIndex((idx) =>
      searchMatches.length > 0 ? (idx + 1) % searchMatches.length : 0,
    );
  };

  const handleSearchPrev = () => {
    setSearchIndex((idx) =>
      searchMatches.length > 0
        ? (idx - 1 + searchMatches.length) % searchMatches.length
        : 0,
    );
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <div className="flex-1 flex flex-col p-6">
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-600 rounded-xl mb-6 animate-pulse"></div>
          <div className="flex-1 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 flex flex-col h-full">
      {/* <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-xl flex items-center justify-center shadow-sm">
						<FileText className="h-5 w-5 text-white" />
					</div>
					<CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Documentos</CardTitle>
				</div>
			</CardHeader> */}
      {selectedDocumentId && document ? (
        <CardContent className="pt-0 flex-1 flex flex-col min-h-0 relative">
          {/* Renderizar visualizador de documento */}
          <div className="flex-1 flex flex-col min-h-0 bg-muted/20 rounded-lg border border-border">
            <PDFViewerHeader
              pageNumber={pageNumber}
              numPages={numPages}
              scale={scale}
              onPrev={goToPrevPage}
              onNext={goToNextPage}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              hidePagination
              searchValue={pdfSearchValue}
              onSearchChange={setPdfSearchValue}
              onSearchNext={handleSearchNext}
              onSearchPrev={handleSearchPrev}
              searchCount={searchMatches.length}
              searchIndex={searchIndex}
            />
            <div className="flex-1 min-h-0">
              {document?.temp_link?.toLowerCase().endsWith(".pdf") ? (
                <PDFViewer
                  pdfUrl={document?.temp_link}
                  pageNumber={pageNumber}
                  scale={scale}
                  numPages={numPages}
                  setNumPages={setNumPages}
                  hidePagination
                  searchValue={pdfSearchValue}
                  searchIndex={searchIndex}
                  setSearchMatches={setSearchMatches}
                />
              ) : (
                <div className="text-center p-8 w-full h-full flex items-center justify-center">
                  <div>
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Visualizador de PDF
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      O documento PDF seria exibido aqui usando um componente de
                      visualização de PDF.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Documento: <strong>{document?.title}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Botões de ação no canto inferior direito - fixos em relação ao CardContent */}
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-13 z-50 flex gap-1 sm:gap-2 pointer-events-none">
            <div className="flex gap-1 sm:gap-2 pointer-events-auto">
              {/* Botão para gerenciar insights - sempre visível quando há documento */}
              {document && (
                <Button
                  variant={
                    document?.status === "COMPLETED" && document?.data
                      ? "default"
                      : "secondary"
                  }
                  size="sm"
                  onClick={() => setOpenInsightsModal(true)}
                  className="flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transition-shadow text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">
                    {document?.status === "COMPLETED" && document?.data
                      ? "Ver Insights"
                      : "Gerenciar Insights"}
                  </span>
                  {getIsProcessing() && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </Button>
              )}
              {document?.temp_link && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={async () => {
                    if (!document?.temp_link) return;

                    try {
                      const blob = await fetchPDF(document.temp_link);

                      if (!blob) throw new Error("Erro ao baixar");

                      const url = window.URL.createObjectURL(blob);

                      const a = window.document.createElement("a");
                      a.href = url;
                      a.download = document.title?.endsWith(".pdf")
                        ? document.title
                        : `${document.title}.pdf`;

                      window.document.body.appendChild(a);
                      a.click();
                      a.remove();

                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transition-shadow h-8 sm:h-9 w-8 sm:w-auto px-2 sm:px-3"
                  aria-label="Download"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-0 flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
              Selecione um documento na timeline
            </p>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
              para visualizar aqui
            </p>
          </div>
        </CardContent>
      )}
      <CalcNoteModal
        open={openCalcModal}
        onOpenChange={setOpenCalcModal}
        initialValues={calcInitial || undefined}
        titleSuffix={calcDocTitle}
        onSubmit={(note) => {
          try {
            // Only dispatch custom event for same-window communication
            window.dispatchEvent(
              new CustomEvent("calc-note", {
                detail: { type: "CALC_NOTE", note },
              }),
            );
          } catch (error) {}
          navigator.clipboard?.writeText(note).catch(() => {});
        }}
      />
      <Dialog
        open={openInsightsModal}
        onOpenChange={(open) => {
          setOpenInsightsModal(open);
          if (!open) {
            setSelectedPromptId("");
          }
        }}
      >
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col gap-0">
          <DialogHeader className="flex-shrink-0 pb-4 border-b pr-12">
            <DialogTitle className="flex items-center justify-between pr-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold">Insights da IA</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {document?.title}
                  </p>
                </div>
                {getIsProcessing() && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full flex-shrink-0">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      Processando...
                    </span>
                  </div>
                )}
              </div>
              {onManagePrompts && user.role === "admin" && (
                <div className="flex-shrink-0 ml-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onManagePrompts}
                    className="text-xs whitespace-nowrap"
                  >
                    <Settings className="h-3.5 w-3.5 mr-1.5" />
                    Prompts
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full pr-2">
              {getIsProcessing() ? (
                <div className="w-full space-y-4 py-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                        <div className="absolute inset-0 h-6 w-6 border-2 border-blue-200 dark:border-blue-700 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                          {isRemoving
                            ? "Removendo Insights Anteriores"
                            : "Extração em Andamento"}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {isRemoving
                            ? "Limpando dados anteriores para nova extração..."
                            : "Nossa IA está analisando o documento e extraindo insights relevantes..."}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      {isRemoving
                        ? "Primeiro removemos os insights antigos, depois extraímos novos com o prompt selecionado."
                        : "Este processo pode levar alguns minutos dependendo do tamanho e complexidade do documento."}
                    </p>
                  </div>
                </div>
              ) : getHasInsights() && document ? (
                <div className="space-y-4 pb-4">
                  {/* Opções de gerenciamento acima dos insights */}
                  <div className="sticky top-0 z-10 bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
                    <div className="flex items-center justify-end gap-3 p-4">
                      {loadingPrompts ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground px-4 py-2 bg-muted/50 rounded-lg">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Carregando prompts...</span>
                        </div>
                      ) : errorPrompts ? (
                        <div className="flex items-center gap-2 text-xs text-destructive px-4 py-2 bg-destructive/10 rounded-lg border border-destructive/20">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Erro ao carregar</span>
                        </div>
                      ) : (
                        <>
                          <div className="relative flex-1 max-w-xs">
                            <select
                              className="w-full h-9 pl-10 pr-4 py-2 text-sm border border-border/50 rounded-lg bg-background/50 hover:bg-background hover:border-primary/40 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              value={selectedPromptId}
                              onChange={(e) =>
                                setSelectedPromptId(e.target.value)
                              }
                              disabled={
                                isRemoving || extractLoading || removeLoading
                              }
                            >
                              <option value="">Selecione um prompt...</option>
                              {prompts?.prompts?.map((prompt) => (
                                <option key={prompt._id} value={prompt._id}>
                                  {prompt.type}
                                </option>
                              ))}
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={handleReExtractSameType}
                            disabled={
                              isRemoving ||
                              extractLoading ||
                              removeLoading ||
                              isExtracting ||
                              getIsProcessing()
                            }
                            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-wait disabled:animate-pulse shadow-md hover:shadow-lg transition-all duration-200 h-9 px-5 font-medium"
                          >
                            {isRemoving || isExtracting || getIsProcessing() ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span>
                                  {isRemoving
                                    ? "Removendo..."
                                    : "Processando..."}
                                </span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 transition-transform group-hover:rotate-180 duration-500" />
                                <span>Extrair Novamente</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveOnly}
                            disabled={
                              isRemoving || extractLoading || removeLoading
                            }
                            className="group relative text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 flex items-center gap-2 h-9 px-3 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
                          >
                            <div className="relative">
                              {isRemoving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                              )}
                            </div>
                            <span className="text-sm font-medium">Remover</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <InsightGeneric
                    data={document.data}
                    documentTitle={document.title}
                    processNumber={processNumber}
                    onSendToPipedrive={handleSendCalculationToPipedrive}
                  />
                </div>
              ) : documentStatus === StatusExtractionInsight.ERROR ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-red-500 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                      Erro ao Extrair Insights
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Ocorreu um erro durante a extração dos insights. Selecione
                      um prompt e tente novamente.
                    </p>
                  </div>
                  <div className="w-full max-w-xs mx-auto space-y-2">
                    <label className="block text-left text-xs font-medium mb-1">
                      Selecione o prompt:
                    </label>
                    {loadingPrompts ? (
                      <div className="text-xs text-muted-foreground">
                        Carregando prompts...
                      </div>
                    ) : errorPrompts ? (
                      <div className="text-xs text-destructive">
                        Erro ao carregar prompts
                      </div>
                    ) : (
                      <select
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={selectedPromptId}
                        onChange={(e) => setSelectedPromptId(e.target.value)}
                        disabled={isRemoving || extractLoading || removeLoading}
                      >
                        <option value="">Selecione...</option>
                        {prompts?.prompts?.map((prompt) => (
                          <option key={prompt._id} value={prompt._id}>
                            {prompt.type}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <Button
                    variant="default"
                    disabled={
                      isRemoving ||
                      extractLoading ||
                      removeLoading ||
                      !selectedPromptId
                    }
                    onClick={handleExtractInsights}
                    className="mt-2"
                  >
                    Tentar Novamente
                  </Button>
                  {(error || errorRemove) && (
                    <p className="text-xs text-destructive mt-2">
                      {error || errorRemove}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Extrair Insights com IA
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Nenhum insight foi extraído deste documento ainda.
                      Selecione um prompt abaixo para começar a análise.
                    </p>
                  </div>
                  <div className="w-full max-w-xs mx-auto space-y-2">
                    <label className="block text-left text-xs font-medium mb-1">
                      Selecione o prompt:
                    </label>
                    {loadingPrompts ? (
                      <div className="text-xs text-muted-foreground">
                        Carregando prompts...
                      </div>
                    ) : errorPrompts ? (
                      <div className="text-xs text-destructive">
                        Erro ao carregar prompts
                      </div>
                    ) : (
                      <select
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={selectedPromptId}
                        onChange={(e) => setSelectedPromptId(e.target.value)}
                        disabled={isRemoving || extractLoading || removeLoading}
                      >
                        <option value="">Selecione...</option>
                        {prompts?.prompts?.map((prompt) => (
                          <option key={prompt._id} value={prompt._id}>
                            {prompt.type}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <Button
                    variant="default"
                    disabled={
                      isRemoving ||
                      extractLoading ||
                      removeLoading ||
                      !selectedPromptId
                    }
                    onClick={handleExtractInsights}
                    className="mt-2"
                  >
                    Extrair Insights
                  </Button>
                  {(error || errorRemove) && (
                    <p className="text-xs text-destructive mt-2">
                      {error || errorRemove}
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
