import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import api from "@/app/api";

export interface AssignOwnerRequest {
  userId: string;
}

export interface ProcessOwnerResponse {
  _id: string;
  processId: {
    _id: string;
    number: string;
  };
  userId: {
    _id: string;
    email: string;
    role: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignOwnerResponse {
  message: string;
  processOwner: ProcessOwnerResponse;
}

interface AssignProcessOwnerParams {
  processId: string;
  userId: string;
}

export const assignProcessOwner = ({ processId, userId }: AssignProcessOwnerParams) =>
  api
    .post<AssignOwnerResponse>(`/process/${processId}/assign-owner`, { userId })
    .then((res) => res.data);

export function useAssignProcessOwner(
  config?: UseMutationOptions<
    AssignOwnerResponse,
    Error,
    AssignProcessOwnerParams,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    AssignOwnerResponse,
    Error,
    AssignProcessOwnerParams,
    unknown
  >({
    mutationFn: assignProcessOwner,
    onSuccess: () => {
      // Invalidate and refetch processes data
      queryClient.invalidateQueries({ queryKey: ["processes"] });
    },
    ...(config || {}),
  });
}