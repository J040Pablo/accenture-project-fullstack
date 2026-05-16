import { api } from './api';
import type { ViaCepResponse } from '../types/Endereco';

export const enderecoService = {
  buscarCep: async (cep: string): Promise<ViaCepResponse> => {
    const cleanCep = cep.replace(/\D/g, '');
    const res = await api.get<ViaCepResponse>(`/enderecos/cep/${cleanCep}`);
    return res.data;
  },
};
