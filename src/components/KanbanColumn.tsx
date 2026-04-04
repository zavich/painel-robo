import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "./KanbanCard";
import { Company, Process } from "@/app/interfaces/processes";
import { useTheme } from "@/app/hooks/use-theme-client";

interface KanbanColumnProps {
  id: string;
  title: string;
  processes: Process[];
  total?: number;
  onOpenCompany?: (company: Company) => void;
  isAdmin?: boolean;
}

export const KanbanColumn = ({
  id,
  title,
  processes,
  total,
  onOpenCompany,
  isAdmin = false,
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id });
  const { theme } = useTheme();

  const getColumnColor = (title: string) => {
    if (theme === "dark") {
      switch (title) {
        case "Pré-Análise":
          return "border-yellow-700 bg-gradient-to-b from-yellow-900/20 to-gray-800";
        case "Análise":
          return "border-blue-700 bg-gradient-to-b from-blue-900/20 to-gray-800";
        case "Cálculo":
          return "border-green-700 bg-gradient-to-b from-green-900/20 to-gray-800";
        default:
          return "border-gray-700 bg-gradient-to-b from-gray-800/50 to-gray-900";
      }
    }
    
    switch (title) {
      case "Pré-Análise":
        return "border-yellow-200 bg-gradient-to-b from-yellow-50/50 to-white";
      case "Análise":
        return "border-blue-200 bg-gradient-to-b from-blue-50/50 to-white";
      case "Cálculo":
        return "border-green-200 bg-gradient-to-b from-green-50/50 to-white";
      default:
        return "border-gray-200 bg-gradient-to-b from-gray-50/50 to-white";
    }
  };

  const getBadgeColor = (title: string) => {
    if (theme === "dark") {
      switch (title) {
        case "Pré-Análise":
          return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
        case "Análise":
          return "bg-blue-900/50 text-blue-300 border-blue-700";
        case "Cálculo":
          return "bg-green-900/50 text-green-300 border-green-700";
        default:
          return "bg-gray-700 text-gray-300 border-gray-600";
      }
    }
    
    switch (title) {
      case "Pré-Análise":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Análise":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Cálculo":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className={`flex-1 border-0 shadow-lg ${getColumnColor(title)}`}>
      <CardHeader className={`pb-4 border-b ${
        theme === "dark" ? "border-gray-700" : "border-gray-100"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className={`text-xl font-bold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>{title}</h3>
          </div>
          <Badge 
            variant="outline" 
            className={`text-sm font-semibold px-3 py-1.5 rounded-xl ${getBadgeColor(title)}`}
          >
            {typeof total === 'number' ? total : processes.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div ref={setNodeRef} className="space-y-4 min-h-[500px]">
          <SortableContext
            items={processes.map((p) => p._id)}
            strategy={verticalListSortingStrategy}
          >
            {processes.map((process, index) => (
              <KanbanCard
                key={index}
                process={process}
                onOpenCompany={onOpenCompany}
                isAdmin={isAdmin}
              />
            ))}
          </SortableContext>

          {processes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}>
                <svg className={`w-8 h-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className={`font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Nenhum processo nesta etapa</p>
              <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Os processos aparecerão aqui conforme forem movidos</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
