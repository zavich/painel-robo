import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../..";
import { logger } from '@/app/lib/logger';

export interface RemoveProvisionalLawsuitRequest {
  processId: string;
}

export const useRemoveProvisionalLawsuit = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ processId }: RemoveProvisionalLawsuitRequest) =>
      removeProvisionalLawsuit(processId),
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas ao processo
      queryClient.invalidateQueries({
        queryKey: ['process', variables.processId],
      });
      queryClient.invalidateQueries({
        queryKey: ['processes'],
      });
    },
    onError: (error) => {
      logger.error('Erro ao remover processo provisório:', error as object);
    },
  });

  return mutation;
};

async function removeProvisionalLawsuit(processId: string) {
  try {
    const { data } = await api.delete(
      `/process/${processId}/remove-provisional-lawsuit-number`
    );
    return data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    throw new Error(
      axiosError?.response?.data?.message ||
      'Erro ao remover processo provisório'
    );
  }
}
