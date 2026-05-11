import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import type { ChatMessage as ChatMessageType, BotMood } from '../../types/Chatbot';
import { ChatMessage } from './ChatMessage';
import BotThinking from '../../assets/chatbot/bot-thinking.svg';

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageType[];
  onSendMessage: (content: string) => void;
  currentMood: BotMood;
}

const SUGGESTIONS = [
  'Verificar estoque',
  'Consultar pedido',
  'Analisar risco',
  'Últimas movimentações'
];

export const ChatbotPanel: React.FC<ChatbotPanelProps> = ({ isOpen, onClose, messages, onSendMessage, currentMood }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, currentMood]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col sm:w-[calc(100vw-2rem)] sm:max-w-[400px] w-[400px] h-[520px] bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-[fade-in_0.2s_ease-out]">
      
      {/* Header limpo */}
      <div className="h-14 border-b border-[#2a2a2a] flex items-center justify-between px-5 bg-[#0a0a0a] shrink-0">
        <div className="flex flex-col">
          <h3 className="text-white font-semibold text-[15px] flex items-center gap-2">
            Accenture Assistant
          </h3>
          <p className="text-green-500 text-xs flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#1a1a1a] rounded-xl"
          aria-label="Fechar chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 pb-2 flex flex-col bg-[#050505]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-50">
            <Sparkles className="w-10 h-10 text-[#a100ff] mb-3 opacity-50" />
            <p className="text-sm text-gray-400">Como posso ajudar na administração do seu e-commerce hoje?</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {currentMood === 'thinking' && (
          <div className="flex items-start gap-3 mb-4 animate-[fade-in_0.3s_ease-out]">
            <img
              src={BotThinking}
              alt="Assistente Pensando"
              className="w-12 h-12 object-contain flex-shrink-0 animate-pulse mt-1"
            />
            <div className="rounded-2xl rounded-tl-sm bg-[#161616] border border-[#2a2a2a] px-5 py-4 text-sm flex gap-1.5 items-center shadow-sm">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-5 pb-3 pt-2 bg-[#050505]">
          <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSendMessage(suggestion)}
                className="whitespace-nowrap px-4 py-1.5 bg-[#161616] border border-[#2a2a2a] text-[12px] font-medium text-gray-300 rounded-full hover:border-[#a100ff] hover:text-[#a100ff] hover:bg-[#1a0033] transition-all flex-shrink-0 shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-[#2a2a2a] bg-[#0a0a0a]">
        <form onSubmit={handleSend} className="flex gap-3 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-[#161616] text-white border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#a100ff] focus:ring-1 focus:ring-[#a100ff] transition-all placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || currentMood === 'thinking'}
            className="bg-[#a100ff] text-white p-3 rounded-xl hover:bg-[#8f00e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-[0_2px_15px_rgba(161,0,255,0.4)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
