
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Eye, Clock, User } from 'lucide-react';
import { AdminMessageService, AdminUserMessage } from '@/services/adminMessageService';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export const UserMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminUserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<AdminUserMessage | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadMessages();
    }
  }, [user?.id]);

  const loadMessages = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const userMessages = await AdminMessageService.getUserMessages(user.id);
      setMessages(userMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadMessage = async (message: AdminUserMessage) => {
    setSelectedMessage(message);
    
    if (!message.is_read) {
      const success = await AdminMessageService.markMessageAsRead(message.id);
      if (success) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, is_read: true, read_at: new Date().toISOString() }
              : msg
          )
        );
      }
    }
  };

  const getMessageTypeProps = (type: string) => {
    switch (type) {
      case 'warning':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚠️' };
      case 'info':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'ℹ️' };
      case 'support':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: '🎧' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📧' };
    }
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages from Admin
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {messages.map((message) => {
                  const typeProps = getMessageTypeProps(message.message_type);
                  return (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        !message.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleReadMessage(message)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{typeProps.icon}</span>
                          <h4 className="font-medium">{message.subject}</h4>
                          <Badge variant="outline" className={typeProps.color}>
                            {message.message_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {!message.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {selectedMessage && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">{getMessageTypeProps(selectedMessage.message_type).icon}</span>
                {selectedMessage.subject}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>From: Admin</span>
                <span>•</span>
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}</span>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
