import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "@/app/api";

export interface AssignableUser {
  _id: string;
  id: string;
  email: string;
  role: string;
  totalProcesses?: number;
}

export interface AssignableUsersResponse {
  users?: AssignableUser[];
}

export const getAssignableUsers = async (): Promise<AssignableUsersResponse> => {
  const response = await api.get<AssignableUser[] | AssignableUsersResponse>("/users");
  const data = response.data;
  
  // Se a resposta é um array direto, envolver em um objeto com 'users'
  if (Array.isArray(data)) {
    return { users: data };
  }
  
  // Se já é um objeto com 'users', retornar como está
  return data as AssignableUsersResponse;
};

export function useAssignableUsers(
  config?: UseQueryOptions<
    AssignableUsersResponse,
    Error,
    AssignableUsersResponse,
    unknown[]
  >
) {
  return useQuery<
    AssignableUsersResponse,
    Error,
    AssignableUsersResponse,
    unknown[]
  >({
    queryKey: ["assignable-users"],
    queryFn: () => getAssignableUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    ...(config || {}),
  });
}
