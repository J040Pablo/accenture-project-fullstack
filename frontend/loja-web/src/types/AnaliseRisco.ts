export type RiskLevel = 'BAIXO' | 'MEDIO' | 'ALTO';

export type PedidoStatus = 'CRIADO' | 'RESERVADO' | 'PAGO' | 'CANCELADO';

// Response DTO mapped from backend
export interface AnaliseRiscoPedidoResponseDTO {
  id: number;
  pedidoId: number;
  clienteId: number | null;
  clienteNome: string | null;
  valorTotal: number;
  saldoCliente: number | null;
  statusPedido: PedidoStatus | null;
  nivelRisco: RiskLevel;
  score: number;
  motivos: string[];
  motivo: string;
  recomendacao: string;
  aprovado: boolean;
  dataAnalise: string;
}

// Friendly frontend type used by mock pages/components
export interface AnaliseRiscoPedido {
  pedidoId: number | string;
  numeroPedido?: string;
  cliente?: string;
  clienteNome?: string | null;
  valorTotal?: number;
  total?: string;
  saldoCliente?: number | null;
  statusPedido?: PedidoStatus | string | null;
  nivelRisco: RiskLevel;
  score?: number;
  fatores?: string[];
  motivos?: string[];
  motivo?: string;
  recomendacao?: string;
  aprovado?: boolean;
  dataAnalise?: string;
}
