
import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

export const LoadingMessage: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
        <div className="flex items-center space-x-2">
          <Bot className="h-4 w-4" />
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      </div>
    </div>
  );
};
