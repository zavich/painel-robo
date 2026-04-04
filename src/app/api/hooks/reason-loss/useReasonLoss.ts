import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import api from "../..";

export interface ReasonLoss {
  _id: string;
  key: string;
  label: string;
}

export interface GetReasonLossResponseType {
  reasonLoss: ReasonLoss[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ReasonLossParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getReasonLoss = (params: ReasonLossParams) =>
  api
    .get<GetReasonLossResponseType>("/reason-loss", {
      params,
    })
    .then((res) => res.data);

export function useReasonLoss(
  params: ReasonLossParams = {},
  config?: UseQueryOptions<
    GetReasonLossResponseType,
    Error,
    GetReasonLossResponseType,
    unknown[]
  >
) {
  return useQuery<
    GetReasonLossResponseType,
    Error,
    GetReasonLossResponseType,
    unknown[]
  >({
    queryKey: ["reason-loss", params],
    queryFn: () => getReasonLoss(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    ...(config || {}),
  });
}

