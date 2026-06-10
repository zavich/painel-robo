import { memo } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  AlertCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Process, Situation } from "@/app/interfaces/processes";
import { getStageLabel } from "@/app/utils/processUtils";

interface ProcessStatusBadgesProps {
  process: Process;
  isRefetching: boolean;
  isSyncing: boolean;
  onRemoveProvisionalLink?: () => void;
  onLinkProvisionalExecution?: () => void;
}

export const ProcessStatusBadges = memo(function ProcessStatusBadges({
  process,
  isRefetching,
  isSyncing,
  onRemoveProvisionalLink,
  onLinkProvisionalExecution,
}: ProcessStatusBadgesProps) {
  return (
    <>
      {isRefetching && !isSyncing && (
        <div className="flex items-center gap-1 ml-1 sm:ml-2">
          <RefreshCw className="h-3 w-3 text-primary animate-spin" />
          <span className="text-[10px] sm:text-xs text-primary font-medium">
            Atualizando...
          </span>
        </div>
      )}
      {(isSyncing || process?.processStatus?.name === "Processando") && (
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
              {process?.processStatus?.log && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Status:</span>{" "}
                  {process.processStatus.log}
                </p>
              )}
              {process?.processStatus?.updatedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Última atualização:{" "}
                  {new Date(process.processStatus.updatedAt).toLocaleString(
                    "pt-BR",
                  )}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      {!process?.dealId && process?.situation === Situation.PENDING && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-500 dark:bg-amber-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help">
              <AlertCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Sem Deal ID</span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
          >
            <div className="space-y-2">
              <p className="font-bold text-amber-600 dark:text-amber-400">
                Processo sem Deal ID do Pipedrive
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Este processo não possui um dealId vinculado ao Pipedrive.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Entre em contato com o suporte ou verifique a integração com o
                Pipedrive.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      {/* Badge para processo SEM vínculo - clicável */}
      {process?.class === "MAIN" &&
        !process?.calledByProvisionalLawsuitNumber && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  onLinkProvisionalExecution?.();
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 dark:from-yellow-600 dark:to-amber-700 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-pointer hover:from-yellow-600 hover:to-amber-700 dark:hover:from-yellow-700 dark:hover:to-amber-800 transition-all"
              >
                <AlertCircle className="h-3 w-3" />
                <span className="hidden sm:inline">
                  Inserir Execução Provisória
                </span>
                <span className="sm:hidden">Inserir Exec.</span>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
            >
              <div className="space-y-2">
                <p className="font-bold text-yellow-600 dark:text-yellow-400">
                  Vincular Execução Provisória
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Este processo não possui uma execução provisória vinculada.
                  Clique para inserir e vincular uma execução provisória a
                  este processo principal.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      {process?.dealId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={`https://prosolutti.pipedrive.com/deal/${process.dealId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">Pipedrive</span>
            </a>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
          >
            <div className="space-y-2">
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                Ver Deal no Pipedrive
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Clique para abrir este processo no Pipedrive em uma nova aba.
              </p>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mt-2">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  <span className="font-semibold">Deal ID:</span>{" "}
                  {process.dealId}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      {process?.processStatus?.name ===
        "Extração de movimentações Finalizada" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500 dark:bg-blue-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Processando Docs</span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
          >
            <div className="space-y-2">
              <p className="font-bold text-blue-600 dark:text-blue-400">
                Sincronizando Documentos
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                As movimentações foram sincronizadas com sucesso. Aguarde
                enquanto os documentos são processados.
              </p>
              {process.processStatus.log && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Status:</span>{" "}
                  {process.processStatus.log}
                </p>
              )}
              {process.processStatus.updatedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Última atualização:{" "}
                  {new Date(process.processStatus.updatedAt).toLocaleString(
                    "pt-BR",
                  )}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      {process?.processStatus?.name === "Error" && (
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
                Erro no Processamento
              </p>
              {process.processStatus.errorReason && (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">Motivo:</span>{" "}
                  {process.processStatus.errorReason}
                </p>
              )}
              {process.processStatus.log && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Log:</span>{" "}
                  {process.processStatus.log}
                </p>
              )}
              {process.processStatus.updatedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(process.processStatus.updatedAt).toLocaleString(
                    "pt-BR",
                  )}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
      {process?.situation === Situation.LOSS && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 dark:bg-red-600 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium shadow-sm cursor-help">
              <XCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Declinado</span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="max-w-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
          >
            <div className="space-y-2">
              <p className="font-bold text-red-600 dark:text-red-400">
                Processo Declinado
              </p>
              {process?.processDecisions?.history?.find(
                (h) => h.status === Situation.LOSS,
              )?.rejection_reason && (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">Motivo:</span>{" "}
                  {
                    process.processDecisions.history.find(
                      (h) => h.status === Situation.LOSS,
                    )?.rejection_reason
                  }
                </p>
              )}
              {process?.processDecisions?.history?.find(
                (h) => h.status === Situation.LOSS,
              )?.rejection_description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Descrição:</span>{" "}
                  {
                    process.processDecisions.history.find(
                      (h) => h.status === Situation.LOSS,
                    )?.rejection_description
                  }
                </p>
              )}
              {process?.stage && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Etapa:</span>{" "}
                  {getStageLabel(process.stage)}
                </p>
              )}
              {process?.processDecisions?.history?.find(
                (h) => h.status === Situation.LOSS,
              )?.createdAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Data da recusa:{" "}
                  {new Date(
                    process.processDecisions.history.find(
                      (h) => h.status === Situation.LOSS,
                    )?.createdAt || "",
                  ).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
});
