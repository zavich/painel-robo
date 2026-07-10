"use client";

import { CompanyModalDialog } from "@/components/process/CompanyModalDialog";
import { SyncOptionsModal } from "@/components/process/SyncOptionsModal";
import { ProcessProvisionalExecutionDialogs } from "./ProcessProvisionalExecutionDialogs";
import { ProcessSyncCompleteDialog } from "./ProcessSyncCompleteDialog";
import { ProcessUpdateConfirmationDialog } from "./ProcessUpdateConfirmationDialog";
import { ProcessActionDialogsProps } from "./processActionDialogs.types";

export function ProcessActionDialogs({
  companyModal,
  linkProvisionalExecutionModal,
  processData,
  removeProvisionalLinkDialog,
  syncCompleteDialog,
  syncOptionsModal,
  updateConfirmationDialog,
}: ProcessActionDialogsProps) {
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

      <ProcessProvisionalExecutionDialogs
        linkProvisionalExecutionModal={linkProvisionalExecutionModal}
        processData={processData}
        removeProvisionalLinkDialog={removeProvisionalLinkDialog}
      />
    </>
  );
}
