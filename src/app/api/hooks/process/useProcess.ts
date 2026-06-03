import { Process } from "@/app/interfaces/processes";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import api from "../..";

export const useProcess = (
  numero: string,
  config?: UseQueryOptions<Process, Error, Process, QueryKey>
) => {
  const queryResponse = useQuery<Process, Error, Process, QueryKey>({
    queryKey: ["process", numero],
    queryFn: () => getFindProcess(numero),
    enabled: Boolean(numero),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    ...(config || {}),
  });

  return queryResponse;
};

export async function getFindProcess(numero: string) {
  const { data } = await api.get<Process>(`/process/${numero}`);

  return data;
}
