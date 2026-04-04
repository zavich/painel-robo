import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

interface MarkAsReadResponse {
  success: boolean;
  message?: string;
}

export const markProcessAsRead = async (processId: string) => {
  const response = await api.patch<MarkAsReadResponse>(`/process/${processId}/mark-as-read`);
  return response.data;
};

export const useMarkProcessAsRead = (
  config?: UseMutationOptions<MarkAsReadResponse, Error, string>
) => {
  return useMutation<MarkAsReadResponse, Error, string>({
    mutationFn: markProcessAsRead,
    ...config,
  });
};