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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col sm:w-[calc(100vw-2rem)] sm:max-w-[400px] w-[400px] h-[520px] glass rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-[fade-in_0.3s_ease-out]">
      
      {/* Header limpo */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex flex-col">
          <h3 className="text-white font-black text-base flex items-center gap-2 tracking-tight">
            Accenture AI
          </h3>
          <p className="text-[#a1ffdb] text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-[#a1ffdb] rounded-full animate-pulse shadow-[0_0_8px_#a1ffdb]"></span>
            Interface Ativa
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10"
          aria-label="Fechar chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 pb-2 flex flex-col bg-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-40">
            <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 shadow-inner">
               <Sparkles className="w-8 h-8 text-[#a100ff]" />
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px]">Como posso auxiliar na otimização da sua operação hoje?</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {currentMood === 'thinking' && (
          <div className="flex items-start gap-4 mb-4 animate-[fade-in_0.3s_ease-out]">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0 animate-pulse mt-1 shadow-inner">
              <img
                src={BotThinking}
                alt="Pensando"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/5 px-5 py-4 flex gap-1.5 items-center shadow-lg backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#a100ff]/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#a100ff]/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#a100ff]/60 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-6 pb-4 pt-2">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSendMessage(suggestion)}
                className="whitespace-nowrap px-4 py-2 bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-tighter text-slate-400 rounded-xl hover:border-[#a100ff]/40 hover:text-[#d8b4fe] hover:bg-[#a100ff]/5 transition-all flex-shrink-0 shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-5 border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <form onSubmit={handleSend} className="flex gap-3 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Comando para a IA..."
            className="flex-1 bg-white/[0.03] text-white border border-white/5 rounded-2xl px-5 py-3.5 text-sm outline-none focus:outline-none focus:ring-0 focus:border-[#a100ff]/40 focus:shadow-[0_0_15px_-3px_rgba(161,0,255,0.2)] transition-all duration-300 placeholder:text-slate-600 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || currentMood === 'thinking'}
            className="bg-[#a100ff] text-white w-12 h-12 rounded-2xl hover:bg-[#8f00e6] transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center flex-shrink-0 shadow-[0_5px_20px_-5px_rgba(161,0,255,0.6)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
