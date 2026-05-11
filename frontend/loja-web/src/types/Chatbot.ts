export type ChatMessageType = 'user' | 'bot';

export type BotMood = 'default' | 'thinking' | 'warning' | 'blocked';

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  createdAt: string;
  mood?: BotMood;
}
