'use client';

import { useTRPC } from '@/app/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

export default function NotificationsPage() {
  const trpc = useTRPC();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery(trpc.notifications.getByUser.queryOptions());

  const markAsRead = useMutation(
    trpc.notifications.markAsRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.notifications.getByUser.queryOptions().queryKey });
      },
    })
  );

  const markAllAsRead = useMutation(
    trpc.notifications.markAllAsRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.notifications.getByUser.queryOptions().queryKey });
        addToast('All notifications marked as read', 'success');
      },
    })
  );

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <div className="max-w-3xl mx-auto" data-testid="notifications-page">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            className="px-4 py-2 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No Notifications"
          description="You're all caught up! Check back later for updates."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification, i) => (
            <div
              key={notification.id}
              data-testid="notification-item"
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors animate-fade-in ${
                notification.isRead
                  ? 'bg-card border-border'
                  : 'bg-primary/5 border-primary/20'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0">
                {!notification.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.sentAt).toLocaleString()}
                </p>
              </div>

              {!notification.isRead && (
                <button
                  data-testid="mark-read-button"
                  onClick={() => markAsRead.mutate({ id: notification.id })}
                  className="text-xs text-primary hover:underline flex-shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
