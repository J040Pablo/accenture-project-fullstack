export type TipoTitularConta = 'CLIENTE' | 'EMPRESA';

export interface Conta {
  id: number;
  numeroConta: string;
  titularNome?: string;
  saldo: number;
  tipoTitular: TipoTitularConta;
}
