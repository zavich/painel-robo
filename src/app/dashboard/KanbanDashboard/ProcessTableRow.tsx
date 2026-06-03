import { type Dispatch, memo, type SetStateAction } from "react";
import {
  Activity,
  ActivityType,
} from "@/app/api/hooks/process/useCreateActivity";
import { Process } from "@/app/interfaces/processes";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { capitalizeWords } from "@/app/utils/format";
import { getProcessTitle } from "@/app/utils/processPartsUtils";
import { hasError } from "@/app/utils/processSyncStatus";
import { AlertCircle } from "lucide-react";

export interface ProcessTableRowProps {
  process: Process;
  isSelected: boolean;
  selectAllMode: "page" | "all" | null;
  visibleProcessIds: string[];
  getFilteredActivities: (process: Process) => Activity[];
  setSelectedProcessIds: Dispatch<SetStateAction<Set<string>>>;
  setSelectAllMode: (mode: "page" | "all" | null) => void;
}

export const ProcessTableRow = memo(function ProcessTableRow({
  process,
  isSelected,
  selectAllMode,
  visibleProcessIds,
  getFilteredActivities,
  setSelectedProcessIds,
  setSelectAllMode,
}: ProcessTableRowProps) {
  const activityLabels: Record<ActivityType, string> = {
    PRE_ANALISE: "Pré-Análise",
    ANALISE: "Análise",
    CALCULO: "Cálculo",
  };

  const filteredActivities = getFilteredActivities(process);

  return (
    <TableRow
      key={process._id}
      className={`transition-all duration-150 cursor-pointer ${
        isSelected
          ? "bg-primary/10 border-primary/30 dark:border-blue-700/50"
          : "hover:bg-gray-50 border-gray-200 dark:hover:bg-gray-700/50 dark:border-gray-700"
      }`}
    >
      <TableCell
        onClick={(e) => {
          e.stopPropagation();
          if (selectAllMode === "all") {
            setSelectedProcessIds(() => {
              const newSet = new Set(visibleProcessIds);
              newSet.delete(process._id);
              return newSet;
            });
          } else {
            setSelectedProcessIds((previousIds) => {
              const newSet = new Set(previousIds);
              if (isSelected) {
                newSet.delete(process._id);
              } else {
                newSet.add(process._id);
              }
              return newSet;
            });
          }
        }}
        className="cursor-pointer text-center align-middle group"
      >
        <div
          className="flex items-center justify-center p-1 rounded-md transition-colors group-hover:bg-blue-50 dark:group-hover:bg-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selectAllMode === "all" || isSelected}
            onCheckedChange={(checked) => {
              if (selectAllMode === "all") {
                setSelectedProcessIds(() => {
                  const newSet = new Set(visibleProcessIds);
                  newSet.delete(process._id);
                  return newSet;
                });
                setSelectAllMode(null);
              } else {
                setSelectedProcessIds((previousIds) => {
                  const newSet = new Set(previousIds);
                  if (checked) {
                    newSet.add(process._id);
                  } else {
                    newSet.delete(process._id);
                  }
                  return newSet;
                });
              }
            }}
          />
        </div>
      </TableCell>
      <TableCell
        className="font-medium"
        onClick={() =>
          (window.location.href = `/processes/${process.number}`)
        }
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {capitalizeWords(
                getProcessTitle(
                  process.processParts || [],
                  process.number,
                  process.title ||
                    process.formPipedrive?.title,
                ),
              )}
            </span>
            {process.processOwner?.user?.email && (
              <span className="text-xs text-gray-600 dark:text-gray-500 truncate">
                {process.processOwner.user.email}
              </span>
            )}
          </div>

          {hasError(process.processStatus) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2 p-1 rounded-md text-red-700 bg-red-50/90 dark:bg-red-900/80 cursor-help">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs bg-red-50 text-red-900 border border-red-200 dark:bg-red-800 dark:text-red-100 dark:border-red-700 shadow-sm"
              >
                <div className="text-sm">
                  <div className="font-medium mb-1">
                    Problema no processamento
                  </div>
                  <div className="text-xs">
                    {process.processStatus?.errorReason ||
                      process.processStatus?.log ||
                      process.processStatus?.name}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>
      <TableCell
        onClick={() =>
          (window.location.href = `/processes/${process.number}`)
        }
      >
        <span className="text-xs font-mono text-muted-foreground">
          {process.number}
        </span>
      </TableCell>
      <TableCell
        onClick={() =>
          (window.location.href = `/processes/${process.number}`)
        }
      >
        {process.valueCase ? (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(process.valueCase)}
          </span>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-600">
            -
          </span>
        )}
      </TableCell>
      <TableCell
        onClick={() =>
          (window.location.href = `/processes/${process.number}`)
        }
      >
        <span className="text-xs text-muted-foreground">
          {process.createdAt
            ? new Date(process.createdAt).toLocaleDateString("pt-BR")
            : "-"}
        </span>
      </TableCell>
      <TableCell
        className="text-center"
        onClick={() =>
          (window.location.href = `/processes/${process.number}`)
        }
      >
        {process.hasInstancias ? (
          <Badge
            variant="outline"
            className="border-primary text-primary bg-primary/10 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-950/30"
          >
            ✓
          </Badge>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-600">
            -
          </span>
        )}
      </TableCell>
      <TableCell
        className="text-center"
        onClick={() =>
          (window.location.href = `/processes/${process.number}`)
        }
      >
        {process.hasDocuments ? (
          <Badge
            variant="outline"
            className="border-emerald-500 text-emerald-600 bg-emerald-500/10 dark:border-green-500 dark:text-green-400 dark:bg-green-950/30"
          >
            ✓
          </Badge>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-600">
            -
          </span>
        )}
      </TableCell>
      <TableCell
        className="text-center"
        onClick={() =>
          (window.location.href = `/processes/${process.number}`)
        }
      >
        {filteredActivities.length === 0 ? (
          <span className="text-xs text-gray-400 dark:text-gray-600">
            -
          </span>
        ) : (
          <div className="flex flex-col gap-1 items-center">
            {filteredActivities.map((activity, index) => {
              const label =
                activityLabels[activity.type] || activity.type;
              const isCompleted = activity.isCompleted;

              return (
                <Badge
                  key={activity._id || index}
                  variant="outline"
                  className={`text-xs ${
                    isCompleted
                      ? "border-emerald-500 text-emerald-600 bg-emerald-500/10 dark:border-green-500 dark:text-green-400 dark:bg-green-950/30"
                      : "border-yellow-500 text-yellow-700 bg-yellow-50 dark:border-yellow-500 dark:text-yellow-400 dark:bg-yellow-950/30"
                  }`}
                  title={`${label}${isCompleted ? " - Concluída" : " - Pendente"}`}
                >
                  {label}
                </Badge>
              );
            })}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
});
