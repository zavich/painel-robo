import { memo } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { RefreshCw, AlertCircle } from "lucide-react";

interface ProcessStatusBadgesProps {
  lawsuitStatusColeta?: string | null;
  lawsuitMotivoErro?: string | null;
}

export const ProcessStatusBadges = memo(function ProcessStatusBadges({
  lawsuitStatusColeta,
  lawsuitMotivoErro,
}: ProcessStatusBadgesProps) {
  return (
    <>
      {lawsuitStatusColeta === "SINCRONIZANDO" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-cyan-500 dark:bg-cyan-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Sincronizando</span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
          >
            <div className="space-y-2">
              <p className="font-bold text-cyan-600 dark:text-cyan-400">
                Sincronização em Andamento
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                O processo está sendo sincronizado. Aguarde a conclusão para
                visualizar os dados atualizados.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      {lawsuitStatusColeta &&
        lawsuitStatusColeta !== "SUCESSO" &&
        lawsuitStatusColeta !== "SINCRONIZANDO" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 dark:bg-red-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help">
              <AlertCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Erro</span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
          >
            <div className="space-y-2">
              <p className="font-bold text-red-600 dark:text-red-400">
                Erro na Coleta do PJe
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                <span className="font-semibold">Status:</span>{" "}
                {lawsuitStatusColeta}
              </p>
              {lawsuitMotivoErro && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Motivo:</span>{" "}
                  {lawsuitMotivoErro}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
});
