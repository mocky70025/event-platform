'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { EventCard } from '@/components/event-card';
import { Bell, History, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  main_image_url: string | null;
  approval_status: string;
  recruitment_count: number | null;
}

export default function ExhibitorHome() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchEvents();
    fetchUnreadNotifications();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('approval_status', 'approved')
        .order('event_start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('イベント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('通知取得エラー:', error);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = `${startDate.getMonth() + 1}/${startDate.getDate()}`;
    const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
    return `${startStr} - ${endStr}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">イベント一覧</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">現在、申し込み可能なイベントはありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                title={event.event_name}
                date={formatDateRange(event.event_start_date, event.event_end_date)}
                location={event.venue_name}
                capacity={event.recruitment_count || undefined}
                image={event.main_image_url || undefined}
                status={event.approval_status as any}
                accent="store"
                onClick={() => router.push(`/events/${event.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="flex items-center justify-around h-16">
          <button
            onClick={() => setActiveTab('notifications')}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors relative',
              activeTab === 'notifications' ? 'text-store' : 'text-gray-500'
            )}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-[calc(50%-8px)] bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className="text-xs mt-1">通知</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors',
              activeTab === 'history' ? 'text-store' : 'text-gray-500'
            )}
          >
            <History className="h-6 w-6" />
            <span className="text-xs mt-1">履歴</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors',
              activeTab === 'search' ? 'text-store' : 'text-gray-500'
            )}
          >
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">検索</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors',
              activeTab === 'profile' ? 'text-store' : 'text-gray-500'
            )}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">プロフィール</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
