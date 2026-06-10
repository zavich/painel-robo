import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";

export interface UpdateReasonLossRequest {
  key: string;
  label: string;
}

export function useEditReasonLoss() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReasonLossRequest }) => {
      const { data: response } = await api.patch(`/reason-loss/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reason-loss"] });
    },
  });

  return { editReasonLoss: mutation.mutateAsync, isLoading: mutation.isPending };
}

