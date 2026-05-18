import type { ItemPedido } from './ItemPedido';

export type PedidoStatus = 'CRIADO' | 'RESERVADO' | 'PAGO' | 'CANCELADO';

export interface Pedido {
  idPedido: number;
  clienteId: number;
  status: PedidoStatus;
  dataCriacao: string;        
  dataReserva: string | null;
  desconto: number;           
  totalBruto: number;
  totalFinal: number;
  dataPagamento: string | null;
  dataCancelamento: string | null;
  motivoCancelamento: string | null;
  itens?: ItemPedido[];       
}

export interface CriarPedidoRequest {
  clienteId: number;
  desconto?: number;
  itens: { produtoId: number; quantidade: number }[];
}

export interface CancelarPedidoRequest {
  motivoCancelamento: string;
}