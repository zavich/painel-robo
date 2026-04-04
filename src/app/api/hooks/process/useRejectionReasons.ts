import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import api from "../..";

export interface RejectionReason {
  key: string;
  label: string;
}

export const useRejectionReasons = (
  config?: UseQueryOptions<RejectionReason[], Error, RejectionReason[], unknown[]>
) => {
  const queryResponse = useQuery<RejectionReason[], Error, RejectionReason[], unknown[]>({
    queryKey: ["rejection-reasons"],
    queryFn: () => getRejectionReasons(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    ...(config || {}),
  });

  return queryResponse;
};

export async function getRejectionReasons() {
  try {
    const { data } = await api.get<RejectionReason[]>('/reason-loss');
    // Garantir que sempre retorna um array e mapear para o formato esperado
    if (!Array.isArray(data)) return [];
    // Mapear de { _id, key, label } para { key, label }
    return data.map((item: any) => ({
      key: item.key,
      label: item.label,
    }));
  } catch (error) {
    console.error('Erro ao buscar motivos de recusa:', error);
    return [];
  }
}