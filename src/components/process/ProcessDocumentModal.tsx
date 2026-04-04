"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, TrendingUp, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import PDFViewerHeader from "@/components/shared/PdfViewerHeader";
const PDFViewer = dynamic(() => import("../shared/PDFViewer"), { ssr: false });
import InsightGeneric from "@/components/insights/InsightGeneric";
import CalcNoteModal, { buildCalcNoteMarkdown } from "./CalcNoteModal";
import { useExtractInsights } from "@/app/api/hooks/process/useExtractInsights";
import { usePrompts } from "@/app/api/hooks/process/usePrompts";
import { useRemoveInsights } from "@/app/api/hooks/process/useRemoveInsights";
import { useDocumentDetails } from "@/app/api/hooks/process/useDocumentDetails";
import { StatusExtractionInsight } from "@/app/interfaces/processes";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
import { toast } from "react-toastify";

interface ProcessDocumentModalProps {
  processNumber: string;
  documentId?: string;
  isOpen: boolean;
  onClose: () => void;
  onManagePrompts?: () => void;
}

export const ProcessDocumentModal = ({
  processNumber,
  documentId,
  isOpen,
  onClose,
  onManagePrompts,
}: ProcessDocumentModalProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [showRemoveOptions, setShowRemoveOptions] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchMatches, setSearchMatches] = useState<Element[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const { user } = useAuth();
  const [openCalcModal, setOpenCalcModal] = useState(false);

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

  // Hooks
  const {
    document,
    loading: statusLoading,
    refetch,
  } = useDocumentDetails({
    processNumber: processNumber || "",
    documentId: documentId || "",
    enabled: isOpen && !!processNumber && !!documentId,
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
      // Se completou mas não tem dados ainda, ainda está processando
      (documentStatus === StatusExtractionInsight.COMPLETED && !document?.data);

    return result;
  };

  const getHasInsights = () =>
    !!document?.data && documentStatus === StatusExtractionInsight.COMPLETED;

  const getStatusBadge = () => {
    if (documentStatus === StatusExtractionInsight.COMPLETED)
      return "Concluído";
    if (getIsProcessing()) return "Processando";
    if (documentStatus === StatusExtractionInsight.ERROR) return "Erro";
    return "Pendente";
  };

  const getStatusBadgeClass = () => {
    if (documentStatus === StatusExtractionInsight.COMPLETED)
      return "bg-green-100 text-green-800";
    if (getIsProcessing()) return "bg-blue-100 text-blue-800";
    if (documentStatus === StatusExtractionInsight.ERROR)
      return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

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

  useEffect(() => {
    if (!isOpen || !documentId) {
      setSelectedPromptId("");
      setIsExtracting(false);
      setIsRemoving(false);
      setShouldPoll(false);
      setShowRemoveOptions(false);
    }
  }, [isOpen, documentId]);

  // Seleciona automaticamente o prompt quando o modal abrir e houver documento
  useEffect(() => {
    if (
      isOpen &&
      document?.title &&
      prompts?.prompts &&
      prompts?.prompts?.length > 0 &&
      !selectedPromptId
    ) {
      const detectedPromptId = detectPromptFromTitle(document.title);
      if (detectedPromptId) {
        setSelectedPromptId(detectedPromptId);
      }
    }
  }, [
    isOpen,
    document?.title,
    prompts?.prompts?.length,
    selectedPromptId,
    detectPromptFromTitle,
  ]);

  async function handleExtractInsights() {
    if (!selectedPromptId) return;

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
        documents: [document?._id || ""],
        prompt: selectedPromptId,
      });
      // ✅ Aguarda um pouco antes de refetch para dar tempo do backend processar
      await new Promise((resolve) => setTimeout(resolve, 1000));
      refetch();
    } catch (err) {
      flushSync(() => {
        setIsExtracting(false);
        setShouldPoll(false);
      });
    }
  }

  async function handleRemoveOnly() {
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      await removeInsights({
        processNumber: processNumber || "",
        documentId: document?._id || "",
      });
      setSelectedPromptId("");
      setShowRemoveOptions(true);
      setIsRemoving(false);
      setShouldPoll(false);
      refetch();
    } catch (err) {
      setIsRemoving(false);
      setShowRemoveOptions(true);
    }
  }

  async function handleRemoveAndExtract() {
    if (isRemoving || isExtracting || !document?._id) return;

    // Detecta automaticamente o prompt baseado no título do documento
    const detectedPromptId = detectPromptFromTitle(document.title);
    const promptToUse = selectedPromptId || detectedPromptId;

    if (!promptToUse) {
      toast.error(
        "Não foi possível detectar o tipo de prompt. Por favor, selecione um prompt manualmente.",
      );
      return;
    }

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
      // Remove os insights existentes
      await removeInsights({
        processNumber: processNumber || "",
        documentId: document._id,
      });

      // Força refetch imediato para atualizar o status do documento após remoção
      await refetch();

      setIsRemoving(false);

      // Garante que isExtracting continue ativo antes de extrair
      flushSync(() => {
        setIsExtracting(true);
      });

      // Extrai os insights novamente com o prompt detectado/selecionado
      await extractInsights({
        number: processNumber ?? "",
        documents: [document._id],
        prompt: promptToUse ?? "",
      });

      // ✅ Aguarda um pouco antes de refetch para dar tempo do backend processar
      await new Promise((resolve) => setTimeout(resolve, 1000));
      refetch();
      // Não reseta isExtracting aqui - será resetado quando os dados estiverem disponíveis
    } catch (err) {
      setIsExtracting(false);
      setIsRemoving(false);
      setShouldPoll(false);
      setShowRemoveOptions(true);
    }
  }

  // Renderização
  if (!document && statusLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[1100px] h-[700px] max-w-none max-h-none flex flex-col">
          <DialogHeader>
            <DialogTitle>Carregando Documento</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando documento...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!document) return null;

  function renderInsightPanel() {
    return (
      <div className="w-96 flex-shrink-0 h-full flex flex-col">
        <div className="bg-card border border-border rounded-lg h-full flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Insights da IA
                  {getIsProcessing() && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Análises extraídas deste documento
                </p>
              </div>
              {/* {onManagePrompts && user.role === "admin" && ( */}
              <Button
                variant="outline"
                size="sm"
                onClick={onManagePrompts}
                className="text-xs"
              >
                Gerenciar Prompts
              </Button>
              {/* )} */}
            </div>
            <div className="mt-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass()}`}
              >
                {getStatusBadge()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full p-4">
              {getIsProcessing() ? (
                <div className="w-full space-y-4 py-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 h-6 w-6 border-2 border-blue-200 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900">
                          {isRemoving
                            ? "Removendo Insights Anteriores"
                            : "Extração em Andamento"}
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                          {isRemoving
                            ? "Limpando dados anteriores para nova extração..."
                            : "Nossa IA está analisando o documento e extraindo insights relevantes..."}
                        </p>
                        {selectedPromptId && !isRemoving && (
                          <p className="text-xs text-blue-600 mt-1">
                            Prompt:{" "}
                            {prompts?.prompts?.find(
                              (p) => p._id === selectedPromptId,
                            )?.type || "Carregando..."}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2 mb-3 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-blue-600">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        {isRemoving
                          ? "Removendo dados anteriores"
                          : "Extraindo insights"}
                      </span>
                      <span className="font-medium">
                        {isRemoving ? "Etapa 1/2" : "Etapa 2/2"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-9 h-5 rounded-full bg-amber-400 flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-amber-900">
                          !
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-amber-800 font-medium">
                          {isRemoving ? "Preparando Nova Extração" : "Aguarde"}
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          {isRemoving
                            ? "Primeiro removemos os insights antigos, depois extraímos novos com o prompt selecionado."
                            : "Este processo pode levar alguns minutos dependendo do tamanho e complexidade do documento."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : getHasInsights() ? (
                <div className="space-y-4">
                  <InsightGeneric
                    data={document?.data}
                    documentTitle={document?.title}
                  />
                  <div className="pt-4 border-t border-border space-y-3">
                    {!showRemoveOptions ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setShowRemoveOptions(true);
                          // setIsExtracting(false);
                        }}
                        className="w-full"
                      >
                        Gerenciar Insights
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            O que você deseja fazer?
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveOnly}
                          className="w-full"
                          disabled={
                            isRemoving || extractLoading || removeLoading
                          }
                        >
                          {isRemoving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Removendo...
                            </>
                          ) : (
                            "Apenas Remover Insights"
                          )}
                        </Button>
                        <div className="space-y-2">
                          <label className="block text-left text-xs font-medium">
                            Ou selecione um novo prompt e extraia novamente:
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
                          )}
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleRemoveAndExtract}
                          disabled={
                            isRemoving ||
                            extractLoading ||
                            removeLoading ||
                            isExtracting ||
                            getIsProcessing()
                          }
                          className="w-full disabled:cursor-wait disabled:animate-pulse"
                        >
                          {isRemoving || isExtracting || getIsProcessing() ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isRemoving ? "Removendo..." : "Processando..."}
                            </>
                          ) : (
                            "Remover e Extrair Novamente"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowRemoveOptions(false);
                            setSelectedPromptId("");
                          }}
                          disabled={
                            isRemoving || extractLoading || removeLoading
                          }
                          className="w-full"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                    {errorRemove && (
                      <p className="text-xs text-destructive mt-2">
                        {errorRemove}
                      </p>
                    )}
                  </div>
                </div>
              ) : documentStatus === StatusExtractionInsight.COMPLETED &&
                !document?.data ? (
                <div className="text-center py-8 flex flex-col items-center gap-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-muted-foreground mb-2">
                    Nenhum insight foi extraído deste documento.
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Não foi possível extrair insights com o prompt selecionado.
                    Se desejar, selecione um prompt e clique em{" "}
                    <strong>Extrair Insights</strong> abaixo.
                  </p>
                  <div className="w-full max-w-xs mx-auto mb-2">
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
                </div>
              ) : (
                <div className="text-center py-8 flex flex-col items-center gap-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  {getIsProcessing() ? (
                    <div className="w-full space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                            <div className="absolute inset-0 h-6 w-6 border-2 border-blue-200 rounded-full animate-ping opacity-75"></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900">
                              {isRemoving
                                ? "Removendo Insights Anteriores"
                                : "Extração em Andamento"}
                            </h4>
                            <p className="text-sm text-blue-700 mt-1">
                              {isRemoving
                                ? "Limpando dados anteriores para nova extração..."
                                : "Nossa IA está analisando o documento e extraindo insights relevantes..."}
                            </p>
                            {selectedPromptId && !isRemoving && (
                              <p className="text-xs text-blue-600 mt-1">
                                Prompt:{" "}
                                {prompts?.prompts?.find(
                                  (p) => p._id === selectedPromptId,
                                )?.type || "Carregando..."}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-2 mb-3 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-blue-600">
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            {isRemoving
                              ? "Removendo dados anteriores"
                              : "Extraindo insights"}
                          </span>
                          <span className="font-medium">
                            {isRemoving ? "Etapa 1/2" : "Etapa 2/2"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-9 h-5 rounded-full bg-amber-400 flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-amber-900">
                              !
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-amber-800 font-medium">
                              {isRemoving
                                ? "Preparando Nova Extração"
                                : "Aguarde"}
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              {isRemoving
                                ? "Primeiro removemos os insights antigos, depois extraímos novos com o prompt selecionado."
                                : "Este processo pode levar alguns minutos dependendo do tamanho e complexidade do documento."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : documentStatus === StatusExtractionInsight.ERROR ? (
                    <div className="w-full space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <span className="font-semibold text-red-700 block">
                          Erro ao extrair insights
                        </span>
                        <p className="text-xs text-red-600 mt-1">
                          Ocorreu um erro durante a extração dos insights.
                          Selecione um prompt e tente novamente.
                        </p>
                      </div>
                      <div className="w-full max-w-xs mx-auto">
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
                            onChange={(e) =>
                              setSelectedPromptId(e.target.value)
                            }
                            disabled={
                              isRemoving || extractLoading || removeLoading
                            }
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
                    <>
                      <p className="text-sm text-muted-foreground">
                        Nenhum insight foi extraído deste documento ainda.
                      </p>
                      <div className="w-full max-w-xs mx-auto mb-2">
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
                            onChange={(e) =>
                              setSelectedPromptId(e.target.value)
                            }
                            disabled={
                              isRemoving || extractLoading || removeLoading
                            }
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
                      {selectedPromptId &&
                        !isExtracting &&
                        !isRemoving &&
                        !extractLoading &&
                        !removeLoading && (
                          <div className="mt-2 text-xs text-muted-foreground text-left max-w-xs mx-auto">
                            <strong>Prompt selecionado:</strong>
                            <div className="border rounded bg-muted/40 p-2 max-h-40 overflow-auto mt-1">
                              <pre className="whitespace-pre-wrap">
                                {
                                  prompts?.prompts?.find(
                                    (p) => p._id === selectedPromptId,
                                  )?.text
                                }
                              </pre>
                            </div>
                          </div>
                        )}
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] h-[96vh] max-w-none max-h-none flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-8 pt-8">
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle className="text-xl">
                {document?.title || "Documento"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Enviado em {document?.date || "-"}
              </p>
            </div>
            {document?.title?.toLowerCase().includes("planilha de cálculos") ||
            document?.title?.toLowerCase().includes("planilha de cálculo") ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOpenCalcModal(true)}
              >
                Enviar notas ao Pipedrive
              </Button>
            ) : null}
          </div>
        </DialogHeader>
        <div className="flex-1 flex gap-8 min-h-0 px-8 pb-8">
          <div className="flex-1 bg-muted/20 rounded-lg border border-border flex flex-col overflow-hidden relative">
            <PDFViewerHeader
              pageNumber={pageNumber}
              numPages={numPages}
              scale={scale}
              onPrev={goToPrevPage}
              onNext={goToNextPage}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              hidePagination
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onSearchNext={handleSearchNext}
              onSearchPrev={handleSearchPrev}
              searchCount={searchMatches.length}
              searchIndex={searchIndex}
            />
            <div className="flex-1 flex flex-col min-h-0">
              {document?.temp_link?.toLowerCase().endsWith(".pdf") ? (
                <PDFViewer
                  pdfUrl={document?.temp_link}
                  pageNumber={pageNumber}
                  scale={scale}
                  numPages={numPages}
                  setNumPages={setNumPages}
                  hidePagination
                  searchValue={searchValue}
                  searchIndex={searchIndex}
                  setSearchMatches={setSearchMatches}
                />
              ) : (
                <div className="text-center p-8 w-full">
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
              )}
            </div>
            {document?.temp_link && (
              <div className="absolute bottom-4 right-4 z-10">
                <Button
                  variant="default"
                  size="sm"
                  onClick={async () => {
                    if (!document?.temp_link) return;
                    try {
                      const response = await fetch(document.temp_link, {
                        mode: "cors",
                      });
                      if (!response.ok) throw new Error("fetch failed");
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = window.document.createElement("a");
                      a.href = url;
                      a.download = document.title.endsWith(".pdf")
                        ? document.title
                        : `${document.title}.pdf`;
                      window.document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      window.open(document.temp_link, "_blank");
                    }
                  }}
                  className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Download className="h-4 w-4 text-white" />
                </Button>
              </div>
            )}
          </div>
          {renderInsightPanel()}
        </div>
        <CalcNoteModal
          open={openCalcModal}
          onOpenChange={setOpenCalcModal}
          titleSuffix={document?.title}
          initialValues={{
            ownerType:
              (document as any)?.data?.ownerType ||
              (document as any)?.data?.owner ||
              "perito",
            margemPercentual:
              (document as any)?.data?.margemPercentual ||
              (document as any)?.data?.margem_percentual ||
              "15%",
            valorComMargem:
              (document as any)?.data?.valorComMargem ||
              (document as any)?.data?.valor_com_margem,
            valorPosFgts:
              (document as any)?.data?.valorPosFgts ||
              (document as any)?.data?.valor_pos_fgts,
            valorPosHonorarios:
              (document as any)?.data?.valorPosHonorarios ||
              (document as any)?.data?.valor_pos_honorarios,
            desagio50:
              (document as any)?.data?.desagio50 ||
              (document as any)?.data?.desagio_50,
            desagio30:
              (document as any)?.data?.desagio30 ||
              (document as any)?.data?.desagio_30,
          }}
          onSubmit={(note) => {
            try {
              // Send note to opener (documents list page) if exists
              if (window.opener) {
                window.opener.postMessage({ type: "CALC_NOTE", note }, "*");
              } else {
                window.postMessage({ type: "CALC_NOTE", note }, "*");
              }
            } catch {}
            navigator.clipboard?.writeText(note).catch(() => {});
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
