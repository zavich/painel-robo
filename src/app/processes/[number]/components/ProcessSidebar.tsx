"use client";

import { DocumentExtract, Process } from "@/app/interfaces/processes";
import { DocumentsCard } from "@/components/process/DocumentsCard";

type ProcessSidebarProps = {
  linkedDocuments: DocumentExtract[];
  process: Process | null | undefined;
  selectedDocumentId: string | null;
  overrideDocument?: {
    title: string;
    blob: Blob;
    movementId?: number;
    texto?: string;
  } | null;
  onCloseOverrideDocument?: () => void;
};

export function ProcessSidebar({
  linkedDocuments,
  process,
  selectedDocumentId,
  overrideDocument,
  onCloseOverrideDocument,
}: ProcessSidebarProps) {
  const documents = linkedDocuments.length > 0 ? linkedDocuments : process?.documents || [];

  return (
    <div className="z-0 lg:col-span-4 h-[500px] sm:h-[600px] lg:h-[calc(100vh-200px)] order-2">
      <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex-1 px-4 py-3 text-sm font-medium text-secondary relative">
            <span className="relative z-10">Documentos</span>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <DocumentsCard
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            processNumber={process?.number || ""}
            overrideDocument={overrideDocument}
            onCloseOverrideDocument={onCloseOverrideDocument}
          />
        </div>
      </div>
    </div>
  );
}
