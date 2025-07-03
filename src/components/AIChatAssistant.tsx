
import React, { useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResumeData } from '@/types/resume';
import { Message } from '@/types/chat';
import { MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useChatState } from '@/contexts/ChatStateContext';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useCredits } from '@/hooks/useCredits';
import { generateContextualResponse } from '@/utils/chatResponses';
import { GeminiCore } from '@/services/geminiCore';
import { MessageItem } from '@/components/chat/MessageItem';
import { LoadingMessage } from '@/components/chat/LoadingMessage';
import { QuickPrompts } from '@/components/chat/QuickPrompts';
import { ChatInput } from '@/components/chat/ChatInput';

interface AIChatAssistantProps {
  resumeData: ResumeData;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  resumeData
}) => {
  const { user } = useAuth();
  const { checkRateLimit } = useRateLimit('ai-chat');
  const { chatState, updateMessages, updateInputMessage, setIsLoading, clearChat } = useChatState();
  const { checkAndDeductCredits } = useCredits();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, scrollToBottom]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || chatState.inputMessage;
    
    if (!text || !text.trim()) {
      console.log('No message text provided');
      return;
    }

    console.log('Sending message:', text);

    if (!user) {
      toast({
        title: "Premium Feature",
        description: "Please sign in to use the AI Chat Assistant.",
        variant: "destructive"
      });
      return;
    }

    // Check rate limit
    const canProceed = await checkRateLimit();
    if (!canProceed) {
      return;
    }

    // Check and deduct credits before proceeding
    const creditsOk = await checkAndDeductCredits('ai_suggestions', 'AI chat assistance');
    if (!creditsOk) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    updateMessages([...chatState.messages, userMessage]);
    updateInputMessage('');
    setIsLoading(true);

    try {
      // Call AI directly for faster response
      const response = await GeminiCore.callAI(text.trim(), 'chat_message', {
        resumeData,
        conversationContext: chatState.messages.slice(-5)
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.suggestions?.summary || response.content || 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date()
      };

      updateMessages([...chatState.messages, userMessage, assistantMessage]);
      setIsLoading(false);

    } catch (error) {
      console.error('Error in direct AI chat:', error);
      
      // Use fallback response on error
      const fallbackResponse = generateContextualResponse(text.trim(), resumeData);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };
      
      updateMessages([...chatState.messages, userMessage, assistantMessage]);
      setIsLoading(false);
      
      toast({
        title: "Using Fallback Response",
        description: "AI service temporarily unavailable, providing contextual help.",
        variant: "default"
      });
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="space-y-6">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span>AI Resume Assistant</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Premium AI Feature
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
          <QuickPrompts onPromptClick={handleQuickPrompt} />

          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-2">
                {chatState.messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
                
                {chatState.isLoading && <LoadingMessage />}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          <ChatInput
            inputMessage={chatState.inputMessage}
            setInputMessage={updateInputMessage}
            onSend={() => sendMessage()}
            isLoading={chatState.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
