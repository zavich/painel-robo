import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import api from "../..";

interface ChangeStageRequest {
  processId: string;
  newStageId: number;
  reason: string;
}

interface ChangeStageResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

export const useChangeStage = (
  config?: UseMutationOptions<ChangeStageResponse, Error, ChangeStageRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<ChangeStageResponse, Error, ChangeStageRequest>({
    mutationFn: (data: ChangeStageRequest) => postChangeStage(data),
    onSuccess: async (_data, variables) => {
      // Invalidar apenas o processo específico e a lista (BUG-013)
      const promises: Promise<void>[] = [
        queryClient.invalidateQueries({ queryKey: ['processes'] }),
      ];
      if (variables.processId) {
        promises.push(
          queryClient.invalidateQueries({ queryKey: ['process', variables.processId] }),
        );
      }
      await Promise.all(promises);
    },
    retry: false,
    ...(config || {}),
  });
};

export async function postChangeStage(data: ChangeStageRequest) {
  const { data: response } = await api.post<ChangeStageResponse>('/process/change-stage', {
    processId: data.processId,
    newStageId: data.newStageId,
    reason: data.reason,
  });
  return response;
}