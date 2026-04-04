import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReasonLoss } from "./useReasonLoss";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface UpdateReasonLossRequest {
  key: string;
  label: string;
}

export function useEditReasonLoss() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReasonLossRequest }) => {
      const res = await fetch(`${API_URL}/reason-loss/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Erro ao atualizar motivo de recusa" }));
        throw new Error(error.message || "Erro ao atualizar motivo de recusa");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reason-loss"] });
    },
  });

  return { editReasonLoss: mutation.mutateAsync, isLoading: mutation.isPending };
}

