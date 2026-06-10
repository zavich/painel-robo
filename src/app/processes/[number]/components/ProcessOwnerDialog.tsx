"use client";

import { ProcessOwnerSelector } from "@/components/ProcessOwnerSelector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";
import {
  AssignMemberModalProps,
  ProcessDataProps,
} from "./processActionDialogs.types";

type Props = {
  assignMemberModal: AssignMemberModalProps;
  processData: ProcessDataProps;
};

export function ProcessOwnerDialog({ assignMemberModal, processData }: Props) {
  const { process, refetchProcess } = processData;

  return (
    <Dialog open={assignMemberModal.open} onOpenChange={assignMemberModal.setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Atribuir Responsável
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ProcessOwnerSelector
            processId={process?.id ?? ""}
            currentOwnerEmail={process?.processOwner?.user?.email}
            onSuccess={() => {
              refetchProcess();
              assignMemberModal.setOpen(false);
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => assignMemberModal.setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
