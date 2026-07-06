import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, ChevronDown, FileText, RefreshCw } from "lucide-react";

interface ProcessActionsDropdownProps {
  theme: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewAnalysis?: () => void;
  onSync?: () => void;
  lawsuitStatusColeta?: string | null;
}

export const ProcessActionsDropdown = memo(function ProcessActionsDropdown({
  theme,
  open,
  onOpenChange,
  onViewAnalysis,
  onSync,
  lawsuitStatusColeta,
}: ProcessActionsDropdownProps) {
  const hasMenuItems = onViewAnalysis || onSync;
  // Sincronizar só é liberado enquanto o Athena não encontrou o processo —
  // uma vez encontrado, esse botão manual deixa de fazer sentido.
  const canSync = lawsuitStatusColeta === "NAO_ENCONTRADO";

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
        {onViewAnalysis && onSync && (
          <DropdownMenuSeparator className="md:hidden" />
        )}
        {onSync && (
          <DropdownMenuItem
            disabled={!canSync}
            onClick={() => {
              if (!canSync) return;
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
});
