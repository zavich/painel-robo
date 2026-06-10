import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";

export interface CreateReasonLossRequest {
  key: string;
  label: string;
}

export function useAddReasonLoss() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateReasonLossRequest) => {
      const { data: response } = await api.post('/reason-loss', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reason-loss"] });
    },
  });

  return { addReasonLoss: mutation.mutateAsync, isLoading: mutation.isPending };
}

