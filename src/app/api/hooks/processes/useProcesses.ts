import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "../..";
import { Process } from "@/app/interfaces/processes";

export interface StageProcesses {
  data: Process[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

// Legacy interface for backwards compatibility
export interface GetProcessesByStageResponseType {
  PRE_ANALISE?: StageProcesses;
  ANALISE?: StageProcesses;
  CALCULO?: StageProcesses;
}

// New API response format
export interface GetProcessesResponseType {
  processes: Process[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProcessesParams {
  page?: number;
  limit?: number;
  step?: string;
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  lossReason?: string;
  emptyDocuments?: boolean;
  emptyInstances?: boolean;
  hasNewMovementsNow?: boolean;
}

export const getProcesses = (params: ProcessesParams) =>
  api
    .get<GetProcessesResponseType>("/process", {
      params,
    })
    .then((res) => res.data);

export function useProcesses(
  params: ProcessesParams,
  config?: UseQueryOptions<
    GetProcessesResponseType,
    Error,
    GetProcessesResponseType,
    unknown[]
  >
) {
  return useQuery<
    GetProcessesResponseType,
    Error,
    GetProcessesResponseType,
    unknown[]
  >({
    queryKey: ["processes", JSON.stringify(params)],
    queryFn: () => getProcesses(params),
    refetchOnWindowFocus: false,
    ...(config || {}),
  });
}
