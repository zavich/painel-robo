import { useState, useEffect, useRef } from "react";
import api from "../..";
import { DocumentExtract } from "@/app/interfaces/processes";

interface UseDocumentDetailsParams {
  processNumber: string;
  documentId: string;
  enabled: boolean;
  interval?: number;
}

export function useDocumentDetails({ 
  processNumber, 
  documentId, 
  enabled, 
  interval = 5000 
}: UseDocumentDetailsParams) {
  const [documento, setDocumento] = useState<DocumentExtract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDocumentDetails = async () => {
    if (!enabled || !processNumber || !documentId) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/process/${processNumber}/documents/${documentId}`);
      setDocumento(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Erro ao buscar detalhes do documento");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return;

    fetchDocumentDetails();
    
    // Só inicia o polling se interval > 0
    if (interval > 0) {
      intervalRef.current = setInterval(fetchDocumentDetails, interval);
    }
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enabled, processNumber, documentId, interval]);

  // Para quando o status muda de PROCESSING para outro, mas só se tiver dados ou for ERROR
  useEffect(() => {
    if (documento?.status !== "PROCESSING" && intervalRef.current) {
      // Se completou mas não tem dados ainda, continua polling
      if (documento?.status === "COMPLETED" && !documento?.data) {
        return; // Continua polling
      }
      // Para o polling se for ERROR ou se tiver dados quando COMPLETED
      stopPolling();
    }
  }, [documento?.status, documento?.data]);

  return { 
    document: documento, // Mudei de documento para document para consistência
    loading, 
    error, 
    refetch: fetchDocumentDetails,
    startPolling,
    stopPolling
  };
}