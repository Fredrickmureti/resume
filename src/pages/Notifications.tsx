
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, AlertCircle, Info, Wrench, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'maintenance': return Wrench;
      case 'feature': return Sparkles;
      default: return Info;
    }
  };

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
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Notifications Page: Delete button clicked for:', notificationId);
    
    const success = await deleteNotification(notificationId);
    if (!success) {
      console.error('Notifications Page: Failed to delete notification');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
                  <Bell className="h-8 w-8" />
                  <span>Notifications</span>
                </h1>
                <p className="text-muted-foreground mt-1">Stay updated with the latest announcements</p>
              </div>
            </div>
            {notifications.some(n => !n.is_read) && (
              <Button 
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span>Mark All Read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List with Scrollable Container */}
        <div className="h-[calc(100vh-200px)]">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {notifications.length === 0 ? (
                <Card className="bg-card">
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-card-foreground mb-2">No notifications yet</h3>
                    <p className="text-muted-foreground">You'll see important updates and announcements here.</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = getMessageTypeIcon(notification.admin_messages?.message_type || 'announcement');
                  
                  return (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer hover:shadow-md transition-all bg-card ${
                        !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${getMessageTypeColor(notification.admin_messages?.message_type || 'announcement')}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-semibold text-card-foreground">
                                {notification.admin_messages?.title}
                              </CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                {notification.admin_messages?.message_type && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getMessageTypeColor(notification.admin_messages.message_type)}`}
                                  >
                                    {notification.admin_messages.message_type}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {!notification.is_read && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {notification.admin_messages?.content}
                          </p>
                        </div>
                        {notification.admin_messages?.expires_at && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              Expires: {new Date(notification.admin_messages.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            You'll receive notifications here for important updates and announcements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
