import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Eye, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { AdminMessageService } from '@/services/adminMessageService';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [adminMessageCount, setAdminMessageCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      loadAdminMessageCount();
    }
  }, [user?.id]);

  const loadAdminMessageCount = async () => {
    if (!user?.id) return;
    try {
      const count = await AdminMessageService.getUnreadMessageCount(user.id);
      setAdminMessageCount(count);
    } catch (error) {
      console.error('Error loading admin message count:', error);
    }
  };

  const totalUnreadCount = unreadCount + adminMessageCount;

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      case 'feature': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setOpen(false);
    navigate('/notifications');
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Component: Delete button clicked for:', notificationId);
    
    const success = await deleteNotification(notificationId);
    if (!success) {
      console.error('Component: Failed to delete notification');
    }
  };

  const handleViewAllClick = () => {
    setOpen(false);
    navigate('/notifications');
  };

  const handleMessagesClick = () => {
    setOpen(false);
    navigate('/dashboard'); // Assuming messages are shown in dashboard
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-popover" align="end">
        <Card className="border-0 shadow-lg bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Notifications {totalUnreadCount > 0 && `(${totalUnreadCount})`}
              </CardTitle>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="h-6 px-2 text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : (
              <>
                {/* Admin Messages Section */}
                {adminMessageCount > 0 && (
                  <div className="p-3 border-b bg-blue-50">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-blue-100 p-2 rounded"
                      onClick={handleMessagesClick}
                    >
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {adminMessageCount} new message{adminMessageCount > 1 ? 's' : ''} from admin
                      </span>
                      <Badge variant="secondary" className="ml-auto">
                        {adminMessageCount}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Regular Notifications */}
                {notifications.length === 0 && adminMessageCount === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-80">
                      <div className="space-y-1 p-1">
                        {notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                              !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500 dark:bg-blue-950/30' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium line-clamp-1 text-card-foreground">
                                    {notification.admin_messages?.title}
                                  </h4>
                                  {notification.admin_messages?.message_type && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getMessageTypeColor(notification.admin_messages.message_type)}`}
                                    >
                                      {notification.admin_messages.message_type}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                  {notification.admin_messages?.content}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* View All Button */}
                    <div className="p-3 border-t bg-muted/50">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleViewAllClick}
                        className="w-full justify-center text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View All Notifications
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
