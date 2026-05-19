import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanCard } from "@/components/KanbanCard";
import Loading from "@/components/Loading";
import { CompanyModalDialog } from "./process/CompanyModalDialog";
import { Process, Company } from "@/app/interfaces/processes";

export interface KanbanBoardProps {
  stages: { id: string; title: string; color: string }[];
  getProcessesByStage: (stage: string) => Process[];
  handleOpenCompany: (company: Company) => void;
  activeProcess: Process | null;
  isLoading: boolean;
  page: number;
  selectedCompany: Company | null;
  showCompanyModal: boolean;
  setShowCompanyModal: (open: boolean) => void;
  isAdmin?: boolean;
  getStageTotal?: (stage: string) => number | undefined;
}

export function KanbanBoard({
  stages,
  getProcessesByStage,
  handleOpenCompany,
  activeProcess,
  isLoading,
  page,
  selectedCompany,
  showCompanyModal,
  setShowCompanyModal,
  isAdmin = false,
  getStageTotal,
}: KanbanBoardProps) {
  return (
    <>
      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            id={stage.id}
            title={stage.title}
            processes={getProcessesByStage(stage.id)}
            total={getStageTotal?.(stage.id)}
            onOpenCompany={handleOpenCompany}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Active Process */}
      {activeProcess && (
        <div className="mb-8">
          <KanbanCard
            key={activeProcess._id}
            process={activeProcess}
            onOpenCompany={handleOpenCompany}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {/* Loading More */}
      {isLoading && page > 1 && (
        <div className="flex justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <Loading message="Carregando mais processos..." />
          </div>
        </div>
      )}

      {/* Company Modal */}
      <CompanyModalDialog
        cnpj={selectedCompany?.cnpj || ""}
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
      />
    </>
  );
}