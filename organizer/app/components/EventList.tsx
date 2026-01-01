'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import EventDetail from './EventDetail';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Plus, Calendar, MapPin } from 'lucide-react';

interface Event {
  id: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  main_image_url?: string;
  lead_text?: string;
  approval_status?: string;
}

interface EventListProps {
  onCreateEvent: () => void;
  onEditEvent: (eventId: string) => void;
}

export default function EventList({ onCreateEvent, onEditEvent }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        setError('ログインが必要です');
        return;
      }

      const { data: organizer } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!organizer) {
        setError('主催者情報が登録されていません');
        return;
      }

      const { data, error: queryError } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizer.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setEvents(data || []);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(err.message || 'イベントの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('このイベントを削除しますか？')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      loadEvents();
      setSelectedEvent(null);
    } catch (err: any) {
      alert(err.message || 'イベントの削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="p-5">
        <LoadingSpinner />
      </div>
    );
  }

  if (selectedEvent) {
    return <EventDetail eventId={selectedEvent.id} />;
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            イベント管理
          </h1>
          <Button
            onClick={onCreateEvent}
            className="h-9 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新規作成
          </Button>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-10 px-5 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <div className="text-base mb-5">
              イベントがありません
            </div>
            <Button
              onClick={onCreateEvent}
              className="h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
            >
              最初のイベントを作成
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                {event.main_image_url && (
                  <div
                    className="w-full h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.main_image_url})` }}
                  />
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {event.event_name}
                    </h3>
                    {event.approval_status && (
                      <StatusBadge
                        status={event.approval_status === 'approved' ? 'approved' : 'pending'}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(event.event_start_date).toLocaleDateString('ja-JP')} - {new Date(event.event_end_date).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue_name}</span>
                  </div>
                  {event.lead_text && (
                    <div className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {event.lead_text}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
