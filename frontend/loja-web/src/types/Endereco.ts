export interface Endereco {
  id?: number;
  cep: string;
  numero: string;
  complemento?: string;
  rua?: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  localidade?: string;
  uf?: string;
}

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  localidade?: string;
  rua?: string;
  cidade?: string;
  bairro?: string;
  uf?: string;
  erro?: boolean;
}