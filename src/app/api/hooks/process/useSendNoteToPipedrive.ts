import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../..";

interface SendNoteToPipedriveRequest {
  processId: string;
  data: Record<string, unknown>;
}

export const useSendNoteToPipedrive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ processId, data }: SendNoteToPipedriveRequest) => {
      const response = await api.post(`/process/${processId}/send-note-pipedrive`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // BUG-013: escopo específico para evitar re-fetch de todos os processos
      queryClient.invalidateQueries({ queryKey: ["process", variables.processId] });
    },
  });
};

