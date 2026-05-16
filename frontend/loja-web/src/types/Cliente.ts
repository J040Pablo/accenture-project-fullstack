import type { Endereco } from './Endereco';

export interface ContaCorrente {
  id?: number;
  numeroConta?: string;
  saldo?: number;
  tipoTitular?: string;
}

export interface Cliente {
  id?: number;
  nome: string;
  cpf: string;
  email: string;
  endereco: Endereco;
  contaCorrente?: ContaCorrente;
}

export interface ClienteRequest {
  nome: string;
  cpf: string;
  email: string;
  endereco: {
    cep: string;
    numero: string;
    complemento?: string;
  };
}