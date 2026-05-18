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

// Tipos para validação e erro
export interface CampoErro {
  campo: keyof ProdutoPayload;
  mensagem: string;
}

export interface ProdutoErroResposta {
  mensagemGeral?: string;
  errosCampo: CampoErro[];
  statusCode?: number;
}

export interface ErroApiProduto extends Error {
  erroResposta: ProdutoErroResposta;
  statusCode?: number;
}

// Função para extrair erros da resposta do backend
export function extrairErroProduto(error: unknown): ProdutoErroResposta {
  const erroResposta: ProdutoErroResposta = {
    mensagemGeral: undefined,
    errosCampo: [],
    statusCode: undefined,
  };

  if (error instanceof Error && 'response' in error) {
    const axiosError = error as any;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    erroResposta.statusCode = status;

    // Se for erro 500 ou sem resposta, retornar erro genérico
    if (!data || status >= 500) {
      erroResposta.mensagemGeral =
        'Erro no servidor. Verifique se o backend está ativo.';
      return erroResposta;
    }

    // Tentar extrair mensagem geral
    if (data.mensagem) {
      erroResposta.mensagemGeral = data.mensagem;
    } else if (data.message) {
      erroResposta.mensagemGeral = data.message;
    } else if (typeof data === 'string') {
      erroResposta.mensagemGeral = data;
    }

    // Tentar extrair erros por campo
    if (data.erros && Array.isArray(data.erros)) {
      erroResposta.errosCampo = data.erros
        .filter((e: any) => e.campo && e.mensagem)
        .map((e: any) => ({
          campo: e.campo as keyof ProdutoPayload,
          mensagem: e.mensagem,
        }));
    }

    // Alternativa: tentar extrair de fieldErrors ou validationErrors
    if (data.fieldErrors && typeof data.fieldErrors === 'object') {
      Object.entries(data.fieldErrors).forEach(([campo, mensagens]: [string, any]) => {
        const campoKey = campo as keyof ProdutoPayload;
        const mensagem = Array.isArray(mensagens)
          ? mensagens[0]
          : String(mensagens);
        erroResposta.errosCampo.push({ campo: campoKey, mensagem });
      });
    }

    return erroResposta;
  }

  // Erro de conexão ou desconhecido
  erroResposta.mensagemGeral = 'Erro de conexão com o servidor.';
  return erroResposta;
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