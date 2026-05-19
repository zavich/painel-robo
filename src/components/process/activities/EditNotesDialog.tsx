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
import { AssignableUser } from "@/app/api/hooks/users/useAssignableUsers";
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

interface EditNotesDialogProps {
  open: boolean;
  showEditNotesDialog: { activityType: ActivityType; currentNotes: string } | null;
  onOpenChange: (open: boolean) => void;
  theme: string;
  isAdmin: boolean;
  editAssignee: string;
  onEditAssigneeChange: (value: string) => void;
  users: AssignableUser[] | undefined;
  editNotesMarkdown: string;
  onNotesChange: (value: string | undefined) => void;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EditNotesDialog({
  open,
  showEditNotesDialog,
  onOpenChange,
  theme,
  isAdmin,
  editAssignee,
  onEditAssigneeChange,
  users,
  editNotesMarkdown,
  onNotesChange,
  isPending,
  onConfirm,
  onCancel,
}: EditNotesDialogProps) {
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
            Editar Nota
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
          >
            {showEditNotesDialog &&
              `Edite a nota da atividade de ${ACTIVITY_TYPES.find((t) => t.value === showEditNotesDialog.activityType)?.label}`}
          </p>

          {isAdmin && (
            <div>
              <Label
                className={
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }
              >
                Responsável
              </Label>
              <Select value={editAssignee} onValueChange={onEditAssigneeChange}>
                <SelectTrigger
                  className={
                    theme === "dark" ? "bg-gray-700 border-gray-600" : ""
                  }
                >
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.email}
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
              Notas
            </Label>
            <div className="mt-2" data-color-mode={theme}>
              <MDEditor
                value={editNotesMarkdown}
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
            disabled={isPending}
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
