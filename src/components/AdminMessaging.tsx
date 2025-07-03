
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, MessageSquare, User, Mail, Calendar } from 'lucide-react';
import { AdminMessageService, CreateAdminMessageData } from '@/services/adminMessageService';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface AdminMessagingProps {
  users: Array<{
    id: string;
    full_name: string;
    email: string;
    last_login_at: string;
    created_at: string;
  }>;
  currentUserId: string;
}

export const AdminMessaging: React.FC<AdminMessagingProps> = ({ users, currentUserId }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState<'direct' | 'support' | 'warning' | 'info'>('direct');
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!selectedUser || !subject.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const messageData: CreateAdminMessageData = {
        user_id: selectedUser,
        subject: subject.trim(),
        content: content.trim(),
        message_type: messageType
      };

      const result = await AdminMessageService.sendMessageToUser(currentUserId, messageData);
      
      if (result) {
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully.",
        });
        
        // Reset form
        setSelectedUser('');
        setSubject('');
        setContent('');
        setMessageType('direct');
        setIsOpen(false);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'support': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLastLoginStatus = (lastLogin: string) => {
    if (!lastLogin) return { text: 'Never', color: 'text-gray-500' };
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffHours = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) return { text: 'Active', color: 'text-green-600' };
    if (diffHours < 168) return { text: 'Recent', color: 'text-yellow-600' };
    return { text: 'Inactive', color: 'text-red-600' };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            User Management & Messaging
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Message to User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select User</label>
                  <Select onValueChange={setSelectedUser} value={selectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{user.full_name || 'Unnamed User'}</span>
                            <span className="text-gray-500">({user.email})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message Type</label>
                  <Select onValueChange={(value: any) => setMessageType(value)} value={messageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Message</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    placeholder="Enter message subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message Content</label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage} disabled={sending}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => {
            const lastLoginStatus = getLastLoginStatus(user.last_login_at);
            return (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={lastLoginStatus.color}>
                      {lastLoginStatus.text}
                    </Badge>
                    
                    {user.last_login_at && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user.id);
                    setIsOpen(true);
                  }}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
