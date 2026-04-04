"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useTheme } from "@/app/hooks/use-theme-client";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmar ação",
  description = "Tem certeza que deseja realizar esta ação?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  const { theme } = useTheme();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`sm:max-w-md ${
          theme === "dark" 
            ? "bg-gray-800 border-gray-700" 
            : "bg-white border-gray-200"
        }`}
      >
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              variant === "destructive"
                ? theme === "dark" ? "bg-red-900/30" : "bg-red-100"
                : theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
            }`}>
              {variant === "destructive" ? (
                <Trash2 className={`h-6 w-6 ${
                  theme === "dark" ? "text-red-400" : "text-red-600"
                }`} />
              ) : (
                <AlertTriangle className={`h-6 w-6 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`} />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className={`text-xl font-bold mb-2 ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                {title}
              </DialogTitle>
              <DialogDescription className={`text-base leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className={`${
              theme === "dark"
                ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                : "border-gray-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading ? "Processando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

