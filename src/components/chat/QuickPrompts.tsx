
import React from 'react';
import { Button } from '@/components/ui/button';
import { quickPrompts } from '@/data/quickPrompts';

interface QuickPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onPromptClick }) => {
  return (
    <div className="flex flex-wrap gap-2 flex-shrink-0">
      {quickPrompts.map((prompt, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onPromptClick(prompt.text)}
          className="text-xs"
        >
          {prompt.icon}
          <span className="ml-1 hidden sm:inline">{prompt.category}</span>
        </Button>
      ))}
    </div>
  );
};
