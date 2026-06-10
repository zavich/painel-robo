"use client";

import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActivityType } from "@/app/api/hooks/process/useCreateActivity";
import { ReasonLoss } from "@/app/api/hooks/reason-loss/useReasonLoss";
import { StageProcess } from "@/app/interfaces/processes";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const ACTIVITY_TYPES: {
  value: ActivityType;
  label: string;
  stage: StageProcess;
}[] = [
  {
    value: "PRE_ANALISE",
    label: "Pré-Análise",
    stage: StageProcess.PRE_ANALYSIS,
  },
  { value: "ANALISE", label: "Análise", stage: StageProcess.ANALYSIS },
  { value: "CALCULO", label: "Cálculo", stage: StageProcess.CALCULATION },
];

interface CompleteActivityDialogProps {
  open: boolean;
  showCompleteDialog: ActivityType | null;
  onOpenChange: (open: boolean) => void;
  theme: string;
  completeStatus: "APPROVE" | "LOSS" | "";
  onCompleteStatusChange: (value: "APPROVE" | "LOSS") => void;
  completeLossReason: string;
  onCompleteLossReasonChange: (value: string) => void;
  completeNotesMarkdown: string;
  onNotesChange: (value: string | undefined) => void;
  reasonLoss: ReasonLoss[] | undefined;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CompleteActivityDialog({
  open,
  showCompleteDialog,
  onOpenChange,
  theme,
  completeStatus,
  onCompleteStatusChange,
  completeLossReason,
  onCompleteLossReasonChange,
  completeNotesMarkdown,
  onNotesChange,
  reasonLoss,
  isPending,
  onConfirm,
  onCancel,
}: CompleteActivityDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent
        className={
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
        }
      >
        <DialogHeader>
          <DialogTitle
            className={theme === "dark" ? "text-gray-100" : "text-gray-900"}
          >
            Concluir Atividade
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
          >
            {showCompleteDialog &&
              `Deseja concluir a atividade de ${ACTIVITY_TYPES.find((t) => t.value === showCompleteDialog)?.label}?`}
          </p>

          <div>
            <Label
              className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
            >
              Status *
            </Label>
            <Select
              value={completeStatus}
              onValueChange={(value) => {
                onCompleteStatusChange(value as "APPROVE" | "LOSS");
                if (value === "APPROVE") {
                  onCompleteLossReasonChange("");
                }
              }}
            >
              <SelectTrigger
                className={
                  theme === "dark" ? "bg-gray-700 border-gray-600" : ""
                }
              >
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVE">Aprovar</SelectItem>
                <SelectItem value="LOSS">Recusar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {completeStatus === "LOSS" && (
            <div>
              <Label
                className={
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }
              >
                Motivo da Recusa *
              </Label>
              <Select
                value={completeLossReason}
                onValueChange={onCompleteLossReasonChange}
              >
                <SelectTrigger
                  className={
                    theme === "dark" ? "bg-gray-700 border-gray-600" : ""
                  }
                >
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {reasonLoss?.map((reason) => (
                    <SelectItem key={reason._id} value={reason.label}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label
              className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
            >
              Notas (opcional)
            </Label>
            <div className="mt-2" data-color-mode={theme}>
              <MDEditor
                value={completeNotesMarkdown}
                onChange={onNotesChange}
                preview="edit"
                height={300}
                visibleDragbar={false}
                data-color-mode={theme as "light" | "dark" | undefined}
              />
            </div>
            <p
              className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
            >
              Você pode usar formatação Markdown (negrito, itálico, listas,
              etc.)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={
              isPending ||
              !completeStatus ||
              (completeStatus === "LOSS" && !completeLossReason)
            }
          >
            {isPending
              ? "Concluindo..."
              : "Concluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
