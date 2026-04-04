import { useState } from "react";
import api from "../..";

interface RemoveInsightsParams {
  processNumber: string;
  documentId: string;
}

export function useRemoveInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function removeInsights({ processNumber, documentId }: RemoveInsightsParams) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.delete(`/process/${processNumber}/documents/${documentId}`);
      return data;
    } catch (err: any) {
      setError(err.message || "Erro ao remover insights");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { removeInsights, loading, error };
}