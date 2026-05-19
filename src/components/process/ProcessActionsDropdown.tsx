import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  ChevronDown,
  FileSearch,
  FileText,
  ClipboardList,
  User,
  RefreshCw,
} from "lucide-react";

interface ProcessActionsDropdownProps {
  theme: string;
  isAdmin: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewPreAnalysis?: () => void;
  onViewAnalysis?: () => void;
  onViewProcessInfo?: () => void;
  onAssignMember?: () => void;
  onChangeStage?: () => void;
  onSync?: () => void;
}

export function ProcessActionsDropdown({
  theme,
  isAdmin,
  open,
  onOpenChange,
  onViewPreAnalysis,
  onViewAnalysis,
  onViewProcessInfo,
  onAssignMember,
  onChangeStage,
  onSync,
}: ProcessActionsDropdownProps) {
  const hasMenuItems =
    onViewProcessInfo || onAssignMember || onChangeStage || onSync;

  if (!hasMenuItems) return null;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 px-3 ${
            theme === "dark"
              ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Ações</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`w-56 ${
          theme === "dark"
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        {onViewPreAnalysis && (
          <DropdownMenuItem
            onClick={() => {
              onViewPreAnalysis();
              onOpenChange(false);
            }}
            className="gap-2 md:hidden"
          >
            <FileSearch className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            Pré-Análise
          </DropdownMenuItem>
        )}
        {onViewAnalysis && (
          <DropdownMenuItem
            onClick={() => {
              onViewAnalysis();
              onOpenChange(false);
            }}
            className="gap-2 md:hidden"
          >
            <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            Análise
          </DropdownMenuItem>
        )}
        {(onViewPreAnalysis || onViewAnalysis) &&
          (onViewProcessInfo || onAssignMember || onChangeStage || onSync) && (
            <DropdownMenuSeparator className="md:hidden" />
          )}
        {onViewProcessInfo && (
          <DropdownMenuItem
            onClick={() => {
              onViewProcessInfo();
              onOpenChange(false);
            }}
            className="gap-2"
          >
            <ClipboardList className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Informações do Processo
          </DropdownMenuItem>
        )}
        {onAssignMember && (
          <DropdownMenuItem
            onClick={() => {
              onAssignMember();
              onOpenChange(false);
            }}
            className="gap-2"
          >
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Atribuir Membro
          </DropdownMenuItem>
        )}
        {isAdmin && onChangeStage && (
          <DropdownMenuItem
            onClick={() => {
              onChangeStage();
              onOpenChange(false);
            }}
            className="gap-2"
          >
            <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            Alterar Etapa do Processo
          </DropdownMenuItem>
        )}
        {onSync && (
          <DropdownMenuItem
            onClick={() => {
              onSync();
              onOpenChange(false);
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            Sincronizar Processo
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
