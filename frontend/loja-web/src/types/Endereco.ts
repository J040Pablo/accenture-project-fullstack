export interface Endereco {
  id?: number;
  cep: string;
  numero: string;
  complemento?: string;
  rua?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}