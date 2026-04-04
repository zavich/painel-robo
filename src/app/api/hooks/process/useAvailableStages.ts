import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import api from "../..";

export interface AvailableStage {
  key: string;
  label: string;
  order: number;
}

export const useAvailableStages = (
  config?: UseQueryOptions<AvailableStage[], Error, AvailableStage[], unknown[]>
) => {
  const queryResponse = useQuery<AvailableStage[], Error, AvailableStage[], unknown[]>({
    queryKey: ["available-stages"],
    queryFn: () => getAvailableStages(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    ...(config || {}),
  });

  return queryResponse;
};

export async function getAvailableStages() {
  try {
    const { data } = await api.get<AvailableStage[]>('/process/stages/available');
    // Garantir que sempre retorna um array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar stages disponíveis:', error);
    return [];
  }
}