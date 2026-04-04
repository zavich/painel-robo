import { useMutation } from "@tanstack/react-query";
import api from "../..";
import { Company, SpecialRule } from "@/app/interfaces/processes";

export type EditCompanyPayload = {
  registrationStatus: string;
  specialRule: SpecialRule | "";
  reason: string;
  score: number | null;
  porte: string | null;
};

export async function editCompany(id: string, payload: EditCompanyPayload) {
  const res = await api.put<Company>(`/company/${id}`, payload);
  return res.data;
}

export function useEditCompany() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditCompanyPayload }) =>
      editCompany(id, payload),
  });
}