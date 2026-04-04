import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

type RunLawsuitRes = {
  message: string;
};

type RunLawsuit = {
  lawsuits: string[];
  movements?: boolean;
  documents?: boolean;
};

export async function runLawsuits(newRunLawsuitRes: RunLawsuit) {
  const { data } = await api.post(
    "/process/run-lawsuits",
    newRunLawsuitRes
  );
  return data;
}

export const useRunLawsuits = (
  config?: UseMutationOptions<
    RunLawsuitRes, // tipo de retorno (data)
    Error, // tipo do erro
    RunLawsuit // tipo do parâmetro que será passado
  >
) => {
  return useMutation({
    mutationFn: runLawsuits,
    ...(config || {}),
  });
};
