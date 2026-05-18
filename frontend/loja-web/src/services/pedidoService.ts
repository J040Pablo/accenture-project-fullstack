import { api } from './api';
import type { Pedido, CriarPedidoRequest, CancelarPedidoRequest } from '../types/Pedido';
import type { AxiosError } from 'axios';

interface ErroResponse {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
}

function extrairMensagemErro(error: unknown): never {
  const axiosError = error as AxiosError<ErroResponse>;
  const mensagem = axiosError?.response?.data?.mensagem;
  if (mensagem) {
    throw new Error(mensagem);
  }
  throw error;
}

export const pedidoService = {
  listar: async (): Promise<Pedido[]> => {
    try {
      const response = await api.get<Pedido[]>('/pedidos');
      return response.data;
    } catch (error) {
      extrairMensagemErro(error);
    }
  },

  buscarPorId: async (id: number | string): Promise<Pedido> => {
    try {
      const response = await api.get<Pedido>(`/pedidos/${id}`);
      return response.data;
    } catch (error) {
      extrairMensagemErro(error);
    }
  },

  criar: async (dados: CriarPedidoRequest): Promise<Pedido> => {
    try {
      const response = await api.post<Pedido>('/pedidos', dados);
      return response.data;
    } catch (error) {
      extrairMensagemErro(error);
    }
  },

  adicionarItem: async (
    clienteId: number,
    itens: { produtoId: number; quantidade: number }[],
    desconto = 0
  ): Promise<Pedido> => {
    return pedidoService.criar({ clienteId, desconto, itens });
  },

  reservar: async (id: number | string): Promise<Pedido> => {
    try {
      const response = await api.post<Pedido>(`/pedidos/${id}/reservar`);
      return response.data;
    } catch (error) {
      extrairMensagemErro(error);
    }
  },

  pagar: async (id: number | string): Promise<Pedido> => {
    try {
      const response = await api.post<Pedido>(`/pedidos/${id}/pagar`);
      return response.data;
    } catch (error) {
      extrairMensagemErro(error);
    }
  },

  cancelar: async (id: number | string, motivo: string): Promise<Pedido> => {
    try {
      const body: CancelarPedidoRequest = { motivoCancelamento: motivo };
      const response = await api.post<Pedido>(`/pedidos/${id}/cancelar`, body);
      return response.data;
    } catch (error) {
      extrairMensagemErro(error);
    }
  },

  deletar: async (id: number | string): Promise<void> => {
    try {
      await api.delete(`/pedidos/${id}`);
    } catch (error) {
      extrairMensagemErro(error);
    }
  },
};