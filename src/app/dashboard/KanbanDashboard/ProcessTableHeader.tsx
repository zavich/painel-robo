import { Process } from "@/app/interfaces/processes";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ProcessTableHeaderProps {
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  filteredProcesses: Process[];
  setSelectedProcessIds: (ids: Set<string>) => void;
  setSelectAllMode: (mode: "page" | "all" | null) => void;
}

export function ProcessTableHeader({
  allVisibleSelected,
  someVisibleSelected,
  filteredProcesses,
  setSelectedProcessIds,
  setSelectAllMode,
}: ProcessTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="border-gray-200 dark:border-gray-700">
        <TableHead className="w-12">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={
                      allVisibleSelected && filteredProcesses.length > 0
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => {
                      if (checked === true || checked === "indeterminate") {
                        // Select all visible
                        setSelectedProcessIds(
                          new Set(filteredProcesses.map((p) => p._id)),
                        );
                        setSelectAllMode("page");
                      } else {
                        // Deselect all
                        setSelectedProcessIds(new Set());
                        setSelectAllMode(null);
                      }
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {allVisibleSelected
                    ? "Desmarcar todos"
                    : someVisibleSelected
                      ? `Selecionar todos os ${filteredProcesses.length} visíveis`
                      : `Selecionar todos os ${filteredProcesses.length} visíveis`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableHead>
        <TableHead>Título</TableHead>
        <TableHead>Número do Processo</TableHead>
        <TableHead>Valor da Causa</TableHead>
        <TableHead>Data</TableHead>
        <TableHead className="text-center">Instâncias</TableHead>
        <TableHead className="text-center">Documentos</TableHead>
        <TableHead className="text-center">Atividades</TableHead>
      </TableRow>
    </TableHeader>
  );
}
