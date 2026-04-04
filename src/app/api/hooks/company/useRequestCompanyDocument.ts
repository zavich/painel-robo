import { useMutation } from "@tanstack/react-query";
import api from "../..";

export type RequestCompanyDocumentPayload = {
  cnpj: string;
  type: string; // exemplo: "cndt"
};

export async function requestCompanyDocument(payload: RequestCompanyDocumentPayload) {
  const res = await api.post("/company/document", null, {
    params: {
      cnpj: payload.cnpj,
      type: payload.type,
    },
  });
  return res.data;
}

export function useRequestCompanyDocument() {
  return useMutation({
    mutationFn: (payload: RequestCompanyDocumentPayload) => requestCompanyDocument(payload),
  });
}