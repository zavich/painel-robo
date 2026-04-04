import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";
import { ReasonLoss } from "./useReasonLoss";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface CreateReasonLossRequest {
  key: string;
  label: string;
}

export function useAddReasonLoss() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateReasonLossRequest) => {
      const res = await fetch(`${API_URL}/reason-loss`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Erro ao criar motivo de recusa" }));
        throw new Error(error.message || "Erro ao criar motivo de recusa");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reason-loss"] });
    },
  });

  return { addReasonLoss: mutation.mutateAsync, isLoading: mutation.isPending };
}

