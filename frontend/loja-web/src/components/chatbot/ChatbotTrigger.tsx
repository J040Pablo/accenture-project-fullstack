import React from 'react';
import BotSleeping from '../../assets/chatbot/bot-sleeping.svg';

interface ChatbotTriggerProps {
  onClick: () => void;
  isOpen: boolean;
  hasAlert?: boolean;
}

export const ChatbotTrigger: React.FC<ChatbotTriggerProps> = ({ onClick, isOpen, hasAlert }) => {
  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir assistente"
      className="fixed bottom-6 right-6 z-50 w-28 h-28 flex items-center justify-center bg-transparent border-none outline-none"
    >
      {/* sleeping-float-hover: CSS selector triggers sleepingFloat on the img on hover */}
      <div className="sleeping-float-hover relative w-20 h-20 flex items-center justify-center">
        <img
          src={BotSleeping}
          alt="Abrir assistente"
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_0_15px_rgba(161,0,255,0.35)]"
          draggable={false}
        />
        {hasAlert && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#111111] animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
        )}
      </div>
    </button>
  );
};
