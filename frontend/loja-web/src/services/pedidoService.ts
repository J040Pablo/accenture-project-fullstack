import { api } from './api';

// TODO: endpoints reais de pedidos devem ser integrados por Vittor.
export const pedidoService = {
  listar: () => api.get('/pedidos'),
  buscarPorId: (id: string | number) => api.get(`/pedidos/${id}`),
};