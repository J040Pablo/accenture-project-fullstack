import { api } from './api';
import type { Produto } from '../types/Produto';

export interface ProdutoPayload {
  sku: string;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  ativo?: boolean;
}

export async function listarProdutos(): Promise<Produto[]> {
  const response = await api.get('/produtos');
  return response.data;
}

export async function buscarProdutoPorId(id: number): Promise<Produto> {
  const response = await api.get(`/produtos/${id}`);
  return response.data;
}

export async function cadastrarProduto(produto: ProdutoPayload): Promise<Produto> {
  const response = await api.post('/produtos', produto);
  return response.data;
}

export async function atualizarProduto(id: number, produto: ProdutoPayload): Promise<Produto> {
  const response = await api.put(`/produtos/${id}`, produto);
  return response.data;
}

export async function excluirProduto(id: number): Promise<unknown> {
  const response = await api.delete(`/produtos/${id}`);
  return response.data;
}

export async function ativarProduto(id: number): Promise<Produto> {
  const response = await api.patch(`/produtos/${id}/ativar`);
  return response.data;
}

export async function inativarProduto(id: number): Promise<Produto> {
  const response = await api.patch(`/produtos/${id}/inativar`);
  return response.data;
}

export const produtoService = {
  listar: listarProdutos,
  buscarPorId: buscarProdutoPorId,
  cadastrar: cadastrarProduto,
  atualizar: atualizarProduto,
  excluir: excluirProduto,
  ativar: ativarProduto,
  inativar: inativarProduto,
};