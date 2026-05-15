import { api } from './api';

export const empresaService = {
  listar: () => api.get('/empresas'),
  buscarPorId: (id: string | number) => api.get(`/empresas/${id}`),
};