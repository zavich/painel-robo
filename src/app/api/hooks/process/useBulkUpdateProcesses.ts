import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import api from "@/app/api";

export interface BulkUpdateFilters {
  stage?: string;
  situation?: 'PENDING' | 'APPROVED' | 'LOSS';
  startDate?: string;
  endDate?: string;
  hasNewMovements?: boolean;
  search?: string;
  lossReason?: string | string[];
  emptyDocuments?: boolean;
  emptyInstances?: boolean;
}

export interface BulkUpdateData {
  owner?: string;
  stage?: string;
  stageId?: number;
  situation?: 'PENDING' | 'APPROVED' | 'LOSS';
  rejectionReason?: string;
  rejectionDescription?: string;
  isCustomReason?: boolean;
}

export interface BulkUpdateRequest {
  filters: BulkUpdateFilters;
  updates: BulkUpdateData;
}

export interface BulkUpdateResponse {
  message: string;
  updatedCount: number;
}

export const bulkUpdateProcesses = (data: BulkUpdateRequest) =>
  api
    .post<BulkUpdateResponse>("/v1/process/bulk-update", data)
    .then((res) => res.data);

export function useBulkUpdateProcesses(
  config?: UseMutationOptions<
    BulkUpdateResponse,
    Error,
    BulkUpdateRequest,
    unknown
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    BulkUpdateResponse,
    Error,
    BulkUpdateRequest,
    unknown
  >({
    mutationFn: bulkUpdateProcesses,
    onSuccess: () => {
      // Invalidate and refetch processes data
      queryClient.invalidateQueries({ queryKey: ["processes"] });
    },
    ...(config || {}),
  });
}

