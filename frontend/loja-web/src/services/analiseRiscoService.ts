import { api } from './api';
import type { AnaliseRiscoPedidoResponseDTO } from '../types/AnaliseRisco';

export const analiseRiscoService = {
  gerarAnalise: (pedidoId: string | number) =>
    api.post<AnaliseRiscoPedidoResponseDTO>(`/pedidos/${pedidoId}/analisar-risco`),

  buscarPorPedido: (pedidoId: string | number) =>
    api.get<AnaliseRiscoPedidoResponseDTO>(`/pedidos/${pedidoId}/analise-risco`),

  // TODO: adicionar endpoint de listagem quando o backend expuser uma coleção de análises.
};
