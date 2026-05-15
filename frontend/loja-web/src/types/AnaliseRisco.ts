export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO';

export interface AnaliseRiscoPedido {
  pedidoId: string;
  numeroPedido: string;
  cliente: string;
  total: string;
  statusPedido: string;
  nivelRisco: RiskLevel;
  score: number;
  motivo: string;
  recomendacao: string;
  fatores: string[];
  dataAnalise?: string;
}

export interface AnaliseRiscoPedidoResponseDTO {
  id: number;
  pedidoId: number;
  nivelRisco: RiskLevel;
  motivo: string;
  dataAnalise: string;
}
