import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

type SearchLawsuitRes = {
  message: string;
};

export async function searchLawsuit(numeroCnj: string) {
  const { data } = await api.post(`/lawsuits/${numeroCnj}/search`);
  return data;
}

export const useSearchLawsuit = (
  config?: UseMutationOptions<
    SearchLawsuitRes, // tipo de retorno (data)
    Error, // tipo do erro
    string // número CNJ do processo
  >,
) => {
  return useMutation({
    mutationFn: searchLawsuit,
    ...(config || {}),
  });
};
