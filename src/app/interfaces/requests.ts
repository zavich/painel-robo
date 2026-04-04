export type RequestStatusType = {
  initial: boolean;
  loading: boolean;
  success: boolean;
  error: boolean;
};
export enum ProcessStatusName {
  Sucesso = "Sucesso",
  Rejected = "Error",
  WatingForLawsuitMain = "WaitingForLawsuitMain",
}
export interface ListParamsType {
  name?: string;
  page?: number;
  limit?: number;
}

export interface GetResponseType {
  limit: number;
  page: number;
  totalCount: number;
}
