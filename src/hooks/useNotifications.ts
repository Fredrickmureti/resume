
import { useState, useEffect, useCallback } from 'react';
import { NotificationService, UserNotification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [userNotifications, count] = await Promise.all([
        NotificationService.getUserNotifications(user.id),
        NotificationService.getUnreadCount(user.id)
      ]);

      setNotifications(userNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await NotificationService.markNotificationAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    const success = await NotificationService.markAllNotificationsAsRead(user.id);
    if (success) {
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
    }
  }, [user?.id]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    console.log('Hook: Deleting notification:', notificationId);
    
    const success = await NotificationService.deleteNotification(notificationId);
    
    if (success) {
      console.log('Hook: Notification deleted successfully, updating state');
      
      // Find the notification to check if it was unread
      const deletedNotif = notifications.find(n => n.id === notificationId);
      
      // Update state immediately
      setNotifications(prev => {
        const updated = prev.filter(notif => notif.id !== notificationId);
        console.log('Hook: Updated notifications count:', updated.length);
        return updated;
      });
      
      // Update unread count if the deleted notification was unread
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } else {
      console.error('Hook: Failed to delete notification');
    }
    
    return success;
  }, [notifications]);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
