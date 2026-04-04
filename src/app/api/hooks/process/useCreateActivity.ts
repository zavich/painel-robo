import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";

export type ActivityType = "PRE_ANALISE" | "ANALISE" | "CALCULO";

export interface CreateActivityRequest {
  type: ActivityType;
  assignedTo: string; // ObjectId do usuário
}

export interface ActivityUser {
  _id: string;
  email: string;
  name?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  _id?: string;
  type: ActivityType;
  assignedTo: string | ActivityUser;
  assignedBy?: string | ActivityUser;
  isCompleted: boolean;
  completedAt: string | null;
  completedBy: string | null | ActivityUser;
  notes: string | null;
  status?: "APPROVE" | "LOSS";
  lossReason?: string;
  createdAt: string;
  updatedAt: string;
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
      // Invalidar queries relacionadas ao processo
      await queryClient.invalidateQueries({ queryKey: ['process'], type: 'all' });
      if (processId) {
        await queryClient.refetchQueries({ queryKey: ['process', processId], type: 'all' });
      }
    },
    retry: false,
  });
}

