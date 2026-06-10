import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

export type AddNoteDto = {
  content: string;
  dealId?: number;
};

async function addPipedriveNote(data: AddNoteDto): Promise<void> {
  await api.post("/pipedrive/add-note", data);
}

export function useAddPipedriveNote(
  options?: UseMutationOptions<void, Error, AddNoteDto>
) {
  return useMutation({ mutationFn: addPipedriveNote, ...(options || {}) });
}


