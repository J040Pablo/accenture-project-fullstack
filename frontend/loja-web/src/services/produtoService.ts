import { api } from './api';

// TODO: endpoints reais de produtos devem ser integrados por Izar.
export const produtoService = {
  listar: () => api.get('/produtos'),
  buscarPorId: (id: string | number) => api.get(`/produtos/${id}`),
};