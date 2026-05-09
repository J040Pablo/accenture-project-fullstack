import React, { useState } from 'react';
import { ChatbotTrigger } from './ChatbotTrigger';
import { ChatbotPanel } from './ChatbotPanel';
import type { ChatMessage as ChatMessageType, BotMood } from '../../types/Chatbot';
import { getMockBotResponse } from './chatbotMocks';

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

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMood('thinking');
    
    // Simulate API delay
    setTimeout(() => {
      const botResponse = getMockBotResponse(content);
      setMessages((prev) => [...prev, botResponse]);
      setCurrentMood(botResponse.mood || 'default');
      
      if (botResponse.mood === 'warning') {
         if (!isOpen) setHasAlert(true);
      }
    }, 1500);
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
