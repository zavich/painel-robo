"use client";

import { ChangeStageDialog } from "@/components/process/ChangeStageDialog";
import { CompanyModalDialog } from "@/components/process/CompanyModalDialog";
import { SyncOptionsModal } from "@/components/process/SyncOptionsModal";
import { ProcessInfoDialog } from "./ProcessInfoDialog";
import { ProcessOwnerDialog } from "./ProcessOwnerDialog";
import { ProcessProvisionalExecutionDialogs } from "./ProcessProvisionalExecutionDialogs";
import { ProcessSyncCompleteDialog } from "./ProcessSyncCompleteDialog";
import { ProcessUpdateConfirmationDialog } from "./ProcessUpdateConfirmationDialog";
import { ProcessActionDialogsProps } from "./processActionDialogs.types";

export function ProcessActionDialogs({
  assignMemberModal,
  changeStageDialog,
  companyModal,
  linkProvisionalExecutionModal,
  processData,
  processInfoModal,
  removeProvisionalLinkDialog,
  syncCompleteDialog,
  syncOptionsModal,
  updateConfirmationDialog,
}: ProcessActionDialogsProps) {
  const { isAdmin, process, refetchProcess } = processData;

  return (
    <>
      <CompanyModalDialog
        cnpj={companyModal.selectedCompanyCnpj}
        isOpen={companyModal.open}
        onClose={() => {
          companyModal.setOpen(false);
          companyModal.setSelectedCompany(null);
        }}
      />

      {isAdmin && (
        <ChangeStageDialog
          process={process || null}
          open={changeStageDialog.open}
          onOpenChange={changeStageDialog.setOpen}
          onSuccess={refetchProcess}
        />
      )}

      <ProcessUpdateConfirmationDialog {...updateConfirmationDialog} />

      <ProcessSyncCompleteDialog
        processData={processData}
        syncCompleteDialog={syncCompleteDialog}
      />

      <SyncOptionsModal
        isOpen={syncOptionsModal.open}
        onClose={() => syncOptionsModal.setOpen(false)}
        onConfirm={syncOptionsModal.onConfirm}
        isPending={syncOptionsModal.isPending}
      />

      <ProcessInfoDialog
        processData={processData}
        processInfoModal={processInfoModal}
      />

      <ProcessOwnerDialog
        assignMemberModal={assignMemberModal}
        processData={processData}
      />

      <ProcessProvisionalExecutionDialogs
        linkProvisionalExecutionModal={linkProvisionalExecutionModal}
        processData={processData}
        removeProvisionalLinkDialog={removeProvisionalLinkDialog}
      />
    </>
  );
}
