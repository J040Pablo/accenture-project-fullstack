import { api } from './api';
import type { AnaliseRiscoPedidoResponseDTO } from '../types/AnaliseRisco';
import type { AxiosError } from 'axios';

interface ErroResponse {
  mensagem: string;
}

function extrairMensagemErro(error: unknown): string | null {
  const axiosError = error as AxiosError<ErroResponse>;
  return axiosError?.response?.data?.mensagem ?? null;
}

export const analiseRiscoService = {
  analisarPedido: async (pedidoId: string | number): Promise<AnaliseRiscoPedidoResponseDTO> => {
    try {
      const response = await api.post<AnaliseRiscoPedidoResponseDTO>(`/pedidos/${pedidoId}/analisar-risco`);
      return response.data;
    } catch (error) {
      const mensagem = extrairMensagemErro(error);

      if (mensagem?.includes('já foi analisado')) {
        const response = await api.get<AnaliseRiscoPedidoResponseDTO>(`/pedidos/${pedidoId}/analise-risco`);
        return response.data;
      }

      throw error instanceof Error ? error : new Error(mensagem ?? 'Erro ao analisar o pedido.');
    }
  },

  buscarPorPedido: async (pedidoId: string | number): Promise<AnaliseRiscoPedidoResponseDTO> => {
    const response = await api.get<AnaliseRiscoPedidoResponseDTO>(`/pedidos/${pedidoId}/analise-risco`);
    return response.data;
  },
};
