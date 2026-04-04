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
  data?: any;
}

export const useChangeStage = (
  config?: UseMutationOptions<ChangeStageResponse, Error, ChangeStageRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<ChangeStageResponse, Error, ChangeStageRequest>({
    mutationFn: (data: ChangeStageRequest) => postChangeStage(data),
    onSuccess: async (data, variables) => {
      // Invalidar todas as queries de processo
      await queryClient.invalidateQueries({
        queryKey: ['process'],
        type: 'all'
      });

      // Invalidar lista de processos
      await queryClient.invalidateQueries({
        queryKey: ['processes'],
        type: 'all'
      });

      // Forçar refetch específico se temos o processId
      if (variables.processId) {
        await queryClient.refetchQueries({
          queryKey: ['process', variables.processId],
          type: 'all'
        });
      }
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