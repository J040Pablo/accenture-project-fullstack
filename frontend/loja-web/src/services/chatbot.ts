import api from './api';

type ChatResponse = {
  answer: string;
};

export async function sendChatMessage(message: string): Promise<string> {
  const response = await api.post<ChatResponse>('/chat', { message });

  if (response.status !== 200) {
    throw new Error('Erro ao conversar com o assistente.');
  }

  return response.data.answer;
}
