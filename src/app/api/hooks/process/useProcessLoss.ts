import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import api from "../..";
import type { PipedriveFormData } from '@/components/process/PipedriveForm.types';

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
  data?: Record<string, string | number | boolean | object | null | undefined>;
}

export const useProcessLoss = (
  processId?: string,
  config?: UseMutationOptions<LossResponse, Error, LossRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<LossResponse, Error, LossRequest>({
    mutationFn: (data: LossRequest) => postProcessLoss(data),
    onSuccess: async () => {
      // Invalidar apenas o processo específico e a lista (BUG-013)
      const promises: Promise<void>[] = [
        queryClient.invalidateQueries({ queryKey: ['processes'] }),
      ];
      if (processId) {
        promises.push(
          queryClient.invalidateQueries({ queryKey: ['process', processId] }),
        );
      }
      await Promise.all(promises);
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
