import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import api from "../..";

interface MarkMovementsAsViewedRequest {
  processNumber: string;
  instance: 'PRIMEIRO_GRAU' | 'SEGUNDO_GRAU';
}

interface MarkMovementsAsViewedResponse {
  processNumber: string;
  updatedTypes: string[];
  message: string;
}

export const useMarkMovementsAsViewed = (
  config?: UseMutationOptions<MarkMovementsAsViewedResponse, Error, MarkMovementsAsViewedRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<MarkMovementsAsViewedResponse, Error, MarkMovementsAsViewedRequest>({
    mutationFn: (data: MarkMovementsAsViewedRequest) => markMovementsAsViewed(data),
    onSuccess: async (data, variables) => {
      // Invalidate and refetch the specific process
      await queryClient.invalidateQueries({
        queryKey: ['process', variables.processNumber],
        type: 'all'
      });
      // Invalidate all processes to update counters
      await queryClient.invalidateQueries({
        queryKey: ['processes'],
        type: 'all'
      });
    },
    retry: false,
    ...(config || {}),
  });
};

async function markMovementsAsViewed(data: MarkMovementsAsViewedRequest) {
  const { processNumber, instance } = data;
  const { data: response } = await api.post<MarkMovementsAsViewedResponse>(
    `/process/${processNumber}/movements/mark-viewed?instance=${instance}`
  );
  return response;
}

