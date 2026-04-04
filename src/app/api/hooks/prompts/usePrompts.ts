import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Prompt } from "@/app/interfaces/processes";
import api from "../..";

export interface GetPromptsResponseType {
  prompts: Prompt[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PromptsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getPrompts = (params: PromptsParams) =>
  api
    .get<GetPromptsResponseType>("/prompts", {
      params,
    })
    .then((res) => res.data);

export function usePrompts(
  params: PromptsParams,
  config?: UseQueryOptions<
    GetPromptsResponseType,
    Error,
    GetPromptsResponseType,
    unknown[]
  >
) {
  return useQuery<
    GetPromptsResponseType,
    Error,
    GetPromptsResponseType,
    unknown[]
  >({
    queryKey: ["prompts", params],
    queryFn: () => getPrompts(params),
    refetchOnWindowFocus: false,
    ...(config || {}),
    initialData: {
      prompts: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  });
}
