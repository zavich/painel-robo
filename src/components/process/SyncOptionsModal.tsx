"use client";

import { useEffect, useState } from "react";
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
  // Estado local, sincrônico com o clique — não espera `isPending` (que só
  // reflete a mutation depois de propagar por várias camadas de props) pra
  // mostrar o loading. Sem isso o botão ficava parecendo "parado" até a
  // requisição terminar de ir e voltar.
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsConfirming(false);
    }
  }, [isOpen]);

  const isBusy = isConfirming || isPending;

  const handleConfirm = () => {
    setIsConfirming(true);
    onConfirm({ movements: false, documents: true });
  };

  const handleClose = () => {
    if (!isBusy) {
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
            disabled={isBusy}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isBusy}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isBusy ? (
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
