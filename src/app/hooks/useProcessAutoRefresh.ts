import { useEffect, useRef, useCallback, useState } from 'react';
import { useProcess } from '@/app/api/hooks/process/useProcess';
import { hasError } from '@/app/utils/processSyncStatus';
import { Process, ProcessStatus } from '@/app/interfaces/processes';
import { logger } from '@/app/lib/logger';
import { getExistingSocket, whenSocketReady } from '@/lib/socket';

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
  intervalMs = 60000,
  errorIntervalMs = 15000,
  onDataUpdate,
  onStatusChange,
}: UseProcessAutoRefreshOptions) {
  const {
    data: process,
    isLoading,
    error,
    refetch,
  } = useProcess(processId);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const pollingStoppedRef = useRef(false);
  const [isRefetchingState, setIsRefetchingState] = useState(false);
  const lastProcessStatusRef = useRef<ProcessStatus | null>(null);
  const currentIntervalRef = useRef<number>(intervalMs);

  // Keep callback refs up-to-date without triggering startPolling recreation
  const onDataUpdateRef = useRef(onDataUpdate);
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => { onDataUpdateRef.current = onDataUpdate; }, [onDataUpdate]);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);

  const stopPolling = useCallback(() => {
    pollingStoppedRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    pollingStoppedRef.current = false;
    stopPolling();
    pollingStoppedRef.current = false;

    if (!(enabled && processId)) {
      return;
    }

    const scheduleNextPoll = (delayMs: number) => {
      if (!(enabled && processId) || pollingStoppedRef.current) {
        return;
      }

      timeoutRef.current = setTimeout(async () => {
        if (pollingStoppedRef.current) return;
        if (isRefetchingRef.current) {
          scheduleNextPoll(currentIntervalRef.current);
          return;
        }

        isRefetchingRef.current = true;
        if (isMountedRef.current) {
          setIsRefetchingState(true);
        }

        let nextInterval = currentIntervalRef.current;
        try {
          const result = await refetch();
          if (result.error) {
            const status = (result.error as { response?: { status?: number } })?.response?.status;
            if (status === 429 || (status && status >= 500)) {
              nextInterval = 30000;
            }
          } else if (result.data) {
            const currentStatus = result.data.processStatus;
            const lastStatus = lastProcessStatusRef.current;

            if (onStatusChangeRef.current && lastStatus && currentStatus) {
              const statusChanged =
                lastStatus.name !== currentStatus.name ||
                lastStatus.log !== currentStatus.log ||
                lastStatus.errorReason !== currentStatus.errorReason;

              if (statusChanged) {
                onStatusChangeRef.current(lastStatus, currentStatus);
              }
            }

            lastProcessStatusRef.current = currentStatus ?? null;
            currentIntervalRef.current = hasError(currentStatus)
              ? errorIntervalMs
              : intervalMs;
            nextInterval = currentIntervalRef.current;

            if (onDataUpdateRef.current) {
              onDataUpdateRef.current(result.data);
            }
          }
        } catch (error) {
          logger.error('Erro ao atualizar dados do processo:', error);
        } finally {
          isRefetchingRef.current = false;
          if (isMountedRef.current) {
            setIsRefetchingState(false);
          }
          if (!pollingStoppedRef.current) {
            scheduleNextPoll(nextInterval);
          }
        }
      }, delayMs);
    };

    scheduleNextPoll(currentIntervalRef.current);
  }, [enabled, processId, intervalMs, errorIntervalMs, refetch, stopPolling]);
  // NOTE: onDataUpdate and onStatusChange are intentionally NOT in deps — accessed via refs

  const forceRefresh = useCallback(async () => {
    if (!isRefetchingRef.current) {
      isRefetchingRef.current = true;
      setIsRefetchingState(true);
      try {
        const result = await refetch();
        if (result.data) {
          const currentStatus = result.data.processStatus;
          const lastStatus = lastProcessStatusRef.current;

          if (onStatusChangeRef.current && lastStatus && currentStatus) {
            const statusChanged =
              lastStatus.name !== currentStatus.name ||
              lastStatus.log !== currentStatus.log ||
              lastStatus.errorReason !== currentStatus.errorReason;

            if (statusChanged) {
              onStatusChangeRef.current(lastStatus, currentStatus);
            }
          }

          lastProcessStatusRef.current = currentStatus ?? null;

          if (onDataUpdateRef.current) {
            onDataUpdateRef.current(result.data);
          }
        }
        return result.data;
      } catch (error) {
        logger.error('Erro ao forçar atualização do processo:', error);
        throw error;
      } finally {
        isRefetchingRef.current = false;
        if (isMountedRef.current) setIsRefetchingState(false);
      }
    }
  }, [refetch]);

  const previousProcessIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (previousProcessIdRef.current !== processId) {
      previousProcessIdRef.current = processId;
      lastProcessStatusRef.current = process?.processStatus ?? null;
    } else if (!lastProcessStatusRef.current && process?.processStatus) {
      lastProcessStatusRef.current = process.processStatus;
    }
    currentIntervalRef.current = hasError(process?.processStatus)
      ? errorIntervalMs
      : intervalMs;
  }, [processId, process?.processStatus, intervalMs, errorIntervalMs]);

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

  // Socket push: refetch imediato quando o backend emite process:updated
  const forceRefreshRef = useRef(forceRefresh);
  useEffect(() => { forceRefreshRef.current = forceRefresh; }, [forceRefresh]);

  useEffect(() => {
    if (!enabled || !processId) return;

    // subscribedSocket rastreia em qual socket o listener foi registrado,
    // para que o cleanup possa removê-lo corretamente mesmo quando o socket
    // só ficou disponível depois do mount (navegação direta / auth ainda carregando).
    let subscribedSocket: ReturnType<typeof getExistingSocket> = null;

    const handleProcessUpdated = (data: { number: string }) => {
      if (data.number !== processId) return;
      void forceRefreshRef.current();
    };

    const subscribe = (s: NonNullable<ReturnType<typeof getExistingSocket>>) => {
      subscribedSocket = s;
      s.on('process:updated', handleProcessUpdated);
    };

    const existingSocket = getExistingSocket();
    if (existingSocket) {
      subscribe(existingSocket);
      return () => {
        subscribedSocket?.off('process:updated', handleProcessUpdated);
      };
    }

    // Socket ainda não criado (auth em andamento) — aguarda conexão
    const unregister = whenSocketReady(subscribe);
    return () => {
      unregister(); // cancela callback pendente se componente desmontar antes
      subscribedSocket?.off('process:updated', handleProcessUpdated);
    };
  }, [enabled, processId]);

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
