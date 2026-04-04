import api from ".";

export const getListProcessesService = (params: unknown) =>
  api.get(`/process`, { params }).then((res) => res.data);
