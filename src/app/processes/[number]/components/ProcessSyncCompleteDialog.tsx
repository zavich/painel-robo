"use client";

import { ProcessStatusEnum } from "@/app/interfaces/processes";
import {
  getSyncStatusDescription,
  getSyncType,
  hasError,
  isIntermediateStatus,
} from "@/app/utils/processSyncStatus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Check } from "lucide-react";
import {
  ProcessDataProps,
  SyncCompleteDialogProps,
} from "./processActionDialogs.types";

type Props = {
  processData: ProcessDataProps;
  syncCompleteDialog: SyncCompleteDialogProps;
};

export function ProcessSyncCompleteDialog({
  processData,
  syncCompleteDialog,
}: Props) {
  const { process } = processData;

  return (
    <Dialog
      open={syncCompleteDialog.open}
      onOpenChange={syncCompleteDialog.setOpen}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasError(process?.processStatus) ? (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                Erro na Sincronização
              </>
            ) : (
              <>
                <Check className="h-5 w-5 text-green-500" />
                Sincronização Concluída
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-base">
          {hasError(process?.processStatus) ? (
            <>
              <p className="mb-3">
                Ocorreu um erro durante a sincronização do processo. Verifique
                os detalhes abaixo e tente novamente mais tarde.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-2">
                <div className="text-sm text-red-700 dark:text-red-300">
                  <strong>Processo:</strong> {process?.number}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  <strong>Status:</strong>{" "}
                  {process?.processStatus?.name || ProcessStatusEnum.ERROR}
                </div>
                {process?.processStatus?.errorReason && (
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <strong>Motivo:</strong> {process.processStatus.errorReason}
                  </div>
                )}
                {process?.processStatus?.log && (
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <strong>Log:</strong> {process.processStatus.log}
                  </div>
                )}
                {process?.processStatus?.updatedAt && (
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <strong>Data:</strong>{" "}
                    {new Date(process.processStatus.updatedAt).toLocaleString(
                      "pt-BR",
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mb-3">
                {getSyncStatusDescription(process?.processStatus)}
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-2">
                <div className="text-sm text-green-700 dark:text-green-300">
                  <strong>Processo:</strong> {process?.number}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  <strong>Status:</strong>{" "}
                  {process?.processStatus?.name || ProcessStatusEnum.PROCESSED}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  <strong>Tipo:</strong> {getSyncType(process?.processStatus)}
                </div>
                {process?.processStatus?.log && (
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <strong>Detalhes:</strong> {process.processStatus.log}
                  </div>
                )}
                {process?.synchronizedAt && (
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <strong>Sincronizado em:</strong>{" "}
                    {new Date(process.synchronizedAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                )}
              </div>
              <div className="mt-3 p-3 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary dark:text-primary-foreground font-medium">
                  {process?.processStatus?.name ===
                  ProcessStatusEnum.EXTRACTION_FINISHED
                    ? "⚠️ Para visualizar os novos documentos, clique em 'Recarregar Dados' abaixo."
                    : "✓ Clique em 'Recarregar Dados' para visualizar as atualizações."}
                </p>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => syncCompleteDialog.setOpen(false)}
          >
            Fechar
          </Button>
          {!hasError(process?.processStatus) &&
            !isIntermediateStatus(process?.processStatus) && (
              <Button
                variant="default"
                onClick={() => {
                  syncCompleteDialog.setOpen(false);
                  window.location.reload();
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Recarregar Dados
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
