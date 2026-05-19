import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

interface ReopenResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
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
      const promises: Promise<void>[] = [
        queryClient.invalidateQueries({ queryKey: ['processes'] }),
      ];
      if (processId) {
        promises.push(queryClient.invalidateQueries({ queryKey: ['process', processId] }));
      }
      await Promise.all(promises);
    },
    retry: false,
    ...(config || {}),
  });
}