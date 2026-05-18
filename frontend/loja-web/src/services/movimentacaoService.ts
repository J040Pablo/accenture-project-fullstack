import { api } from './api';

export const movimentacaoService = {
  listar: () => api.get('/movimentacoes'),
  listarPorConta: (contaId: string | number) =>
    api.get(`/contas/${contaId}/movimentacoes`),
};