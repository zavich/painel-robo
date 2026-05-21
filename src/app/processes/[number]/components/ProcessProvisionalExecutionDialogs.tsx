"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Link2, RefreshCw, XCircle } from "lucide-react";
import {
  LinkProvisionalExecutionModalProps,
  ProcessDataProps,
  RemoveProvisionalLinkDialogProps,
} from "./processActionDialogs.types";

type Props = {
  linkProvisionalExecutionModal: LinkProvisionalExecutionModalProps;
  processData: ProcessDataProps;
  removeProvisionalLinkDialog: RemoveProvisionalLinkDialogProps;
};

export function ProcessProvisionalExecutionDialogs({
  linkProvisionalExecutionModal,
  processData,
  removeProvisionalLinkDialog,
}: Props) {
  const { process } = processData;

  return (
    <>
      <Dialog
        open={removeProvisionalLinkDialog.open}
        onOpenChange={removeProvisionalLinkDialog.setOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Confirmar Remoção de Vínculo
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
              Tem certeza que deseja remover o vínculo com a execução
              provisória?
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Atenção:</strong> Esta ação irá desvincular o processo
                da seguinte execução provisória:
              </p>
              <p className="text-xs font-mono text-amber-900 dark:text-amber-200 mt-2 break-all">
                {process?.calledByProvisionalLawsuitNumber}
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => removeProvisionalLinkDialog.setOpen(false)}
              disabled={removeProvisionalLinkDialog.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={removeProvisionalLinkDialog.onConfirm}
              disabled={removeProvisionalLinkDialog.isPending}
            >
              {removeProvisionalLinkDialog.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirmar Remoção
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={linkProvisionalExecutionModal.open}
        onOpenChange={linkProvisionalExecutionModal.setOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-yellow-600" />
              Vincular Execução Provisória
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-base text-gray-700 dark:text-gray-300">
              Insira o número da execução provisória que deseja vincular a este
              processo.
            </p>
            <div className="space-y-2">
              <Label
                htmlFor="execution-number"
                className="text-sm font-semibold text-foreground"
              >
                Número da Execução Provisória
              </Label>
              <Input
                id="execution-number"
                type="text"
                placeholder="Ex: 0000000-00.0000.0.00.0000"
                value={linkProvisionalExecutionModal.executionNumberInput}
                onChange={(e) =>
                  linkProvisionalExecutionModal.setExecutionNumberInput(
                    e.target.value,
                  )
                }
                className="w-full bg-card text-card-foreground border-border"
                disabled={linkProvisionalExecutionModal.isLoading}
              />
            </div>
            <div className="bg-secondary/10 dark:bg-secondary-foreground/10 border border-secondary dark:border-secondary-foreground rounded-lg p-3">
              <p className="text-sm text-secondary dark:text-secondary-foreground">
                <strong>Atenção:</strong> Certifique-se de que o número da
                execução provisória está correto antes de vincular.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                linkProvisionalExecutionModal.setOpen(false);
                linkProvisionalExecutionModal.setExecutionNumberInput("");
              }}
              disabled={linkProvisionalExecutionModal.isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={linkProvisionalExecutionModal.onConfirm}
              disabled={
                linkProvisionalExecutionModal.isLoading ||
                !linkProvisionalExecutionModal.executionNumberInput.trim()
              }
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {linkProvisionalExecutionModal.isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Vinculando...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Vincular
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
