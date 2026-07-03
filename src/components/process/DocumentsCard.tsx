import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { DocumentExtract } from "@/app/interfaces/processes";
import dynamic from "next/dynamic";
import PDFViewerHeader from "@/components/shared/PdfViewerHeader";
const PDFViewer = dynamic(() => import("@/components/shared/PDFViewer"), {
  ssr: false,
});
import { useDocumentDetails } from "@/app/api/hooks/process/useDocumentDetails";
import { logger } from "@/app/lib/logger";
import { useFetchPDF } from "@/app/api/hooks/process/useFetchPDF";

interface DocumentsCardProps {
  documents: DocumentExtract[];
  isLoading?: boolean;
  selectedDocumentId?: string | null;
  processNumber?: string;
  // PDF gerado no cliente (ex: texto de movimentação do PJe) — quando
  // presente, exibe direto nesse mesmo painel, sem buscar documento no Mongo.
  overrideDocument?: {
    title: string;
    blob: Blob;
    movementId?: number;
    texto?: string;
  } | null;
  onCloseOverrideDocument?: () => void;
}

export function DocumentsCard({
  isLoading = false,
  selectedDocumentId,
  processNumber,
  overrideDocument,
  onCloseOverrideDocument,
}: DocumentsCardProps) {
  const { fetchPDF } = useFetchPDF();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [pdfSearchValue, setPdfSearchValue] = useState("");
  const [searchMatches, setSearchMatches] = useState<Element[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);

  const { document } = useDocumentDetails({
    processNumber: processNumber || "",
    documentId: selectedDocumentId || "",
    enabled: !!selectedDocumentId && !!processNumber && !overrideDocument,
    interval: 0,
  });

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
      {(selectedDocumentId && document) || overrideDocument ? (
        <CardContent className="pt-0 flex-1 flex flex-col min-h-0 relative">
          {/* Renderizar visualizador de documento */}
          <div className="flex-1 flex flex-col min-h-0 bg-muted/20 rounded-lg border border-border">
            {overrideDocument && (
              <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40">
                <p className="text-sm font-medium truncate">
                  {overrideDocument.title}
                </p>
                {onCloseOverrideDocument && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCloseOverrideDocument}
                    className="h-7 px-2 text-xs"
                  >
                    Fechar
                  </Button>
                )}
              </div>
            )}
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
              {overrideDocument || document?.temp_link?.toLowerCase().endsWith(".pdf") ? (
                <PDFViewer
                  pdfUrl={document?.temp_link || ""}
                  blobOverride={overrideDocument?.blob}
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
              {overrideDocument && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const url = window.URL.createObjectURL(overrideDocument.blob);
                    const a = window.document.createElement("a");
                    a.href = url;
                    a.download = overrideDocument.title.endsWith(".pdf")
                      ? overrideDocument.title
                      : `${overrideDocument.title}.pdf`;
                    window.document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transition-shadow h-8 sm:h-9 w-8 sm:w-auto px-2 sm:px-3"
                  aria-label="Download"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              {document?.temp_link && !overrideDocument && (
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
                      logger.error("Erro ao baixar documento:", err as object);
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
    </Card>
  );
}
