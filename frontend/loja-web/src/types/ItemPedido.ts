export interface ItemPedido {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number; 
  subtotal: number;
}

export interface ItemPedidoRequest {
  produtoId: number;
  quantidade: number;
}