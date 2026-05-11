import React from 'react';
import type { ChatMessage as ChatMessageType, BotMood } from '../../types/Chatbot';

import BotDefault from '../../assets/chatbot/bot-default.svg';
import BotThinking from '../../assets/chatbot/bot-thinking.svg';
import BotWarningRed from '../../assets/chatbot/bot-warning-red.svg';
import BotBlockedBlue from '../../assets/chatbot/bot-blocked-blue.svg';

interface ChatMessageProps {
  message: ChatMessageType;
}

const getBotImage = (mood?: BotMood) => {
  switch (mood) {
    case 'warning': return BotWarningRed;
    case 'blocked': return BotBlockedBlue;
    case 'thinking': return BotThinking;
    case 'default':
    default: return BotDefault;
  }
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';

  if (isBot) {
    return (
      <div className="flex items-start gap-3 mb-4 animate-[fade-in_0.3s_ease-out]">
        <img
          src={getBotImage(message.mood)}
          alt="Assistente"
          className="w-12 h-12 mt-1 object-contain flex-shrink-0"
        />

        <div className="rounded-2xl rounded-tl-sm bg-[#161616] border border-[#2a2a2a] px-4 py-3 text-[13px] leading-relaxed text-slate-100 flex flex-col shadow-sm">
          {message.content}
          <span className="text-[10px] text-gray-500 mt-1.5 self-start font-medium">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end mb-4 animate-[fade-in_0.3s_ease-out]">
      <div className="rounded-2xl rounded-tr-sm bg-[#a100ff] px-4 py-3 text-[13px] leading-relaxed text-white shadow-sm flex flex-col max-w-[85%]">
        {message.content}
        <span className="text-[10px] text-[#f0f0f0] opacity-80 mt-1.5 self-end font-medium">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
