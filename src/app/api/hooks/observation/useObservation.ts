import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

type Observation = {
  id: string;
  description: string;
};

type CreateObservationDto = {
  description: string;
  processId: string;
};

export async function createObservation(
  newObservation: CreateObservationDto
): Promise<Observation> {
  const { data } = await api.post("/observations", newObservation);
  return data;
}

export const useCreateObservation = (
  config?: UseMutationOptions<
    Observation, // tipo de retorno (data)
    Error, // tipo do erro
    CreateObservationDto // tipo do parâmetro que será passado
  >
) => {
  return useMutation({
    mutationFn: createObservation,
    ...(config || {}),
  });
};
export async function deleteObservation(id: string): Promise<void> {
  await api.delete(`/observations/${id}`);
}

export const useDeleteObservation = (
  config?: UseMutationOptions<void, Error, string>
) => {
  return useMutation({
    mutationFn: deleteObservation,
    ...(config || {}),
  });
};
