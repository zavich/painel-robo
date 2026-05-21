import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../..";

export function useInsertExecution() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    void,
    Error,
    {
      processId: string;
      lawsuitExecution: string;
      pipedriveFieldValue?: string;
    }
  >({
    mutationFn: async ({
      processId,
      lawsuitExecution,
      pipedriveFieldValue,
    }) => {
      const payload: {
        lawsuitExecution: string;
        pipedriveFieldValue?: string;
      } = { lawsuitExecution };
      if (pipedriveFieldValue) {
        payload.pipedriveFieldValue = pipedriveFieldValue;
      }

      await api.post(`/process/${processId}/insert-execution`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["process", variables.processId],
        }),
        queryClient.invalidateQueries({ queryKey: ["processes"] }),
      ]);
    },
  });

  async function insertExecution(
    processId: string,
    lawsuitExecution: string,
    pipedriveFieldValue?: string,
  ) {
    return mutation.mutateAsync({
      processId,
      lawsuitExecution,
      pipedriveFieldValue,
    });
  }

  return {
    insertExecution,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
    success: mutation.isSuccess,
  };
}
