import api from ".";

export const getListProcessesService = (params: Record<string, string | number | boolean | null | undefined>) =>
  api.get(`/process`, { params }).then((res) => res.data);
