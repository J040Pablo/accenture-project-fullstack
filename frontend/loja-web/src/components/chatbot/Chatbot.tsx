import React, { useState } from 'react';
import { ChatbotTrigger } from './ChatbotTrigger';
import { ChatbotPanel } from './ChatbotPanel';
import type { ChatMessage as ChatMessageType, BotMood } from '../../types/Chatbot';
import { sendChatMessage } from '../../services/chatbot';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [hasAlert, setHasAlert] = useState(false);
  const [currentMood, setCurrentMood] = useState<BotMood>('default');

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
        setHasAlert(false);
        setCurrentMood('default'); // reset
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMood('thinking');

    try {
      const answer = await sendChatMessage(content);

      const botMessage: ChatMessageType = {
        id: Date.now().toString(),
        type: 'bot',
        content: answer,
        createdAt: new Date().toISOString(),
        mood: 'default',
      } as ChatMessageType;

      setMessages((prev) => [...prev, botMessage]);
      setCurrentMood('default');
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Não consegui responder agora. Tente novamente.',
          createdAt: new Date().toISOString(),
          mood: 'default',
        } as ChatMessageType,
      ]);
      setCurrentMood('default');
      if (!isOpen) setHasAlert(true);
    }
  };

  return (
    <>
      <ChatbotTrigger 
        onClick={toggleChat} 
        isOpen={isOpen} 
        hasAlert={hasAlert} 
      />
      
      <ChatbotPanel 
        isOpen={isOpen} 
        onClose={toggleChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentMood={currentMood}
      />
    </>
  );
};
