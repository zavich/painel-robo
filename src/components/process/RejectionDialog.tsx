import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { getStageLabel } from "@/app/utils/processUtils";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { StageProcess } from "@/app/interfaces/processes";
import { RejectionReason } from "@/app/api/hooks/process/useRejectionReasons";
import { PipedriveFormData } from "./PipedriveFormCard";
import { useState } from "react";

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  setReason: (v: string) => void;
  reasonCustom: string;
  setReasonCustom: (v: string) => void;
  onConfirm: (formPipedrive?: PipedriveFormData) => void;
  isLoadingReasons: boolean;
  rejectionReasons: RejectionReason[];
  stage: StageProcess | undefined;
  setRefuseModalOpen: (open: boolean) => void;
  isPending: boolean;
  formPipedrive?: PipedriveFormData;
  reasonDescription: string;
  setReasonDescription: (v: string) => void;
}

export function RejectionDialog({
  open,
  onOpenChange,
  reason,
  setReason,
  reasonCustom,
  setReasonCustom,
  onConfirm,
  isLoadingReasons,
  rejectionReasons,
  stage,
  setRefuseModalOpen,
  isPending,
  formPipedrive,
  reasonDescription,
  setReasonDescription,
}: RejectionDialogProps) {
  const stageLabel = getStageLabel(stage);

  const getFilterPrefix = (stage?: StageProcess) => {
    switch (stage) {
      case StageProcess.PRE_ANALYSIS:
        return "PRÉ-ANÁLISE";
      case StageProcess.ANALYSIS:
        return "ANÁLISE";
      case StageProcess.CALCULATION:
        return "CÁLCULO";
      default:
        return "";
    }
  };

  const filterPrefix = getFilterPrefix(stage);

  let stageReasons = Array.isArray(rejectionReasons) ? rejectionReasons : [];

  if (filterPrefix) {
    const filteredReasons = stageReasons.filter((r) =>
      r.label.toUpperCase().includes(filterPrefix)
    );

    if (filteredReasons.length > 0) {
      stageReasons = filteredReasons;
    }
  }

  // Ensure keys are unique to avoid React warnings when rendering SelectItem
  const uniqueStageReasons = stageReasons.filter(
    (reason, index, self) =>
      index === self.findIndex((item) => item.key === reason.key)
  );

  // Estado local para controlar loading do botão
  const [localLoading, setLocalLoading] = useState(false);

  const handleConfirm = async () => {
    if (localLoading || isPending) return;
    setLocalLoading(true);
    try {
      await onConfirm(formPipedrive);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" style={{ minWidth: 0 }}>
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base text-gray-900 dark:text-gray-100">Motivo da Recusa</DialogTitle>
        </DialogHeader>

        {isLoadingReasons ? (
          <div className="flex justify-center py-2">
            <span className="text-muted-foreground dark:text-gray-400 text-sm">
              Carregando motivos...
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-8 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                {uniqueStageReasons.length > 0 ? (
                  <>
                    <SelectItem value="OTHER" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Motivo personalizado</SelectItem>
                    {uniqueStageReasons.map((reason: { key: string; label: string }) => (
                      <SelectItem key={reason.key} value={reason.key} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">
                        {reason.label}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <SelectItem value="OTHER" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Motivo personalizado</SelectItem>
                )}
              </SelectContent>
            </Select>

            {reason === "OTHER" && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="etapa-processo" className="text-xs text-gray-700 dark:text-gray-300">Etapa do Processo</Label>
                  <p className="font-medium text-primary dark:text-blue-400 text-xs">
                    {getStageLabel(stage)}
                  </p>
                </div>

                <div className="space-y-1 flex flex-col">
                  <Label htmlFor="motivo-personalizado" className="text-xs text-gray-700 dark:text-gray-300">
                    Motivo personalizado
                  </Label>
                  <input
                    id="motivo-personalizado"
                    type="text"
                    placeholder="Digite o motivo (sem espaços)"
                    value={reasonCustom}
                    onChange={(e) => {
                      // Remove espaços do início/fim e múltiplos espaços
                      const value = e.target.value.replace(/^\s+|\s+$/g, "").replace(/\s{2,}/g, " ");
                      setReasonCustom(value);
                    }}
                    className="min-h-[36px] text-xs w-1/2 border border-gray-300 dark:border-gray-600 rounded px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    maxLength={60}
                    autoComplete="off"
                  />
                  {reasonCustom && (
                    <div className="p-1 bg-muted dark:bg-gray-700 rounded text-xs mt-1 text-gray-900 dark:text-gray-100">
                      <strong>Preview:</strong>{" "}
                      {getStageLabel(stage)} – {reasonCustom.toUpperCase()}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                    Não é permitido digitar apenas espaços. Máximo 60 caracteres.
                  </p>
                </div>
              </div>
            )}

            {/* Campo de observação sempre visível */}
            <div>
              <Label htmlFor="observacao-motivo" className="text-xs text-gray-700 dark:text-gray-300">
                Observação do motivo
              </Label>
              <Textarea
                id="observacao-motivo"
                placeholder="Adicione uma observação detalhada do motivo da recusa..."
                value={reasonDescription}
                onChange={(e) => setReasonDescription(e.target.value)}
                className="min-h-[60px] text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        <DialogFooter className="mt-2 flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-xs px-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            onClick={() => {
              setRefuseModalOpen(false);
              setReason("");
              setReasonCustom("");
              setReasonDescription("");
            }}
            disabled={localLoading || isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="text-xs px-2"
            onClick={handleConfirm}
            disabled={
              localLoading ||
              isPending ||
              !reason ||
              (reason === "OTHER" && !reasonCustom.trim()) ||
              !(reasonDescription || "").trim()
            }
          >
            {(localLoading || isPending) ? "Processando..." : "Confirmar Recusa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}