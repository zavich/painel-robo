"use client";

import { Process } from "@/app/interfaces/processes";
import {
  getSyncStatusDescription,
  hasError,
  isSyncCompleted,
  shouldContinueMonitoring,
} from "@/app/utils/processSyncStatus";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { buildTrackedProcessSnapshot } from "./processPageState.utils";

type UseProcessUpdateMonitorParams = {
  clearEditingState: () => void;
  clearFormChanges: () => void;
  currentStatusInfo: {
    errorReason?: string;
    log?: string;
    name: string;
    updatedAt: string;
  } | null;
  hasUnsavedChanges: boolean;
  isEditing: boolean;
  process: Process | null | undefined;
  setCurrentStatusInfo: Dispatch<
    SetStateAction<{
      errorReason?: string;
      log?: string;
      name: string;
      updatedAt: string;
    } | null>
  >;
};

export function useProcessUpdateMonitor({
  clearEditingState,
  clearFormChanges,
  currentStatusInfo,
  hasUnsavedChanges,
  isEditing,
  process,
  setCurrentStatusInfo,
}: UseProcessUpdateMonitorParams) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastProcessData, setLastProcessData] = useState<Process | null>(null);
  const [pendingProcessData, setPendingProcessData] = useState<Process | null>(null);
  const [showSyncCompleteDialog, setShowSyncCompleteDialog] = useState(false);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const ignoredUpdateSnapshotRef = useRef<string | null>(null);

  const handleAcceptUpdate = useCallback(() => {
    if (!pendingProcessData) {
      return;
    }

    setLastProcessData(pendingProcessData);
    clearEditingState();
    clearFormChanges();
    setShowUpdateConfirmation(false);
    setPendingProcessData(null);
    ignoredUpdateSnapshotRef.current = null;

    toast.info("Dados atualizados com sucesso!", {
      position: "top-right",
      autoClose: 3000,
    });
  }, [clearEditingState, clearFormChanges, pendingProcessData]);

  const handleRejectUpdate = useCallback(() => {
    ignoredUpdateSnapshotRef.current = pendingProcessData
      ? buildTrackedProcessSnapshot(pendingProcessData)
      : null;
    setShowUpdateConfirmation(false);
    setPendingProcessData(null);

    toast.warning(
      "Atualização cancelada. Seus dados não salvos foram preservados.",
      {
        position: "top-right",
        autoClose: 4000,
      },
    );
  }, [pendingProcessData]);

  useEffect(() => {
    if (process && !lastProcessData) {
      setLastProcessData(process);
    }
  }, [lastProcessData, process]);

  useEffect(() => {
    if (!process || !lastProcessData) {
      return;
    }

    const currentSnapshot = buildTrackedProcessSnapshot(process);
    const lastSnapshot = buildTrackedProcessSnapshot(lastProcessData);

    if (currentSnapshot === lastSnapshot) {
      ignoredUpdateSnapshotRef.current = null;
      return;
    }

    if (currentSnapshot === ignoredUpdateSnapshotRef.current) {
      return;
    }

    if (isEditing || hasUnsavedChanges) {
      setPendingProcessData(process);
      setShowUpdateConfirmation(true);
      return;
    }

    setLastProcessData(process);
  }, [hasUnsavedChanges, isEditing, lastProcessData, process]);

  useEffect(() => {
    if (process?.processStatus && !currentStatusInfo) {
      setCurrentStatusInfo({
        name: process.processStatus.name,
        log: process.processStatus.log,
        errorReason: process.processStatus.errorReason,
        updatedAt: process.processStatus.updatedAt,
      });
    }
  }, [currentStatusInfo, process?.processStatus]);

  useEffect(() => {
    if (!process?.processStatus) {
      return;
    }

    const isActivelySyncing = shouldContinueMonitoring(process.processStatus);
    const isFinalSyncCompleted = isSyncCompleted(process.processStatus);
    const hasErrorStatus = hasError(process.processStatus);

    if (isSyncing && !isActivelySyncing) {
      if (hasErrorStatus) {
        toast.error("Erro na sincronização do processo!", {
          position: "top-right",
          autoClose: 5000,
          toastId: "sync-error",
        });
        setShowSyncCompleteDialog(true);
        setIsSyncing(false);
      } else if (isFinalSyncCompleted) {
        toast.success(
          `${getSyncStatusDescription(process.processStatus)} com sucesso!`,
          {
            position: "top-right",
            autoClose: 3000,
            toastId: "sync-success",
          },
        );
        setShowSyncCompleteDialog(true);
        setIsSyncing(false);
      }
    }

    if (!isSyncing && isActivelySyncing) {
      toast.dismiss("sync-started");
      toast.info("Sincronização iniciada! Aguarde a conclusão...", {
        position: "top-right",
        autoClose: 3000,
        toastId: "sync-started",
      });
      setIsSyncing(true);
    }
  }, [isSyncing, process?.processStatus]);

  useEffect(() => {
    if (!isSyncing) {
      return;
    }

    if (!shouldContinueMonitoring(process?.processStatus)) {
      setIsSyncing(false);
    }
  }, [isSyncing, process?.processStatus]);

  return {
    currentStatusInfo,
    handleAcceptUpdate,
    handleRejectUpdate,
    isSyncing,
    setShowSyncCompleteDialog,
    setShowUpdateConfirmation,
    showSyncCompleteDialog,
    showUpdateConfirmation,
  };
}
