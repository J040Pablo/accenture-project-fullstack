export type TipoTitularConta = 'CLIENTE' | 'EMPRESA';
export type TipoMovimentacao =
  | 'DEPOSITO'
  | 'SAQUE'
  | 'PAGAMENTO_PEDIDO'
  | 'RECEBIMENTO_EMPRESA'
  | 'ESTORNO_CLIENTE'
  | 'ESTORNO_EMPRESA';

export interface Movimentacao {
  id: number;
  contaId: number;
  numeroConta: string;
  tipoTitular: TipoTitularConta;
  tipo: TipoMovimentacao;
  valor: number;
  dataHora: string;
  descricao: string;
  pedidoId?: number;
}
