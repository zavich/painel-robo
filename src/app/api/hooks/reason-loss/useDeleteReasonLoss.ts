import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function useDeleteReasonLoss() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/reason-loss/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Erro ao deletar motivo de recusa" }));
        throw new Error(error.message || "Erro ao deletar motivo de recusa");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reason-loss"] });
    },
  });

  return { deleteReasonLoss: mutation.mutateAsync, isLoading: mutation.isPending };
}

