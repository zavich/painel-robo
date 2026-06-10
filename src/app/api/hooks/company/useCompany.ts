import { Company } from "@/app/interfaces/processes";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import api from "../..";

export const useCompany = (
  cnpj: string,
  config?: UseQueryOptions<Company, Error, Company, QueryKey>
) => {
  const queryResponse = useQuery<Company, Error, Company, QueryKey>({
    queryKey: ["company", cnpj],
    queryFn: () => getFindCompany(cnpj),
    enabled: Boolean(cnpj),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    ...(config || {}),
  });

  return queryResponse;
};

export async function getFindCompany(cnpj: string) {
  const { data } = await api.get<Company>(`/company/${cnpj}`);

  return data;
}
