'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { ArrowLeft, Edit, Trash2, Users } from 'lucide-react';
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

      // 主催者IDを取得
      const { data: organizerData, error: organizerError } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (organizerError) throw organizerError;

      // イベントを取得
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
      <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">イベントが見つかりません</p>
            <Button onClick={() => router.push('/events')} className="bg-organizer hover:bg-organizer-dark">
              イベント一覧に戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Button
              onClick={() => router.push('/events')}
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleEdit}
                size="sm"
                className="bg-organizer hover:bg-organizer-dark"
              >
                <Edit className="h-4 w-4 mr-2" />
                編集
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* メイン画像 */}
        {event.main_image_url && (
          <div className="w-full h-80 rounded-lg overflow-hidden">
            <img
              src={event.main_image_url}
              alt={event.event_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* イベント情報 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {event.event_name}
              </h1>
              <StatusBadge
                status={event.approval_status === 'approved' ? 'approved' : 'pending'}
              />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <span className="text-gray-600 min-w-24">開催期間</span>
                <span className="font-medium">
                  {formatDate(event.event_start_date)} - {formatDate(event.event_end_date)}
                </span>
              </div>

              {event.display_period && (
                <div className="flex items-start">
                  <span className="text-gray-600 min-w-24">時間</span>
                  <span className="font-medium">{event.display_period}</span>
                </div>
              )}

              {event.event_time && (
                <div className="flex items-start">
                  <span className="text-gray-600 min-w-24">詳細時間</span>
                  <span className="font-medium">{event.event_time}</span>
                </div>
              )}

              <div className="flex items-start">
                <span className="text-gray-600 min-w-24">会場</span>
                <span className="font-medium">{event.venue_name}</span>
              </div>

              {(event.prefecture || event.city || event.address) && (
                <div className="flex items-start">
                  <span className="text-gray-600 min-w-24">住所</span>
                  <span className="font-medium">
                    {event.prefecture}
                    {event.city}
                    {event.address}
                  </span>
                </div>
              )}

              {event.genre && (
                <div className="flex items-start">
                  <span className="text-gray-600 min-w-24">ジャンル</span>
                  <span className="font-medium">{event.genre}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* リードテキスト */}
        {event.lead_text && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold mb-3">概要</h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded leading-relaxed whitespace-pre-wrap">
                {event.lead_text}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 説明文 */}
        {event.event_description && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-bold mb-3">詳細</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.event_description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 申し込み管理ボタン */}
        <Button
          onClick={handleApplications}
          className="w-full bg-organizer hover:bg-organizer-dark py-6"
        >
          <Users className="h-5 w-5 mr-2" />
          申し込み管理
        </Button>
      </main>
    </div>
  );
}
