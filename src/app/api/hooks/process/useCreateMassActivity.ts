import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";
import { ActivityType } from "./useCreateActivity";

export interface CreateMassActivityRequest {
  type: ActivityType;
  assignedTo: string; // ObjectId do usuário
  processes: string[]; // Array de IDs dos processos
}

export interface CreateMassActivityResponse {
  message: string;
  createdCount: number;
  failedCount?: number;
  errors?: Array<{ processId: string; error: string }>;
}

export function useCreateMassActivity() {
  const queryClient = useQueryClient();

  return useMutation<CreateMassActivityResponse, Error, CreateMassActivityRequest>({
    mutationFn: async (data: CreateMassActivityRequest) => {
      const { data: response } = await api.post<CreateMassActivityResponse>(
        `/process/activity`,
        data
      );
      return response;
    },
    onSuccess: async () => {
      // Invalidar queries relacionadas aos processos
      await queryClient.invalidateQueries({ queryKey: ['process'], type: 'all' });
      await queryClient.invalidateQueries({ queryKey: ['processes'], type: 'all' });
    },
    retry: false,
  });
}
