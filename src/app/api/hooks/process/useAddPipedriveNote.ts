import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "../..";

export type AddNoteDto = {
  content: string;
  dealId?: number;
};

async function addPipedriveNote(data: AddNoteDto) {
  const res = await api.post("/pipedrive/add-note", data);
  return res.data;
}

export function useAddPipedriveNote(
  options?: UseMutationOptions<any, Error, AddNoteDto>
) {
  return useMutation({ mutationFn: addPipedriveNote, ...(options || {}) });
}


