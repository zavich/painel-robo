import { useQuery } from "@tanstack/react-query";
import api from "../..";
import { Company } from "@/app/interfaces/processes";

export async function getCompanyByCnpj(cnpj: string) {
  const res = await api.get<Company>(`/company/${cnpj}`);
  return res.data;
}

export function useCompanyByCnpj(cnpj: string) {
  return useQuery<Company, Error>({
    queryKey: ["company", cnpj],
    queryFn: () => getCompanyByCnpj(cnpj),
    enabled: !!cnpj,
    refetchOnWindowFocus: false,
  });
}