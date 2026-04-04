"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw, FileText, Activity } from "lucide-react";

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
  const [selectedOption, setSelectedOption] = useState<'movements' | 'documents'>('movements');

  const handleConfirm = () => {
    onConfirm({ 
      movements: selectedOption === 'movements', 
      documents: selectedOption === 'documents' 
    });
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
            Opções de Sincronização
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Selecione qual tipo de dados deseja sincronizar:
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="radio"
                id="movements"
                name="syncOption"
                value="movements"
                checked={selectedOption === 'movements'}
                onChange={(e) => setSelectedOption(e.target.value as 'movements' | 'documents')}
                disabled={isPending}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <Label htmlFor="movements" className="flex items-center gap-3 cursor-pointer">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-base">Movimentações</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                type="radio"
                id="documents"
                name="syncOption"
                value="documents"
                checked={selectedOption === 'documents'}
                onChange={(e) => setSelectedOption(e.target.value as 'movements' | 'documents')}
                disabled={isPending}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <Label htmlFor="documents" className="flex items-center gap-3 cursor-pointer">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="text-base">Documentos</span>
              </Label>
            </div>
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
