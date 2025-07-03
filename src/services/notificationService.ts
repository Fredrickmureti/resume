import { supabase } from '@/integrations/supabase/client';

export interface AdminMessage {
  id: string;
  title: string;
  content: string;
  message_type: 'announcement' | 'warning' | 'maintenance' | 'feature';
  target_audience: 'all' | 'free' | 'premium';
  is_active: boolean;
  send_email: boolean;
  created_by: string;
  created_at: string;
  expires_at?: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  message_id: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  admin_messages?: AdminMessage;
}

export class NotificationService {
  static async getUserNotifications(userId: string): Promise<UserNotification[]> {
    const { data, error } = await supabase
      .from('user_notifications')
      .select(`
        *,
        admin_messages(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return (data || []) as UserNotification[];
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  static async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  }

  static async deleteNotification(notificationId: string): Promise<boolean> {
    console.log('Attempting to delete notification:', notificationId);
    
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }

    console.log('Notification deleted successfully:', notificationId);
    return true;
  }

  static async createAdminMessage(message: Omit<AdminMessage, 'id' | 'created_at'>): Promise<AdminMessage | null> {
    const { data, error } = await supabase
      .from('admin_messages')
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error('Error creating admin message:', error);
      return null;
    }

    // Create notifications for all users and send emails if needed
    if (data) {
      await this.createNotificationsForMessage(data.id, data.target_audience);
      
      if (data.send_email) {
        // Cast the data to AdminMessage type to fix TypeScript error
        const adminMessage: AdminMessage = {
          ...data,
          message_type: data.message_type as 'announcement' | 'warning' | 'maintenance' | 'feature',
          target_audience: data.target_audience as 'all' | 'free' | 'premium'
        };
        await this.sendNotificationEmails(adminMessage);
      }
    }

    return data ? {
      ...data,
      message_type: data.message_type as 'announcement' | 'warning' | 'maintenance' | 'feature',
      target_audience: data.target_audience as 'all' | 'free' | 'premium'
    } as AdminMessage : null;
  }

  static async createNotificationsForMessage(messageId: string, targetAudience: string): Promise<void> {
    // Get all user IDs based on target audience
    let query = supabase.from('profiles').select('id');
    
    // For now, we'll send to all users regardless of audience
    // TODO: Implement premium/free user distinction
    
    const { data: users, error } = await query;

    if (error || !users) {
      console.error('Error fetching users for notifications:', error);
      return;
    }

    // Create notifications for all users
    const notifications = users.map(user => ({
      user_id: user.id,
      message_id: messageId
    }));

    const { error: insertError } = await supabase
      .from('user_notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Error creating notifications:', insertError);
    }
  }

  static async sendNotificationEmails(message: AdminMessage): Promise<void> {
    try {
      // Get all user emails
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email')
        .not('email', 'is', null);

      if (error || !profiles) {
        console.error('Error fetching user emails:', error);
        return;
      }

      const recipients = profiles
        .map(profile => profile.email)
        .filter(email => email !== null) as string[];

      if (recipients.length === 0) {
        console.log('No recipients found for email notification');
        return;
      }

      // Call the edge function to send emails
      const { data, error: emailError } = await supabase.functions.invoke('send-notification-email', {
        body: {
          recipients,
          title: message.title,
          content: message.content,
          messageType: message.message_type
        }
      });

      if (emailError) {
        console.error('Error sending notification emails:', emailError);
        // Log more details about the error
        console.error('Email error details:', {
          message: emailError.message,
          details: emailError.details,
          hint: emailError.hint
        });
      } else {
        console.log('Notification emails sent successfully:', data);
      }
    } catch (error) {
      console.error('Error in sendNotificationEmails:', error);
    }
  }

  static async getAdminMessages(): Promise<AdminMessage[]> {
    const { data, error } = await supabase
      .from('admin_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin messages:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      message_type: item.message_type as 'announcement' | 'warning' | 'maintenance' | 'feature',
      target_audience: item.target_audience as 'all' | 'free' | 'premium'
    })) as AdminMessage[];
  }

  static async updateAdminMessage(id: string, updates: Partial<AdminMessage>): Promise<boolean> {
    const { error } = await supabase
      .from('admin_messages')
      .update(updates)
      .eq('id', id);

    return !error;
  }

  static async deleteAdminMessage(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('admin_messages')
      .delete()
      .eq('id', id);

    return !error;
  }
}
