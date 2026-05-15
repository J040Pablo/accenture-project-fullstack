export interface Produto {
  id: number;
  sku: string;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  ativo: boolean;
}