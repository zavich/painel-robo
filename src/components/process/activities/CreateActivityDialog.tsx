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

interface CreateActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: string;
  selectedType: ActivityType | "";
  onSelectedTypeChange: (value: ActivityType) => void;
  selectedAssignee: string;
  onSelectedAssigneeChange: (value: string) => void;
  users: AssignableUser[] | undefined;
  isPending: boolean;
  onConfirm: () => void;
}

export function CreateActivityDialog({
  open,
  onOpenChange,
  theme,
  selectedType,
  onSelectedTypeChange,
  selectedAssignee,
  onSelectedAssigneeChange,
  users,
  isPending,
  onConfirm,
}: CreateActivityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
        }
      >
        <DialogHeader>
          <DialogTitle
            className={theme === "dark" ? "text-gray-100" : "text-gray-900"}
          >
            Criar Nova Atividade
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label
              className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
            >
              Tipo de Atividade
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) =>
                onSelectedTypeChange(value as ActivityType)
              }
            >
              <SelectTrigger
                className={
                  theme === "dark" ? "bg-gray-700 border-gray-600" : ""
                }
              >
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
            >
              Responsável
            </Label>
            <Select
              value={selectedAssignee}
              onValueChange={onSelectedAssigneeChange}
            >
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
            disabled={
              !selectedType ||
              !selectedAssignee ||
              isPending
            }
          >
            {isPending ? "Criando..." : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
