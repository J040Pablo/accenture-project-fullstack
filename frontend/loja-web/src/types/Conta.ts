export type TipoTitularConta = 'CLIENTE' | 'EMPRESA';

export interface Conta {
  id: number;
  numeroConta: string;
  saldo: number;
  tipoTitular: TipoTitularConta;
}
