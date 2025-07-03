
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  endpoint?: string;
  metadata?: any;
  created_at: string;
}

interface ActiveUser {
  id: string;
  full_name: string | null;
  email: string | null;
  is_online: boolean;
  last_activity_at: string;
}

export const useRealTimeActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_online, last_activity_at')
        .eq('is_online', true)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      setActiveUsers(data || []);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select(`
          id,
          user_id,
          activity_type,
          endpoint,
          metadata,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityType: string, endpoint?: string, metadata?: any) => {
    if (!user?.id) return;

    try {
      await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_activity_type: activityType,
        p_endpoint: endpoint,
        p_metadata: metadata || {}
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    fetchRecentActivity();

    // Set up real-time subscriptions
    const activityChannel = supabase
      .channel('user_activity_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activity'
        },
        (payload) => {
          setActivities(prev => [payload.new as UserActivity, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          const updatedProfile = payload.new as ActiveUser;
          setActiveUsers(prev => {
            const filtered = prev.filter(u => u.id !== updatedProfile.id);
            if (updatedProfile.is_online) {
              return [updatedProfile, ...filtered];
            }
            return filtered;
          });
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  // Mark user as offline when they leave
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ is_online: false })
          .eq('id', user.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user?.id]);

  return {
    activities,
    activeUsers,
    loading,
    logActivity,
    fetchActiveUsers,
    fetchRecentActivity
  };
};
