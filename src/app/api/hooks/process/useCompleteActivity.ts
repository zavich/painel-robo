import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";
import { ActivityType, Activity } from "./useCreateActivity";

export interface CompleteActivityRequest {
  type: ActivityType;
  notes?: string; // opcional, máximo 500 caracteres
  status: "APPROVE" | "LOSS";
  lossReason?: string; // obrigatório quando status é LOSS
}

export interface CompleteActivityResponse {
  message: string;
  processId: string;
  activity: Activity;
}

export function useCompleteActivity(processId?: string) {
  const queryClient = useQueryClient();

  return useMutation<CompleteActivityResponse, Error, CompleteActivityRequest>({
    mutationFn: async (data: CompleteActivityRequest) => {
      if (!processId) throw new Error("Process ID is required");
      const { data: response } = await api.patch<CompleteActivityResponse>(
        `/process/${processId}/activity/completed`,
        data
      );
      return response;
    },
    onSuccess: async () => {
      // Invalidar queries relacionadas ao processo
      await queryClient.invalidateQueries({ queryKey: ['process'], type: 'all' });
      if (processId) {
        await queryClient.refetchQueries({ queryKey: ['process', processId], type: 'all' });
      }
    },
    retry: false,
  });
}

