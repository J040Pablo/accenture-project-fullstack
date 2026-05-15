import { api } from './api';

// TODO: endpoints reais de clientes devem ser integrados por Jader.
export const clienteService = {
  listar: () => api.get('/clientes'),
  buscarPorId: (id: string | number) => api.get(`/clientes/${id}`),
};