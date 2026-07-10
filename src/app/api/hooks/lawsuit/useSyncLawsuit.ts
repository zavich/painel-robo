import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

type SyncLawsuitRes = {
  message: string;
};

export async function syncLawsuit(numeroCnj: string) {
  const { data } = await api.post(`/lawsuits/${numeroCnj}/sync`);
  return data;
}

export const useSyncLawsuit = (
  config?: UseMutationOptions<
    SyncLawsuitRes, // tipo de retorno (data)
    Error, // tipo do erro
    string // número CNJ do processo
  >,
) => {
  return useMutation({
    mutationFn: syncLawsuit,
    ...(config || {}),
  });
};
