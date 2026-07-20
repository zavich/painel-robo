import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

type InsertLawsuitRes = {
  message: string;
  alreadyExists: boolean;
};

export async function insertLawsuit(numeroCnj: string) {
  const { data } = await api.post(`/lawsuits/${numeroCnj}/insert`);
  return data;
}

export const useInsertLawsuit = (
  config?: UseMutationOptions<
    InsertLawsuitRes, // tipo de retorno (data)
    Error, // tipo do erro
    string // número CNJ do processo
  >,
) => {
  return useMutation({
    mutationFn: insertLawsuit,
    ...(config || {}),
  });
};
