
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface QuickPrompt {
  icon: React.ReactNode;
  text: string;
  category: string;
}
