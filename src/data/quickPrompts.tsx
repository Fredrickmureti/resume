
import { Briefcase, Lightbulb, HelpCircle, MessageCircle } from 'lucide-react';
import { QuickPrompt } from '@/types/chat';

export const quickPrompts: QuickPrompt[] = [
  {
    icon: <Briefcase className="h-4 w-4" />,
    text: "What should I write for my internship experience?",
    category: "Experience"
  },
  {
    icon: <Lightbulb className="h-4 w-4" />,
    text: "How can I improve my professional summary?",
    category: "Summary"
  },
  {
    icon: <HelpCircle className="h-4 w-4" />,
    text: "What's the difference between CV and Resume?",
    category: "General"
  },
  {
    icon: <MessageCircle className="h-4 w-4" />,
    text: "How do I quantify my achievements?",
    category: "Tips"
  }
];
