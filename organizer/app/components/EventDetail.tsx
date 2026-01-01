'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { ArrowLeft, Edit, Trash2, Users, Calendar, MapPin, Tag } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface Event {
  id: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  lead_text: string;
  event_description: string;
  main_image_url: string | null;
  approval_status: string;
  genre: string | null;
  display_period: string | null;
  event_time: string | null;
  prefecture: string | null;
  city: string | null;
  address: string | null;
}

interface EventDetailProps {
  eventId: string;
}

export default function EventDetail({ eventId }: EventDetailProps) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data: organizerData, error: organizerError } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (organizerError) throw organizerError;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('organizer_id', organizerData.id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('イベント取得エラー:', error);
      alert('イベント情報の取得に失敗しました');
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/events/${eventId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('本当にこのイベントを削除しますか？')) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      alert('イベントを削除しました');
      router.push('/events');
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const handleApplications = () => {
    router.push(`/events/${eventId}/applications`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-orange-50">
        <Card className="max-w-md bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">イベントが見つかりません</p>
            <Button onClick={() => router.push('/events')} className="h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 transition-colors">
              イベント一覧に戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.push('/events')}
              className="h-9 bg-white border border-gray-300 hover:bg-orange-50 text-gray-700 text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleEdit}
                className="h-9 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors"
              >
                <Edit className="h-4 w-4" />
                編集
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 bg-white border border-red-500 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
                削除
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Main Image */}
        {event.main_image_url && (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
            <img
              src={event.main_image_url}
              alt={event.event_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Event Info */}
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {event.event_name}
              </h1>
              <StatusBadge
                status={event.approval_status === 'approved' ? 'approved' : 'pending'}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">開催期間</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(event.event_start_date)} - {formatDate(event.event_end_date)}
                  </p>
                </div>
              </div>

              {event.display_period && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">時間</p>
                    <p className="font-medium text-gray-900">{event.display_period}</p>
                  </div>
                </div>
              )}

              {event.event_time && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">詳細時間</p>
                    <p className="font-medium text-gray-900">{event.event_time}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-1">会場</p>
                  <p className="font-medium text-gray-900">{event.venue_name}</p>
                </div>
              </div>

              {(event.prefecture || event.city || event.address) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">住所</p>
                    <p className="font-medium text-gray-900">
                      {event.prefecture}
                      {event.city}
                      {event.address}
                    </p>
                  </div>
                </div>
              )}

              {event.genre && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">ジャンル</p>
                    <p className="font-medium text-gray-900">{event.genre}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lead Text */}
        {event.lead_text && (
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">概要</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.lead_text}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {event.event_description && (
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">詳細</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.event_description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Applications Button */}
        <Button
          onClick={handleApplications}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Users className="h-5 w-5" />
          申し込み管理
        </Button>
      </main>
    </div>
  );
}
