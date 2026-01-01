'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Calendar, MapPin, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  event_name: string;
  organizer_id: string;
  organizer?: {
    name: string;
    organization_name: string;
  };
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  approval_status?: string;
  created_at: string;
}

interface EventManagementProps {
  onUpdate: () => void;
}

export default function EventManagement({ onUpdate }: EventManagementProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:organizers (
            name,
            organization_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.or('approval_status.is.null,approval_status.neq.approved');
      } else if (filter === 'approved') {
        query = query.eq('approval_status', 'approved');
      }

      const { data, error } = await query;
      if (error) throw error;

      setEvents(data || []);
    } catch (error: any) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from('events')
        .update({ approval_status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      loadEvents();
      onUpdate();
    } catch (error: any) {
      alert('承認に失敗しました: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('このイベントを却下しますか？')) return;

    setProcessing(id);
    try {
      const { error } = await supabase
        .from('events')
        .update({ approval_status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      loadEvents();
      onUpdate();
    } catch (error: any) {
      alert('却下に失敗しました: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = `${startDate.getMonth() + 1}/${startDate.getDate()}`;
    const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
    return `${startStr} - ${endStr}`;
  };

  const statusCounts = {
    all: events.length,
    pending: events.filter(e => !e.approval_status || e.approval_status !== 'approved').length,
    approved: events.filter(e => e.approval_status === 'approved').length,
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => {
        if (filter === 'pending') {
          return !e.approval_status || e.approval_status !== 'approved';
        }
        return e.approval_status === 'approved';
      });

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse text-[#3B82F6] font-medium">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.all}</p>
            <p className="text-sm text-gray-600">総イベント数</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-orange-600 mb-1">{statusCounts.pending}</p>
            <p className="text-sm text-gray-600">承認待ち</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">{statusCounts.approved}</p>
            <p className="text-sm text-gray-600">承認済み</p>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <div className="flex gap-3">
        {[
          { value: 'all', label: 'すべて', count: statusCounts.all },
          { value: 'pending', label: '承認待ち', count: statusCounts.pending },
          { value: 'approved', label: '承認済み', count: statusCounts.approved },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value as typeof filter)}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all shadow-sm',
              filter === btn.value
                ? 'bg-[#3B82F6] text-white shadow-md scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            )}
          >
            {btn.label}
            <span className={cn(
              'ml-2 px-2 py-0.5 rounded-full text-xs font-bold',
              filter === btn.value
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
            )}>
              {btn.count}
            </span>
          </button>
        ))}
      </div>

      {/* イベント一覧 */}
      {filteredEvents.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Calendar className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              イベントがありません
            </h3>
            <p className="text-gray-600">
              {filter === 'pending' ? '承認待ちのイベントはありません' : filter === 'approved' ? '承認済みのイベントはありません' : 'イベントが登録されていません'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const isApproved = event.approval_status === 'approved';
            return (
              <Card key={event.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.event_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        登録日: {formatDate(event.created_at)}
                      </p>
                    </div>
                    <div className={cn(
                      'px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2',
                      isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    )}>
                      {isApproved ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          承認済み
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          承認待ち
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">開催期間</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatDateRange(event.event_start_date, event.event_end_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">会場</p>
                        <p className="font-semibold text-gray-900 text-sm">{event.venue_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                      <Building2 className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">主催者</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {event.organizer?.organization_name || '不明'} ({event.organizer?.name || '不明'})
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    {!isApproved ? (
                      <>
                        <Button
                          onClick={() => handleApprove(event.id)}
                          disabled={processing === event.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold shadow-md"
                        >
                          {processing === event.id ? '処理中...' : '✓ 承認する'}
                        </Button>
                        <Button
                          onClick={() => handleReject(event.id)}
                          disabled={processing === event.id}
                          variant="outline"
                          className="flex-1 h-12 text-base font-semibold text-red-600 border-2 border-red-600 hover:bg-red-50 shadow-md"
                        >
                          {processing === event.id ? '処理中...' : '✕ 却下する'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleReject(event.id)}
                        disabled={processing === event.id}
                        variant="outline"
                        className="flex-1 h-12 text-base font-semibold text-orange-600 border-2 border-orange-600 hover:bg-orange-50 shadow-md"
                      >
                        {processing === event.id ? '処理中...' : '承認を取り消す'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
