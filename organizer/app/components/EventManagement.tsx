'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Event {
  id: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  main_image_url: string | null;
  approval_status: string;
  recruitment_count: number | null;
  event_description: string | null;
}

export default function EventManagement() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizerId, setOrganizerId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      // 主催者IDを取得
      const { data: organizerData, error: organizerError } = await supabase
        .from('organizers')
        .select('id, is_approved')
        .eq('user_id', user.id)
        .single();

      if (organizerError) throw organizerError;
      setOrganizerId(organizerData.id);

      // イベント一覧を取得
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('イベント取得エラー:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">イベント管理</h1>
          <Button
            onClick={() => router.push('/events/new')}
            className="bg-organizer hover:bg-organizer-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </div>
      </header>

      {/* イベント一覧 */}
      <main className="px-4 py-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">イベントがありません</p>
            <Button
              onClick={() => router.push('/events/new')}
              className="bg-organizer hover:bg-organizer-dark"
            >
              最初のイベントを作成
            </Button>
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
                accent="organizer"
                onClick={() => router.push(`/events/${event.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
