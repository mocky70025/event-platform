'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  user_id: string;
  user_type: 'organizer' | 'exhibitor';
  title: string;
  message: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export default function NotificationBox() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error('通知取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('既読更新エラー:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('一括既読更新エラー:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.related_id) {
      router.push(`/events/${notification.related_id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-[#E58A7B] font-medium">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-[#E58A7B]" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">通知</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount > 0 ? `${unreadCount}件の未読通知` : 'すべて既読'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="bg-[#E58A7B] hover:bg-[#D4796A] text-white"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                すべて既読
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {notifications.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                通知はありません
              </h3>
              <p className="text-gray-600">
                新しい通知があるとここに表示されます
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01]',
                  !notification.is_read &&
                    'border-l-4 border-l-[#E58A7B] bg-[#FFF5F3] shadow-md'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                        !notification.is_read 
                          ? 'bg-[#E58A7B] text-white' 
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      <Bell className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3
                          className={cn(
                            'text-base font-bold',
                            !notification.is_read
                              ? 'text-gray-900'
                              : 'text-gray-600'
                          )}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-sm leading-relaxed',
                          !notification.is_read
                            ? 'text-gray-700'
                            : 'text-gray-500'
                        )}
                      >
                        {notification.message}
                      </p>
                      {!notification.is_read && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E58A7B] text-white text-xs font-medium rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          未読
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
