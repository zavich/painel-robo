export interface ProcessActionDialogsProps {
  syncOptionsModal: {
    isPending: boolean;
    onConfirm: (options: { movements: boolean; documents: boolean }) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
  };
}

export type SyncOptionsModalProps = ProcessActionDialogsProps["syncOptionsModal"];
