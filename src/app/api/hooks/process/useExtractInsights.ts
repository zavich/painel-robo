import { useState } from "react";
import api from "../..";

interface ExtractInsightsParams {
  number: string;
  documents: string[];
  prompt: string;
}

export function useExtractInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function extractInsights(params: ExtractInsightsParams) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/process/run-documents-insights", params);
      return data;
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { extractInsights, loading, error };
}