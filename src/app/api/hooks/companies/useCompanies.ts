import { GetResponseType } from "@/app/interfaces/requests";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "../..";
import { Company } from "@/app/interfaces/processes";

export interface GetCompaniesResponseType extends GetResponseType {
  companies: Company[];
  limit: number;
  page: number;
  totalCount: number;
  totalPages: number;
}

interface CompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const getCompanies = (params: CompaniesParams) =>
  api
    .get<GetCompaniesResponseType>("/company", {
      params,
    })
    .then((res) => res.data);

export function useCompanies(
  params: CompaniesParams,
  config?: UseQueryOptions<
    GetCompaniesResponseType,
    Error,
    GetCompaniesResponseType,
    unknown[]
  >
) {
  return useQuery<
    GetCompaniesResponseType,
    Error,
    GetCompaniesResponseType,
    unknown[]
  >({
    queryKey: ["companies", params],
    queryFn: () => getCompanies(params),
    refetchOnWindowFocus: false,
    ...(config || {}),
    initialData: {
      companies: [],
      limit: 10,
      page: 1,
      totalPages: 1,
      totalCount: 0,
    },
  });
}
