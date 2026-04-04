import { ProcessStatusEnum } from "@/app/interfaces/processes";
import { ProcessStatus } from "@/app/interfaces/processes";

/**
 * Verifica se o processo está sendo sincronizado
 */
export function isProcessing(status: ProcessStatus | undefined): boolean {
  if (!status) return false;
  
  const processingStatuses = [
    ProcessStatusEnum.PROCESSING,
    ProcessStatusEnum.PROCESSING_WITH_MOVIMENTS,
    ProcessStatusEnum.PROCESSING_WITH_DOCUMENTS,
    ProcessStatusEnum.PROCESS_WAITING_EXTRACTION_DOCUMENTS,
  ];
  
  return processingStatuses.includes(status.name as ProcessStatusEnum);
}

/**
 * Verifica se há erro na sincronização
 */
export function hasError(status: ProcessStatus | undefined): boolean {
  if (!status) return false;
  return status.name === ProcessStatusEnum.ERROR;
}

/**
 * Verifica se é um status intermediário (movimentações finalizadas, mas ainda processando documentos)
 */
export function isIntermediateStatus(status: ProcessStatus | undefined): boolean {
  if (!status) return false;
  
  const intermediateStatuses = [
    ProcessStatusEnum.EXTRACTION_MOVIMENTS_FINISHED,
  ];
  
  return intermediateStatuses.includes(status.name as ProcessStatusEnum);
}

/**
 * Verifica se a sincronização está completamente finalizada
 */
export function isSyncCompleted(status: ProcessStatus | undefined): boolean {
  if (!status) return false;
  
  const completedStatuses = [
    ProcessStatusEnum.SUCCESS,
    ProcessStatusEnum.PROCESSED,
    ProcessStatusEnum.EXTRACTION_FINISHED,
    ProcessStatusEnum.EXTRACTION_DOCUMENTS_FINISHED,
  ];
  
  return completedStatuses.includes(status.name as ProcessStatusEnum);
}

/**
 * Verifica se deve continuar monitorando o processo
 */
export function shouldContinueMonitoring(status: ProcessStatus | undefined): boolean {
  if (!status) return false;
  return isProcessing(status) || isIntermediateStatus(status);
}

/**
 * Obtém a descrição amigável do status
 */
export function getSyncStatusDescription(status: ProcessStatus | undefined): string {
  if (!status) return "Desconhecido";
  
  switch (status.name) {
    case ProcessStatusEnum.PROCESSING:
      return "Sincronização em andamento...";
    case ProcessStatusEnum.PROCESSING_WITH_MOVIMENTS:
      return "Processando movimentações...";
    case ProcessStatusEnum.PROCESSING_WITH_DOCUMENTS:
      return "Processando documentos...";
    case ProcessStatusEnum.PROCESS_WAITING_EXTRACTION_DOCUMENTS:
      return "Aguardando extração de documentos...";
    case ProcessStatusEnum.EXTRACTION_MOVIMENTS_FINISHED:
      return "Movimentações sincronizadas! Aguarde, processando documentos...";
    case ProcessStatusEnum.EXTRACTION_FINISHED:
      return "Documentos e movimentações sincronizados";
    case ProcessStatusEnum.EXTRACTION_DOCUMENTS_FINISHED:
      return "Sincronização completa!";
    case ProcessStatusEnum.SUCCESS:
      return "Sincronização concluída";
    case ProcessStatusEnum.PROCESSED:
      return "Processado com sucesso";
    case ProcessStatusEnum.ERROR:
      return `Erro: ${status.errorReason || "Erro desconhecido"}`;
    default:
      return status.name.toString();
  }
}

/**
 * Obtém o tipo de sincronização baseado no status
 */
export function getSyncType(status: ProcessStatus | undefined): string {
  if (!status) return "Desconhecido";
  
  if (status.name === ProcessStatusEnum.EXTRACTION_MOVIMENTS_FINISHED) {
    return "Apenas Movimentações";
  }
  
  if (status.name === ProcessStatusEnum.EXTRACTION_FINISHED) {
    return "Documentos + Movimentações";
  }
  
  return "Sincronização Completa";
}

/**
 * Obtém a cor do status para exibição
 */
export function getStatusColor(status: ProcessStatus | undefined): {
  bg: string;
  text: string;
  dot: string;
} {
  if (!status) {
    return {
      bg: "bg-gray-50 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      dot: "bg-gray-500",
    };
  }
  
  if (hasError(status)) {
    return {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
    };
  }
  
  if (isProcessing(status)) {
    return {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500 animate-pulse",
    };
  }
  
  if (isSyncCompleted(status)) {
    return {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      dot: "bg-green-500",
    };
  }
  
  return {
    bg: "bg-gray-50 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-500",
  };
}

/**
 * Verifica se pode sincronizar novamente baseado no status
 */
export function canSync(status: ProcessStatus | undefined, synchronizedAt?: string): boolean {
  // Se há erro, pode sincronizar
  if (hasError(status)) return true;
  
  // Se nunca foi sincronizado, pode sincronizar
  if (!synchronizedAt) return true;
  
  // Verifica se passaram 30 minutos desde a última sincronização
  const lastSync = new Date(synchronizedAt);
  const now = new Date();
  const diffInMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);
  
  return diffInMinutes >= 30;
}

