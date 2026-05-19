import { Process } from "@/app/interfaces/processes";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export interface ProcessTableToolbarProps {
  totalProcessesInDB: number;
  filteredProcesses: Process[];
  selectedCount: number;
  selectAllMode: "page" | "all" | null;
  allVisibleSelected: boolean;
  handleOpenExportDialog: () => void;
  setSelectAllMode: (mode: "page" | "all" | null) => void;
  setSelectedProcessIds: (ids: Set<string>) => void;
}

export function ProcessTableToolbar({
  totalProcessesInDB,
  filteredProcesses,
  selectedCount,
  selectAllMode,
  allVisibleSelected,
  handleOpenExportDialog,
  setSelectAllMode,
  setSelectedProcessIds,
}: ProcessTableToolbarProps) {
  return (
    <>
      {/* Card header: title, export button, process count badge */}
      <div className="px-6 py-4 border-b flex items-center justify-between border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Lista de Processos
        </h2>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenExportDialog}
            className="gap-2 border-border bg-background hover:bg-primary/10 text-foreground"
            disabled={filteredProcesses.length === 0}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <div className="px-3 py-1 rounded-full text-sm font-semibold border transition-colors bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/20">
            {(() => {
              const total = totalProcessesInDB;
              return `${total} ${total === 1 ? "processo" : "processos"}`;
            })()}
          </div>
        </div>
      </div>

      {/* Action Bar - Shows when items are selected */}
      {selectedCount > 0 && (
        <div className="px-6 py-3 border-b flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} selecionado{selectedCount !== 1 ? "s" : ""}
          </span>
          <div className="flex-1" />
        </div>
      )}

      {/* Banner for selecting all from database */}
      {selectAllMode === "page" &&
        allVisibleSelected &&
        totalProcessesInDB > filteredProcesses.length && (
          <div className="px-6 py-3 border-b flex items-center gap-3 bg-primary/10 border-primary/20 dark:border-gray-700">
            <span className="text-sm text-foreground">
              {filteredProcesses.length} processo
              {filteredProcesses.length !== 1 ? "s" : ""} selecionado
              {filteredProcesses.length !== 1 ? "s" : ""} nesta página.
            </span>
            <button
              onClick={() => setSelectAllMode("all")}
              className="text-sm font-semibold underline text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Selecionar todos os {totalProcessesInDB} processos
            </button>
          </div>
        )}

      {/* Banner showing all selected */}
      {selectAllMode === "all" && (
        <div className="px-6 py-3 border-b flex items-center gap-3 bg-primary/10 border-primary/20 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Todos os {totalProcessesInDB} processos estão selecionados.
          </span>
          <button
            onClick={() => {
              setSelectAllMode("page");
              setSelectedProcessIds(
                new Set(filteredProcesses.map((p) => p._id)),
              );
            }}
            className="text-sm font-semibold underline text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Limpar seleção
          </button>
        </div>
      )}
    </>
  );
}
