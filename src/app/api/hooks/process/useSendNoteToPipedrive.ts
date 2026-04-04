import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../..";

interface SendNoteToPipedriveRequest {
  processId: string;
  data: any;
}

export const useSendNoteToPipedrive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ processId, data }: SendNoteToPipedriveRequest) => {
      const response = await api.post(`/process/${processId}/send-note-pipedrive`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["process"] });
      queryClient.invalidateQueries({ queryKey: ["processes"] });
    },
  });
};

