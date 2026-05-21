"use client";

import { PeticaoInicialData, Process } from "@/app/interfaces/processes";

export interface ProcessActionDialogsProps {
  assignMemberModal: {
    open: boolean;
    setOpen: (open: boolean) => void;
  };
  changeStageDialog: {
    open: boolean;
    setOpen: (open: boolean) => void;
  };
  companyModal: {
    open: boolean;
    selectedCompanyCnpj: string;
    setOpen: (open: boolean) => void;
    setSelectedCompany: (company: null) => void;
  };
  linkProvisionalExecutionModal: {
    executionNumberInput: string;
    isLoading: boolean;
    onConfirm: () => void;
    open: boolean;
    setExecutionNumberInput: (value: string) => void;
    setOpen: (open: boolean) => void;
  };
  processData: {
    claimant: ReturnType<typeof import("@/app/utils/processPartsUtils").getClaimant>;
    initialPetitionData: PeticaoInicialData | undefined;
    isAdmin: boolean;
    isRefetching: boolean;
    isSyncing: boolean;
    process: Process | undefined | null;
    refetchProcess: () => void;
  };
  processInfoModal: {
    open: boolean;
    setOpen: (open: boolean) => void;
  };
  removeProvisionalLinkDialog: {
    isPending: boolean;
    onConfirm: () => void;
    open: boolean;
    setOpen: (open: boolean) => void;
  };
  syncCompleteDialog: {
    open: boolean;
    setOpen: (open: boolean) => void;
  };
  syncOptionsModal: {
    isPending: boolean;
    onConfirm: (options: { movements: boolean; documents: boolean }) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
  };
  updateConfirmationDialog: {
    onAccept: () => void;
    onReject: () => void;
    open: boolean;
    setOpen: (open: boolean) => void;
  };
}

export type ProcessDataProps = ProcessActionDialogsProps["processData"];
export type AssignMemberModalProps = ProcessActionDialogsProps["assignMemberModal"];
export type LinkProvisionalExecutionModalProps =
  ProcessActionDialogsProps["linkProvisionalExecutionModal"];
export type RemoveProvisionalLinkDialogProps =
  ProcessActionDialogsProps["removeProvisionalLinkDialog"];
export type SyncCompleteDialogProps = ProcessActionDialogsProps["syncCompleteDialog"];
export type SyncOptionsModalProps = ProcessActionDialogsProps["syncOptionsModal"];
export type UpdateConfirmationDialogProps =
  ProcessActionDialogsProps["updateConfirmationDialog"];
export type ProcessInfoModalProps = ProcessActionDialogsProps["processInfoModal"];
