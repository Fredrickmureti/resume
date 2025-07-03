
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message } from '@/types/chat';

interface ChatState {
  messages: Message[];
  inputMessage: string;
  isLoading: boolean;
}

interface ChatStateContextType {
  chatState: ChatState;
  updateMessages: (messages: Message[]) => void;
  updateInputMessage: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
  clearChat: () => void;
}

const ChatStateContext = createContext<ChatStateContextType | undefined>(undefined);

const CHAT_STORAGE_KEY = 'resume_chat_state';

const createDefaultMessage = (): Message => ({
  id: '1',
  type: 'assistant',
  content: "Hello! I'm your AI Resume Assistant. I can help you with writing experience descriptions, improving your resume content, answering career questions, and providing personalized advice based on your resume. What would you like to know?",
  timestamp: new Date()
});

export const ChatStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chatState, setChatState] = useState<ChatState>(() => {
    // Load from localStorage on initialization
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.messages?.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })) || [createDefaultMessage()];
        
        return {
          messages: messagesWithDates,
          inputMessage: parsed.inputMessage || '',
          isLoading: false
        };
      }
    } catch (error) {
      console.error('Error loading chat state:', error);
    }
    
    return {
      messages: [createDefaultMessage()],
      inputMessage: '',
      isLoading: false
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
        messages: chatState.messages,
        inputMessage: chatState.inputMessage
      }));
    } catch (error) {
      console.error('Error saving chat state:', error);
    }
  }, [chatState]);

  const updateMessages = (messages: Message[]) => {
    setChatState(prev => ({ ...prev, messages }));
  };

  const updateInputMessage = (message: string) => {
    setChatState(prev => ({ ...prev, inputMessage: message }));
  };

  const setIsLoading = (loading: boolean) => {
    setChatState(prev => ({ ...prev, isLoading: loading }));
  };

  const clearChat = () => {
    setChatState({
      messages: [createDefaultMessage()],
      inputMessage: '',
      isLoading: false
    });
  };

  return (
    <ChatStateContext.Provider value={{
      chatState,
      updateMessages,
      updateInputMessage,
      setIsLoading,
      clearChat
    }}>
      {children}
    </ChatStateContext.Provider>
  );
};

export const useChatState = () => {
  const context = useContext(ChatStateContext);
  if (context === undefined) {
    throw new Error('useChatState must be used within a ChatStateProvider');
  }
  return context;
};
