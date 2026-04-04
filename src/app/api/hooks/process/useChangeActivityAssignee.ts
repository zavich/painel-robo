import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";
import { ActivityType } from "./useCreateActivity";

export interface ChangeActivityAssigneeRequest {
  type: ActivityType;
  assignedTo: string; // Novo ObjectId do usuário
}

export interface ChangeActivityAssigneeResponse {
  message: string;
  processId: string;
  type: ActivityType;
  newAssignedTo: string;
}

export function useChangeActivityAssignee(processId?: string) {
  const queryClient = useQueryClient();

  return useMutation<ChangeActivityAssigneeResponse, Error, ChangeActivityAssigneeRequest>({
    mutationFn: async (data: ChangeActivityAssigneeRequest) => {
      if (!processId) throw new Error("Process ID is required");
      const { data: response } = await api.patch<ChangeActivityAssigneeResponse>(
        `/process/${processId}/activity/assigned`,
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

