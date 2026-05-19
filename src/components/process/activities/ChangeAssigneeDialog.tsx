"use client";

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

interface ChangeAssigneeDialogProps {
  open: boolean;
  showChangeAssigneeDialog: ActivityType | null;
  onOpenChange: (open: boolean) => void;
  theme: string;
  newAssignee: string;
  onNewAssigneeChange: (value: string) => void;
  users: AssignableUser[] | undefined;
  isPending: boolean;
  onConfirm: () => void;
}

export function ChangeAssigneeDialog({
  open,
  showChangeAssigneeDialog,
  onOpenChange,
  theme,
  newAssignee,
  onNewAssigneeChange,
  users,
  isPending,
  onConfirm,
}: ChangeAssigneeDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !open && onOpenChange(false)}
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
            Alterar Responsável
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
          >
            {showChangeAssigneeDialog &&
              `Selecione o novo responsável para a atividade de ${ACTIVITY_TYPES.find((t) => t.value === showChangeAssigneeDialog)?.label}`}
          </p>
          <div>
            <Label
              className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
            >
              Novo Responsável
            </Label>
            <Select value={newAssignee} onValueChange={onNewAssigneeChange}>
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
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!newAssignee || isPending}
          >
            {isPending ? "Alterando..." : "Alterar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
