"use client";

import { DocumentExtract, Process } from "@/app/interfaces/processes";
import { ActivitiesCard } from "@/components/process/ActivitiesCard";
import { DocumentsCard } from "@/components/process/DocumentsCard";

type ProcessSidebarProps = {
  activeRightTab: "documents" | "activities";
  linkedDocuments: DocumentExtract[];
  onManagePrompts: () => void;
  process: Process | null | undefined;
  refetchProcess: () => Promise<Process | undefined>;
  selectedDocumentId: string | null;
  setActiveRightTab: (tab: "documents" | "activities") => void;
  overrideDocument?: {
    title: string;
    blob: Blob;
    movementId?: number;
    texto?: string;
  } | null;
  onCloseOverrideDocument?: () => void;
};

export function ProcessSidebar({
  activeRightTab,
  linkedDocuments,
  onManagePrompts,
  process,
  refetchProcess,
  selectedDocumentId,
  setActiveRightTab,
  overrideDocument,
  onCloseOverrideDocument,
}: ProcessSidebarProps) {
  const documents = linkedDocuments.length > 0 ? linkedDocuments : process?.documents || [];

  return (
    <div className="z-0 lg:col-span-4 h-[500px] sm:h-[600px] lg:h-[calc(100vh-200px)] order-2">
      <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={() => setActiveRightTab("documents")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 relative ${
              activeRightTab === "documents"
                ? "text-secondary"
                : "text-gray-600 dark:text-gray-400 hover:text-secondary"
            }`}
          >
            <span className="relative z-10">Documentos</span>
            {activeRightTab === "documents" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
            )}
          </button>

          <button
            onClick={() => setActiveRightTab("activities")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 relative ${
              activeRightTab === "activities"
                ? "text-secondary"
                : "text-gray-600 dark:text-gray-400 hover:text-secondary"
            }`}
          >
            <span className="relative z-10">Atividades</span>
            {activeRightTab === "activities" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />
            )}
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {activeRightTab === "documents" ? (
            <DocumentsCard
              documents={documents}
              selectedDocumentId={selectedDocumentId}
              processNumber={process?.number || ""}
              dealId={process?.dealId}
              onManagePrompts={onManagePrompts}
              overrideDocument={overrideDocument}
              onCloseOverrideDocument={onCloseOverrideDocument}
            />
          ) : (
            <div className="h-full overflow-hidden">
              <ActivitiesCard process={process ?? null} onUpdate={refetchProcess} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
