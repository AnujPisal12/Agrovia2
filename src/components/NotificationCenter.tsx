import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: {
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
}

// Mock notifications - in real app, this would come from a store/API
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    priority: 'high',
    title: 'Batch Expiring Soon',
    message: 'Batch B001 (Tomatoes) expires in 2 days. Consider priority sale.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    actions: [
      { label: 'View Batch', action: () => console.log('View batch'), variant: 'default' },
      { label: 'Mark Priority', action: () => console.log('Mark priority'), variant: 'outline' }
    ]
  },
  {
    id: '2',
    type: 'success',
    priority: 'medium',
    title: 'Quality Test Complete',
    message: 'Batch B002 (Carrots) received Grade A certification.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actions: [
      { label: 'View Results', action: () => console.log('View results') }
    ]
  },
  {
    id: '3',
    type: 'info',
    priority: 'low',
    title: 'New Farmer Registered',
    message: 'John Smith has been added to the farmer database.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true
  },
  {
    id: '4',
    type: 'error',
    priority: 'urgent',
    title: 'Storage Temperature Alert',
    message: 'Cold storage unit 2 temperature exceeded threshold. Immediate action required.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    actions: [
      { label: 'Check Unit', action: () => console.log('Check unit'), variant: 'destructive' },
      { label: 'Call Maintenance', action: () => console.log('Call maintenance'), variant: 'outline' }
    ]
  }
];

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertTriangle,
  success: CheckCircle2
};

const typeColors = {
  info: 'text-blue-500',
  warning: 'text-warning',
  error: 'text-destructive',
  success: 'text-fresh'
};

const priorityColors = {
  low: 'bg-muted',
  medium: 'bg-blue-500',
  high: 'bg-warning',
  urgent: 'bg-destructive'
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent').length;

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new notifications occasionally
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.7 ? 'warning' : 'info',
          priority: Math.random() > 0.8 ? 'high' : 'medium',
          title: 'New Update',
          message: 'A new event has occurred in the system.',
          timestamp: new Date(),
          read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'urgent':
        return notification.priority === 'urgent';
      default:
        return true;
    }
  });

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {urgentCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 glass" align="end">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <Badge variant="secondary" className="text-xs">
              {notifications.length} total
            </Badge>
          </div>
          {unreadCount > 0 && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 m-2 mb-0">
            <TabsTrigger value="all" className="text-xs">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="urgent" className="text-xs relative">
              Urgent ({urgentCount})
              {urgentCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {filter === 'all' ? 'No notifications to show' : 
                     filter === 'unread' ? 'No unread notifications' : 
                     'No urgent notifications'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredNotifications
                    .sort((a, b) => {
                      // Sort by priority first, then by timestamp
                      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                      if (priorityDiff !== 0) return priorityDiff;
                      return b.timestamp.getTime() - a.timestamp.getTime();
                    })
                    .map((notification) => {
                      const Icon = typeIcons[notification.type];
                      return (
                        <Card 
                          key={notification.id} 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md border-0 bg-secondary/20",
                            !notification.read && "bg-primary/5 border-l-4 border-l-primary",
                            notification.priority === 'urgent' && "ring-1 ring-destructive/50 bg-destructive/5"
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn("mt-0.5", typeColors[notification.type])}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className={cn(
                                    "font-medium text-sm truncate",
                                    !notification.read && "font-semibold"
                                  )}>
                                    {notification.title}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className={cn(
                                        "w-2 h-2 rounded-full",
                                        priorityColors[notification.priority]
                                      )}
                                      title={`${notification.priority} priority`}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-50 hover:opacity-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dismissNotification(notification.id);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatTimestamp(notification.timestamp)}
                                  </div>
                                  {notification.actions && (
                                    <div className="flex gap-1">
                                      {notification.actions.map((action, index) => (
                                        <Button
                                          key={index}
                                          variant={action.variant || 'outline'}
                                          size="sm"
                                          className="h-6 px-2 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            action.action();
                                            markAsRead(notification.id);
                                          }}
                                        >
                                          {action.label}
                                        </Button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}