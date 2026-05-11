import type { ChatMessage } from '../../types/Chatbot';

export function getMockBotResponse(userMessage: string): ChatMessage {
  const lowerMessage = userMessage.toLowerCase();
  
  let content = 'Posso te ajudar com clientes, produtos, pedidos, estoque, pagamentos, movimentações e análise de risco.';
  let mood: 'default' | 'thinking' | 'warning' | 'blocked' = 'default';

  if (lowerMessage.includes('estoque')) {
    content = 'Encontrei 5 produtos com estoque baixo. Recomendo verificar a tela de Produtos ou Estoque.';
    mood = 'warning';
  } else if (lowerMessage.includes('pagar') || lowerMessage.includes('pagamento') || lowerMessage.includes('pedido')) {
    content = 'Antes de confirmar o pagamento, verifique se o pedido está reservado e se há saldo suficiente na conta do cliente.';
    mood = 'default';
  } else if (lowerMessage.includes('não pode') || lowerMessage.includes('bloqueado') || lowerMessage.includes('erro') || lowerMessage.includes('sem estoque')) {
    content = 'Essa ação não pode ser realizada porque viola uma regra de negócio do sistema.';
    mood = 'blocked';
  } else if (lowerMessage.includes('risco')) {
    content = 'A análise de risco considera valor do pedido, histórico do cliente, quantidade de items e situação do estoque.';
    mood = 'warning';
  }

  return {
    id: Date.now().toString(),
    type: 'bot',
    content,
    createdAt: new Date().toISOString(),
    mood,
  };
}
