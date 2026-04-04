import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import api from "../..";
import { PipedriveFormData } from '@/components/process/PipedriveFormCard';

interface LossRequest {
  processId: string;
  reason?: string;
  isCustomReason?: boolean;
  rejectionDescription?: string;
  formPipedrive?: PipedriveFormData;
  activityType?: string;
  activityDone?: boolean;
  activitySubject?: string;
}

interface LossResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const useProcessLoss = (
  processId?: string,
  config?: UseMutationOptions<LossResponse, Error, LossRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<LossResponse, Error, LossRequest>({
    mutationFn: (data: LossRequest) => postProcessLoss(data),
    onSuccess: async (data, variables) => {
      // Invalidar todas as queries de processo
      await queryClient.invalidateQueries({
        queryKey: ['process'],
        type: 'all'
      });

      // Forçar refetch específico se temos o processId
      if (processId) {
        await queryClient.refetchQueries({
          queryKey: ['process', processId],
          type: 'all'
        });
      }

      // Invalidar lista de processos
      await queryClient.invalidateQueries({
        queryKey: ['processes'],
        type: 'all'
      });
    },
    retry: false,
    ...(config || {}),
  });
};

export async function postProcessLoss(data: LossRequest) {
  const { data: response } = await api.post<LossResponse>(`/process/${data.processId}/loss`, {
    reason: data.reason,
    isCustomReason: data.isCustomReason,
    rejectionDescription: data.rejectionDescription,
    formPipedrive: data.formPipedrive,
    activityType: data.activityType,
    activityDone: data.activityDone,
    activitySubject: data.activitySubject,
  });
  return response;
}