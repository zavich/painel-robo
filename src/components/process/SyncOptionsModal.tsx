"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";

interface SyncOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { movements: boolean; documents: boolean }) => void;
  isPending: boolean;
}

export function SyncOptionsModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: SyncOptionsModalProps) {
  const handleConfirm = () => {
    onConfirm({ movements: false, documents: true });
  };

  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Sincronizar Processo
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
            Isso vai sincronizar os documentos deste processo.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
