import { useState } from "react";
import api from "../..";
import { logger } from "@/app/lib/logger";

interface ExtractMovementInsightsParams {
  texto: string;
  prompt: string;
}

export function useExtractMovementInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function extractMovementInsights(params: ExtractMovementInsightsParams) {
    setLoading(true);
    setError(null);
    logger.log(
      `[MovementInsights] Iniciando extração — texto com ${params.texto.length} caracteres, prompt=${params.prompt}`,
    );
    try {
      const { data } = await api.post("/process/run-movement-insights", params);
      logger.log("[MovementInsights] Extração concluída com sucesso", data);
      return data;
    } catch (err: unknown) {
      logger.error("[MovementInsights] Falha ao extrair insight", err as object);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { extractMovementInsights, loading, error };
}
