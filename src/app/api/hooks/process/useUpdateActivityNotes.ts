import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";
import { ActivityType, Activity } from "./useCreateActivity";

export interface UpdateActivityNotesRequest {
  type: ActivityType;
  notes: string;
}

export interface UpdateActivityNotesResponse {
  message: string;
  processId: string;
  activity: Activity;
}

export function useUpdateActivityNotes(processId?: string) {
  const queryClient = useQueryClient();

  return useMutation<UpdateActivityNotesResponse, Error, UpdateActivityNotesRequest>({
    mutationFn: async (data: UpdateActivityNotesRequest) => {
      if (!processId) throw new Error("Process ID is required");
      const { data: response } = await api.patch<UpdateActivityNotesResponse>(
        `/process/${processId}/activity/notes`,
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

