import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";

export function useDeleteReasonLoss() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/reason-loss/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reason-loss"] });
    },
  });

  return { deleteReasonLoss: mutation.mutateAsync, isLoading: mutation.isPending };
}

