export interface FilterContextType {
  page: number;
  setPage: (value: number) => void;
  limit: number;
  setLimit: (value: number) => void;
  total: number;
  setTotal: (value: number) => void;
  search: string;
  setSearch: (value: string) => void;
  step: string;
  setStep: (value: string) => void;
}
