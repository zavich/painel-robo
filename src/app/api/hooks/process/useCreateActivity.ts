import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";
import type { Activity, ActivityType, ActivityUser } from "@/app/interfaces/processes";

export type { Activity, ActivityType, ActivityUser };

export interface CreateActivityRequest {
  type: ActivityType;
  assignedTo: string; // ObjectId do usuário
}

export interface CreateActivityResponse {
  message: string;
  processId: string;
  activity: Activity;
}

export function useCreateActivity(processId?: string) {
  const queryClient = useQueryClient();

  return useMutation<CreateActivityResponse, Error, CreateActivityRequest>({
    mutationFn: async (data: CreateActivityRequest) => {
      if (!processId) throw new Error("Process ID is required");
      const { data: response } = await api.post<CreateActivityResponse>(
        `/process/${processId}/activity`,
        data
      );
      return response;
    },
    onSuccess: async () => {
      if (processId) {
        await queryClient.invalidateQueries({ queryKey: ['process', processId] });
      }
    },
    retry: false,
  });
}

