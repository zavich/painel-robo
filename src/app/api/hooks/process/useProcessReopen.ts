import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

interface ReopenResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export function useProcessReopen(
  processId?: string,
  config?: UseMutationOptions<ReopenResponse, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation<ReopenResponse, Error, void>({
    mutationFn: async () => {
      if (!processId) throw new Error("Process ID is required");
      const { data: response } = await api.post<ReopenResponse>(`/process/${processId}/reopen`);
      return response;
    },
    onSuccess: async () => {
      // Invalidar queries relacionadas ao processo
      await queryClient.invalidateQueries({ queryKey: ['process'], type: 'all' });
      if (processId) {
        await queryClient.refetchQueries({ queryKey: ['process', processId], type: 'all' });
      }
      await queryClient.invalidateQueries({ queryKey: ['processes'], type: 'all' });
    },
    retry: false,
    ...(config || {}),
  });
}