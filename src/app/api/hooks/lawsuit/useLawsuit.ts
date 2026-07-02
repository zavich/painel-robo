import { Lawsuit } from "@/app/interfaces/lawsuit";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import api from "../..";

export const useLawsuit = (
  numeroCnj?: string,
  config?: UseQueryOptions<Lawsuit, Error, Lawsuit, QueryKey>,
) => {
  return useQuery<Lawsuit, Error, Lawsuit, QueryKey>({
    queryKey: ["lawsuit", numeroCnj],
    queryFn: () => getFindLawsuit(numeroCnj as string),
    enabled: Boolean(numeroCnj),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    ...(config || {}),
  });
};

export async function getFindLawsuit(numeroCnj: string) {
  const { data } = await api.get<Lawsuit>(`/lawsuits/${numeroCnj}`);
  return data;
}
