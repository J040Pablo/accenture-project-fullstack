import { api } from './api';
import type { Cliente, ClienteRequest } from '../types/Cliente';

export const clienteService = {
  listar: async (): Promise<Cliente[]> => {
    const res = await api.get<Cliente[]>('/clientes');
    return res.data;
  },

  buscarPorId: async (id: number): Promise<Cliente> => {
    const res = await api.get<Cliente>(`/clientes/${id}`);
    return res.data;
  },

  cadastrar: async (dto: ClienteRequest): Promise<Cliente> => {
    const res = await api.post<Cliente>('/clientes', dto);
    return res.data;
  },

  atualizar: async (id: number, dto: ClienteRequest): Promise<Cliente> => {
    const res = await api.put<Cliente>(`/clientes/${id}`, dto);
    return res.data;
  },

  deletar: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};