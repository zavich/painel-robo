import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "../..";

export interface ProcessMetricsByActivityType {
  total: number;
  pending: number;
  completed: number;
  approved: number;
  rejected: number;
}

export interface ProcessMetricsResponse {
  totalProcesses: number;
  processesByActivityType: {
    PRE_ANALISE?: ProcessMetricsByActivityType;
    ANALISE?: ProcessMetricsByActivityType;
    CALCULO?: ProcessMetricsByActivityType;
  };
}

export const getProcessMetrics = () =>
  api
    .get<ProcessMetricsResponse>("/process/metrics")
    .then((res) => res.data);

export function useProcessMetrics(
  config?: UseQueryOptions<
    ProcessMetricsResponse,
    Error,
    ProcessMetricsResponse,
    unknown[]
  >
) {
  return useQuery<
    ProcessMetricsResponse,
    Error,
    ProcessMetricsResponse,
    unknown[]
  >({
    queryKey: ["process-metrics"],
    queryFn: () => getProcessMetrics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
    ...(config || {}),
  });
}

