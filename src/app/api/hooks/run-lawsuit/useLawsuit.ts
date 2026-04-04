import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

type RunLawsuitRes = {
  id: string;
};

type RunLawsuit = {
  number: string;
  step: string;
};

export async function runlawsuit(newRunLawsuitRes: RunLawsuit) {
  const { data } = await api.post(
    "/process/run-lawsuit-validation",
    newRunLawsuitRes
  );
  return data;
}

export const useLawsuit = (
  config?: UseMutationOptions<
    RunLawsuitRes, // tipo de retorno (data)
    Error, // tipo do erro
    RunLawsuit // tipo do parâmetro que será passado
  >
) => {
  return useMutation({
    mutationFn: runlawsuit,
    ...(config || {}),
  });
};
