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

export type EnderecoRequest = {
  cep: string;
  rua?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  numero: string;
  complemento?: string;
};

export interface ClienteRequest {
  nome: string;
  cpf: string;
  email: string;
  endereco: EnderecoRequest;
}