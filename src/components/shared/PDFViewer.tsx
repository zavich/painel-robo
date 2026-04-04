"use client";

import React, { useRef, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useTheme } from "@/app/hooks/use-theme-client";
import { useFetchPDF } from "@/app/api/hooks/process/useFetchPDF";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl: string; // Ignorado, agora usamos a rota
  pageNumber: number;
  scale: number;
  numPages?: number;
  setNumPages: (num: number) => void;
  retryKey?: number;
  hidePagination?: boolean;
  searchValue?: string;
  searchIndex?: number;
  setSearchMatches?: (matches: Element[]) => void;
}

const PDFViewerComponent: React.FC<PDFViewerProps> = ({
  pdfUrl,
  pageNumber,
  scale,
  numPages = 0,
  setNumPages,
  retryKey = 0,
  hidePagination = false,
  searchValue = "",
  searchIndex = 0,
  setSearchMatches,
}) => {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [internalRetryKey, setInternalRetryKey] = useState(retryKey);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(
    undefined,
  );
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const isMountedRef = useRef(true);
  const renderTasksRef = useRef<any[]>([]);
  const { theme } = useTheme();
  const pageWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const [visiblePageState, setVisiblePageState] = useState(pageNumber || 1);
  const visiblePageRef = useRef(visiblePageState);
  const setVisiblePage = (page: number) => {
    visiblePageRef.current = page;
    setVisiblePageState(page);
  };
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Cleanup quando componente desmontar
  useEffect(() => {
    isMountedRef.current = true;

    // Interceptar e silenciar warnings do TextLayer cancelled
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      if (
        (message.includes("TextLayer") && message.includes("cancel")) ||
        message.includes("AbortException") ||
        (message.includes("task") && message.includes("cancelled"))
      ) {
        return; // Silenciar este aviso específico
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      if (
        (message.includes("TextLayer") && message.includes("cancel")) ||
        message.includes("AbortException") ||
        (message.includes("task") && message.includes("cancelled"))
      ) {
        return; // Silenciar este erro específico
      }
      originalError.apply(console, args);
    };

    return () => {
      isMountedRef.current = false;
      // Restaurar console original
      console.warn = originalWarn;
      console.error = originalError;

      // Cancelar todas as tarefas de renderização pendentes
      renderTasksRef.current.forEach((task) => {
        if (task && task.cancel) {
          try {
            task.cancel();
          } catch (e) {
            // Silenciar erros de cancelamento
          }
        }
      });
      renderTasksRef.current = [];
    };
  }, []);

  // Cancelar renderizações quando o documento mudar
  useEffect(() => {
    setIsDocumentReady(false); // Reset ao mudar de documento
    return () => {
      // Cancelar todas as tarefas de renderização ao mudar de documento
      renderTasksRef.current.forEach((task) => {
        if (task && task.cancel) {
          try {
            task.cancel();
          } catch (e) {
            // Silenciar erros de cancelamento
          }
        }
      });
      renderTasksRef.current = [];
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfContainerRef.current) {
      pdfContainerRef.current.scrollTop = 0;
      pdfContainerRef.current.scrollLeft = 0;
    }
  }, [scale, pageNumber, internalRetryKey]);

  // Atualiza a largura do container quando disponível
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;

    // Atualiza largura imediatamente
    const updateWidth = () => {
      if (container && isMountedRef.current) {
        setContainerWidth(container.clientWidth);
      }
    };

    // Atualiza inicialmente
    updateWidth();

    // Observer para mudanças de tamanho
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [numPages]);

  useEffect(() => {
    if (!hidePagination) {
      setVisiblePage(pageNumber || 1);
      return;
    }
  }, [pageNumber, hidePagination]);

  useEffect(() => {
    if (!hidePagination || !pdfContainerRef.current || numPages === 0) return;

    const container = pdfContainerRef.current;
    let frameId: number | null = null;

    const updateVisiblePage = () => {
      if (!pageWrappersRef.current.length) return;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;
      let closestPage = visiblePageRef.current;
      let smallestOffset = Number.POSITIVE_INFINITY;

      pageWrappersRef.current.forEach((pageEl, index) => {
        if (!pageEl) return;
        const rect = pageEl.getBoundingClientRect();
        const pageCenter = rect.top + rect.height / 2;
        const offset = Math.abs(pageCenter - containerCenter);
        if (offset < smallestOffset) {
          smallestOffset = offset;
          closestPage = index + 1;
        }
      });

      if (closestPage !== visiblePageRef.current) {
        setVisiblePage(closestPage);
      }
    };

    const handleScroll = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateVisiblePage);
    };

    updateVisiblePage();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hidePagination, numPages, scale, internalRetryKey]);

  const handleRetry = () => setInternalRetryKey((prev) => prev + 1);

  // Memoizar options para evitar reloads desnecessários - usar ref para garantir mesma referência
  const documentOptionsRef = useRef({
    cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  });
  const documentOptions = documentOptionsRef.current;

  // Highlight search text
  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    if (
      !searchValue ||
      !pdfContainerRef.current ||
      numPages === 0 ||
      !isMountedRef.current
    ) {
      // Limpar highlights quando não há busca
      if (pdfContainerRef.current && isMountedRef.current) {
        const textLayers = pdfContainerRef.current.querySelectorAll(
          ".react-pdf__Page__textContent",
        );
        textLayers.forEach((layer) => {
          layer.querySelectorAll("span").forEach((span) => {
            const originalText = span.getAttribute("data-original-text");
            if (originalText) {
              span.textContent = originalText;
              span.removeAttribute("data-original-text");
              span.style.background = "";
              span.style.color = "";
              span.style.borderRadius = "";
              span.style.padding = "";
            }
          });
        });
      }
      return;
    }

    const tryHighlight = () => {
      if (cancelled || !isMountedRef.current) return;
      const textLayers = pdfContainerRef.current?.querySelectorAll(
        ".react-pdf__Page__textContent",
      );
      if (!textLayers || textLayers.length === 0) {
        if (isMountedRef.current) {
          timeoutId = setTimeout(tryHighlight, 200);
        }
        return;
      }

      let matchIdx = 0;
      const escapedSearchValue = searchValue.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      textLayers.forEach((layer) => {
        layer.querySelectorAll("span").forEach((span) => {
          // Salvar texto original
          if (!span.getAttribute("data-original-text")) {
            span.setAttribute("data-original-text", span.textContent || "");
          }

          const original =
            span.getAttribute("data-original-text") || span.textContent || "";

          if (original.toLowerCase().includes(searchValue.toLowerCase())) {
            const regex = new RegExp(`(${escapedSearchValue})`, "gi");
            const matches = Array.from(original.matchAll(regex));

            if (matches.length > 0) {
              let result = "";
              let lastIndex = 0;

              matches.forEach((match) => {
                const matchText = match[0];
                const matchStart = match.index || 0;

                // Texto antes do match
                result += original.substring(lastIndex, matchStart);

                // Texto do match com highlight
                if (matchIdx === searchIndex) {
                  result += `<mark style="background: #2563eb; color: #fff; border-radius: 3px; padding: 0 2px; font-weight: 600;">${matchText}</mark>`;
                } else {
                  result += `<mark style="background: #fef3c7; color: #92400e; border-radius: 3px; padding: 0 2px;">${matchText}</mark>`;
                }

                matchIdx++;
                lastIndex = matchStart + matchText.length;
              });

              // Resto do texto
              result += original.substring(lastIndex);
              span.innerHTML = result;
            }
          } else {
            // Restaurar texto original se não houver match
            span.textContent = original;
            span.style.background = "";
            span.style.color = "";
          }
        });
      });
    };

    // Aguardar um pouco mais para garantir que o texto foi renderizado
    timeoutId = setTimeout(tryHighlight, 300);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchValue, pageNumber, scale, numPages, searchIndex]);

  useEffect(() => {
    if (!searchValue || !pdfContainerRef.current || !isMountedRef.current) {
      if (isMountedRef.current) {
        setSearchMatches?.([]);
      }
      return;
    }

    // Aguarda highlight ser aplicado antes do scroll e atualizar matches
    const highlightTimeout = setTimeout(() => {
      if (!pdfContainerRef.current || !isMountedRef.current) return;

      // Buscar spans que contêm o texto procurado
      const allSpans = Array.from(
        pdfContainerRef.current.querySelectorAll(
          ".react-pdf__Page__textContent span",
        ),
      );

      const matchedSpans = allSpans.filter((span) => {
        const originalText =
          span.getAttribute("data-original-text") || span.textContent || "";
        return originalText.toLowerCase().includes(searchValue.toLowerCase());
      });

      setSearchMatches?.(matchedSpans);

      // Scroll para o match atual
      if (
        matchedSpans.length > 0 &&
        searchIndex >= 0 &&
        searchIndex < matchedSpans.length
      ) {
        const targetSpan = matchedSpans[searchIndex];
        if (targetSpan && isMountedRef.current) {
          try {
            targetSpan.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          } catch (e) {
            // Silenciar erros de scrollIntoView (elemento pode ter sido desmontado)
          }
        }
      }
    }, 400); // Tempo suficiente para renderizar e fazer highlight

    return () => clearTimeout(highlightTimeout);
  }, [searchValue, pageNumber, scale, numPages, searchIndex, setSearchMatches]);

  const { fetchPDF } = useFetchPDF();

  useEffect(() => {
    let abortController = new AbortController();
    setPdfBlobUrl(null);
    setIsDocumentReady(false);

    const fetchBlob = async () => {
      try {
        const blob = await fetchPDF(pdfUrl);
        if (!blob) throw new Error("Erro ao buscar PDF");

        const url = URL.createObjectURL(blob);
        console.log(`PDF blob fetched: ${blob.size} bytes, URL: ${url}`);

        setPdfBlobUrl(url);
      } catch (e) {
        setPdfBlobUrl(null);
      }
    };
    fetchBlob();
    return () => {
      abortController.abort();
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfUrl, retryKey]);

  return (
    <div
      ref={pdfContainerRef}
      className={`w-full h-full overflow-y-auto pdf-scroll p-4 pb-20 relative ${
        theme === "dark" ? "bg-gray-900" : "bg-background"
      }`}
    >
      {hidePagination && numPages > 0 && (
        <div className="sticky top-0 z-20 flex justify-end mb-4 pointer-events-none">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg border pointer-events-auto ${
              theme === "dark"
                ? "bg-gray-800/80 text-gray-50 border-gray-700"
                : "bg-white/90 text-gray-900 border-border"
            }`}
          >
            Página <span className="font-bold">{visiblePageState}</span> de{" "}
            <span className="font-bold">{numPages}</span>
          </span>
        </div>
      )}
      <Document
        key={internalRetryKey}
        file={pdfBlobUrl}
        onLoadSuccess={({ numPages }) => {
          if (isMountedRef.current) {
            setNumPages(numPages);
            // Adiciona um pequeno delay para garantir que o worker está pronto
            setTimeout(() => {
              setIsDocumentReady(true);
            }, 100);
          }
        }}
        onLoadError={(error) => {
          console.debug("PDF load error:", error);
          setIsDocumentReady(false);
        }}
        loading={
          <div
            className={`text-center ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}
          >
            Carregando PDF...
          </div>
        }
        error={
          <div
            className={`text-center ${theme === "dark" ? "text-red-400" : "text-destructive"}`}
          >
            Erro ao carregar PDF.
          </div>
        }
        options={documentOptions}
      >
        {hidePagination && numPages > 0 && containerWidth && isDocumentReady ? (
          // Mostra todas as páginas para scroll livre
          <div className="flex flex-col gap-4">
            {Array.from({ length: numPages }).map((_, idx) => (
              <div
                key={`${idx + 1}-${internalRetryKey}`}
                ref={(el) => {
                  pageWrappersRef.current[idx] = el;
                }}
                className="shadow-md mx-auto bg-background"
              >
                <Page
                  pageNumber={idx + 1}
                  scale={scale}
                  width={containerWidth - 32}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="w-full"
                  onRenderSuccess={(page) => {
                    // Armazenar referência da tarefa de renderização
                    if (page && page._transport) {
                      renderTasksRef.current.push(page._transport);
                    }
                  }}
                  onRenderError={(error) => {
                    // Silenciar erros de renderização (como TextLayer cancelled ou AbortException)
                    const errorMsg = error.message || error.toString() || "";
                    if (
                      !errorMsg.includes("TextLayer") &&
                      !errorMsg.includes("cancel") &&
                      !errorMsg.includes("AbortException")
                    ) {
                      console.debug(`Page ${idx + 1} render error:`, errorMsg);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        ) : !hidePagination &&
          containerWidth &&
          numPages > 0 &&
          isDocumentReady ? (
          <Page
            key={`${pageNumber}-${internalRetryKey}`}
            pageNumber={pageNumber}
            scale={scale}
            width={containerWidth}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            onRenderSuccess={(page) => {
              // Armazenar referência da tarefa de renderização
              if (page && page._transport) {
                renderTasksRef.current.push(page._transport);
              }
            }}
            onRenderError={(error) => {
              // Silenciar erros de renderização (como TextLayer cancelled ou AbortException)
              const errorMsg = error.message || error.toString() || "";
              if (
                !errorMsg.includes("TextLayer") &&
                !errorMsg.includes("cancel") &&
                !errorMsg.includes("AbortException")
              ) {
                console.debug(`Page ${pageNumber} render error:`, errorMsg);
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <div
              className={`text-center ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}
            >
              Preparando visualização...
            </div>
            <button
              type="button"
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              onClick={handleRetry}
            >
              Tentar novamente
            </button>
          </div>
        )}
      </Document>
    </div>
  );
};

export default PDFViewerComponent;
