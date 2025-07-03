
import { supabase } from '@/integrations/supabase/client';

export interface AdminUserMessage {
  id: string;
  admin_id: string;
  user_id: string;
  subject: string;
  content: string;
  message_type: 'direct' | 'support' | 'warning' | 'info';
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminMessageData {
  user_id: string;
  subject: string;
  content: string;
  message_type?: 'direct' | 'support' | 'warning' | 'info';
}

export class AdminMessageService {
  static async sendMessageToUser(adminId: string, data: CreateAdminMessageData): Promise<AdminUserMessage | null> {
    const { data: message, error } = await supabase
      .from('admin_user_messages')
      .insert({
        admin_id: adminId,
        ...data
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending admin message:', error);
      return null;
    }

    return message as AdminUserMessage;
  }

  static async getUserMessages(userId: string): Promise<AdminUserMessage[]> {
    const { data, error } = await supabase
      .from('admin_user_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user messages:', error);
      return [];
    }

    return (data || []) as AdminUserMessage[];
  }

  static async markMessageAsRead(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('admin_user_messages')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      return false;
    }

    return true;
  }

  static async getUnreadMessageCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('admin_user_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread message count:', error);
      return 0;
    }

    return count || 0;
  }

  static async getAllUsersWithMessages(): Promise<any[]> {
    const { data, error } = await supabase
      .from('admin_user_messages')
      .select(`
        user_id,
        profiles!inner(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users with messages:', error);
      return [];
    }

    return data || [];
  }
}
