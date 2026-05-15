export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  status: 'ATIVO' | 'INATIVO';
}

export type { Produto } from './Produto';

export interface Pedido {
  id: number;
  clienteId: number;
  clienteNome: string;
  data: string;
  total: number;
  status: 'PENDENTE' | 'PAGO' | 'ENVIADO' | 'CANCELADO';
}

export interface Movimentacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'ENTRADA' | 'SAIDA';
  data: string;
}
