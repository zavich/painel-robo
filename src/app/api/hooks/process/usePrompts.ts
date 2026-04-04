import { useState, useEffect } from "react";
import api from "../..";

export interface PromptResponse {
  prompts: Prompt[];
}
export interface Prompt {
  _id: string;
  text: string;
  type: string;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<PromptResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get("/prompts")
      .then((res) => setPrompts(res.data))
      .catch((err) => setError(err.message || "Erro ao buscar prompts"))
      .finally(() => setLoading(false));
  }, []);

  return { prompts, loading, error };
}
