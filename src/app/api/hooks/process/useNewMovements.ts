import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../..";

export interface NewMovement {
  id: number;
  data: string;
  conteudo: string;
  instancia?: string;
}

export interface SavedMovementInfo {
  lastMovementDate: Date;
  totalMovements: number;
  readByUsersCount: number;
}

export interface SavedMovementsInfo {
  PROCESS: {
    PRIMEIRO_GRAU: SavedMovementInfo | null;
    SEGUNDO_GRAU: SavedMovementInfo | null;
  };
  TST: SavedMovementInfo | null;
}

export interface NewMovementsResponse {
  processNumber: string;
  hasNewProcessMovements: boolean;
  hasNewTSTMovements: boolean;
  newProcessMovements: {
    PRIMEIRO_GRAU: NewMovement[];
    SEGUNDO_GRAU: NewMovement[];
  };
  newTSTMovements: NewMovement[]; // Movimentações do TST
  totalNewMovements: number;
  savedMovementsInfo: SavedMovementsInfo; // ✨ NOVO!
}

/**
 * Exemplo de resposta esperada do backend:
 * {
 *   "processNumber": "1234567-89.2023.5.02.0001",
 *   "hasNewProcessMovements": true,
 *   "hasNewTSTMovements": false,
 *   "newProcessMovements": {
 *     "PRIMEIRO_GRAU": [
 *       {
 *         "id": 1,
 *         "data": "15/08/2023",
 *         "conteudo": "Processo distribuído",
 *         "instancia": "PRIMEIRO_GRAU"
 *       }
 *     ],
 *     "SEGUNDO_GRAU": []
 *   },
 *   "newTSTMovements": [],
 *   "totalNewMovements": 1
 * }
 */

export const useNewMovements = (processNumber: string) => {
  const queryClient = useQueryClient();

  const query = useQuery<NewMovementsResponse>({
    queryKey: ["newMovements", processNumber],
    queryFn: () => getNewMovements(processNumber),
    enabled: Boolean(processNumber),
    staleTime: 0, // Sempre buscar dados frescos
    refetchOnWindowFocus: false,
  });

  const markAsViewedMutation = useMutation({
    mutationFn: ({ 
      type = 'PROCESS', 
      instance 
    }: { 
      type?: 'PROCESS' | 'TST'; 
      instance?: 'PRIMEIRO_GRAU' | 'SEGUNDO_GRAU' 
    }) => markMovementsAsViewed(processNumber, [], type, instance),
    onSuccess: () => {
      // Invalidar apenas as queries necessárias
      queryClient.invalidateQueries({ queryKey: ["newMovements", processNumber] });
      queryClient.invalidateQueries({ queryKey: ["process", processNumber] });
    },
  });

  return {
    ...query,
    markAsViewed: markAsViewedMutation.mutate,
    isMarkingAsViewed: markAsViewedMutation.isPending,
  };
};

export async function getNewMovements(processNumber: string): Promise<NewMovementsResponse> {
  const { data } = await api.get<NewMovementsResponse>(`/process/${processNumber}/movements/new`);
  return data;
}

export async function markMovementsAsViewed(
  processNumber: string, 
  movementIds: number[], 
  type: 'PROCESS' | 'TST' = 'PROCESS',
  instance?: 'PRIMEIRO_GRAU' | 'SEGUNDO_GRAU'
): Promise<void> {
  const params = new URLSearchParams();
  params.append('type', type);
  
  if (type === 'PROCESS' && instance) {
    params.append('instance', instance);
  }
  
  await api.post(`/process/${processNumber}/movements/mark-viewed?${params.toString()}`);
}
