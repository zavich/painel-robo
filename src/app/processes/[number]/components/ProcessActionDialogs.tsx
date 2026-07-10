"use client";

import { SyncOptionsModal } from "@/components/process/SyncOptionsModal";
import { ProcessActionDialogsProps } from "./processActionDialogs.types";

export function ProcessActionDialogs({
  syncOptionsModal,
}: ProcessActionDialogsProps) {
  return (
    <SyncOptionsModal
      isOpen={syncOptionsModal.open}
      onClose={() => syncOptionsModal.setOpen(false)}
      onConfirm={syncOptionsModal.onConfirm}
      isPending={syncOptionsModal.isPending}
    />
  );
}
