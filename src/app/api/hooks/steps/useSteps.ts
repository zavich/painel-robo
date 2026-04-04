import { GetResponseType } from "@/app/interfaces/requests";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "../..";
import { Steps } from "@/app/interfaces/steps";

export interface GetStepsResponseType extends GetResponseType {
  steps: Steps[];
}

interface CompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const getSteps = (params: CompaniesParams) =>
  api
    .get<GetStepsResponseType>("/steps", {
      params,
    })
    .then((res) => res.data);

export function useSteps(
  params: CompaniesParams,
  config?: UseQueryOptions<
    GetStepsResponseType,
    Error,
    GetStepsResponseType,
    unknown[]
  >
) {
  return useQuery<GetStepsResponseType, Error, GetStepsResponseType, unknown[]>(
    {
      queryKey: ["steps", params],
      queryFn: () => getSteps(params),
      refetchOnWindowFocus: false,
      ...(config || {}),
      initialData: {
        steps: [],
        limit: 0,
        page: 0,
        totalCount: 0,
      },
    }
  );
}
