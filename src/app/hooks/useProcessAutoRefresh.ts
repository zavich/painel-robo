import { useEffect, useRef, useCallback, useState } from 'react';
import { useProcess } from '@/app/api/hooks/process/useProcess';
import { hasError } from '@/app/utils/processSyncStatus';
import { Process, ProcessStatus } from '@/app/interfaces/processes';

interface UseProcessAutoRefreshOptions {
  processId: string;
  enabled?: boolean;
  intervalMs?: number;
  errorIntervalMs?: number;
  onDataUpdate?: (data: Process) => void;
  onStatusChange?: (oldStatus: ProcessStatus, newStatus: ProcessStatus) => void;
}

export function useProcessAutoRefresh({
  processId,
  enabled = true,
  intervalMs = 10000,
  errorIntervalMs = 2000,
  onDataUpdate,
  onStatusChange,
}: UseProcessAutoRefreshOptions) {
  const {
    data: process,
    isLoading,
    error,
    refetch,
  } = useProcess(processId);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isRefetchingState, setIsRefetchingState] = useState(false);
  const lastProcessStatusRef = useRef<ProcessStatus | null>(null);
  const currentIntervalRef = useRef<number>(intervalMs);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (enabled && processId) {
      const poll = async () => {
        if (!isRefetchingRef.current) {
          isRefetchingRef.current = true;
          setIsRefetchingState(true);
          try {
            const result = await refetch();
            if (result.data) {
              const currentStatus = result.data.processStatus;
              const lastStatus = lastProcessStatusRef.current;
              
              if (onStatusChange && lastStatus && currentStatus) {
                const statusChanged = 
                  lastStatus.name !== currentStatus.name ||
                  lastStatus.log !== currentStatus.log ||
                  lastStatus.errorReason !== currentStatus.errorReason;
                
                if (statusChanged) {
                  onStatusChange(lastStatus, currentStatus);
                }
              }
              
              lastProcessStatusRef.current = currentStatus ?? null;
              
              const newInterval = hasError(currentStatus)
                ? errorIntervalMs 
                : intervalMs;
              
              if (newInterval !== currentIntervalRef.current) {
                currentIntervalRef.current = newInterval;
                startPolling();
              }
              
              if (onDataUpdate) {
                onDataUpdate(result.data);
              }
            }
          } catch (error) {
            console.error('Erro ao atualizar dados do processo:', error);
          } finally {
            isRefetchingRef.current = false;
            if (isMountedRef.current) setIsRefetchingState(false);
          }
        }
      };

      intervalRef.current = setInterval(poll, currentIntervalRef.current);
    }
  }, [enabled, processId, intervalMs, errorIntervalMs, refetch, onDataUpdate, onStatusChange]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    if (!isRefetchingRef.current) {
      isRefetchingRef.current = true;
      setIsRefetchingState(true);
      try {
        const result = await refetch();
        if (result.data) {
          const currentStatus = result.data.processStatus;
          const lastStatus = lastProcessStatusRef.current;

          if (onStatusChange && lastStatus && currentStatus) {
            const statusChanged =
              lastStatus.name !== currentStatus.name ||
              lastStatus.log !== currentStatus.log ||
              lastStatus.errorReason !== currentStatus.errorReason;

            if (statusChanged) {
              onStatusChange(lastStatus, currentStatus);
            }
          }

          lastProcessStatusRef.current = currentStatus ?? null;

          if (onDataUpdate) {
            onDataUpdate(result.data);
          }
        }
        return result.data;
      } catch (error) {
        console.error('Erro ao forçar atualização do processo:', error);
        throw error;
      } finally {
        isRefetchingRef.current = false;
        if (isMountedRef.current) setIsRefetchingState(false);
      }
    }
  }, [refetch, onDataUpdate, onStatusChange]);

  useEffect(() => {
    if (process?.processStatus && !lastProcessStatusRef.current) {
      lastProcessStatusRef.current = process.processStatus;
      
      const initialInterval = hasError(process.processStatus)
        ? errorIntervalMs 
        : intervalMs;
      currentIntervalRef.current = initialInterval;
    }
  }, [process?.processStatus, intervalMs, errorIntervalMs]);

  useEffect(() => {
    isMountedRef.current = true;
    if (enabled && processId) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [enabled, processId, startPolling, stopPolling]);

  return {
    process,
    isLoading,
    error,
    refetch: forceRefresh,
    isRefetching: isRefetchingState,
    startPolling,
    stopPolling,
  };
}
