import { api } from './api';

export const contaService = {
  listar: () => api.get('/contas'),
  buscarPorId: (id: string | number) => api.get(`/contas/${id}`),
};