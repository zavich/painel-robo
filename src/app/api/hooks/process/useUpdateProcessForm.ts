import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import api from "../..";

interface UpdateFormRequest {
  processNumber: string; // Número do processo, não o _id
  formData: any;
}

interface UpdateFormResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const useUpdateProcessForm = (
  processNumber?: string,
  config?: UseMutationOptions<UpdateFormResponse, Error, UpdateFormRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateFormResponse, Error, UpdateFormRequest>({
    mutationFn: (data: UpdateFormRequest) => updateProcessForm(data),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['process'],
        type: 'all'
      });
      if (processNumber) {
        await queryClient.refetchQueries({
          queryKey: ['process', processNumber],
          type: 'all'
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ['processes'],
        type: 'all'
      });
    },
    retry: false,
    ...(config || {}),
  });
};

export async function updateProcessForm(data: UpdateFormRequest) {
  const { processNumber, formData } = data;
  
  // Extrair title se existir (deve ir fora do formPipedrive)
  const { title, ...restFormData } = formData;
  
  const payload: any = {
    formPipedrive: restFormData
  };
  
  // Adicionar title fora do formPipedrive APENAS se não estiver vazio
  // Se title for vazio, não envia o campo para não afetar o title do Pipedrive
  if (title && title.trim()) {
    payload.title = title.trim();
  }
  
  const { data: response } = await api.patch<UpdateFormResponse>(
    `/process/${processNumber}/update`,
    payload
  );
  return response;
}

