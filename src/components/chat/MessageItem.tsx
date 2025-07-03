
import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '@/types/chat';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  // Ensure timestamp is a Date object
  const timestamp = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
  
  return (
    <div
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.type === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="flex items-start space-x-2">
          {message.type === 'assistant' && (
            <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
          )}
          {message.type === 'user' && (
            <User className="h-4 w-4 mt-1 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="whitespace-pre-wrap text-sm">
              {message.content}
            </p>
            <p className="text-xs opacity-70 mt-1">
              {timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
