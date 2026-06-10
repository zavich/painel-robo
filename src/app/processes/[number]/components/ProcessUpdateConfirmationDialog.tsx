"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpdateConfirmationDialogProps } from "./processActionDialogs.types";

export function ProcessUpdateConfirmationDialog({
  onAccept,
  onReject,
  open,
  setOpen,
}: UpdateConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Dados Atualizados Disponíveis
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-base">
          <p className="mb-3">
            Novos dados do processo foram detectados e estão disponíveis para
            atualização.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Atenção:</strong> Você possui alterações não salvas no
              formulário. Se aceitar a atualização, suas alterações serão
              perdidas.
            </p>
          </div>
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onReject}>
            Manter Minhas Alterações
          </Button>
          <Button
            variant="default"
            onClick={onAccept}
            className="bg-primary hover:bg-primary-light"
          >
            Atualizar Dados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
