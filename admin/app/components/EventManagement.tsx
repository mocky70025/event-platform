'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Calendar, MapPin, Building2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">イベント管理</h2>
        <p className="text-sm text-gray-600">イベントの承認と管理を行います</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.all}</p>
            <p className="text-sm text-gray-600">総イベント数</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-amber-600 mb-1">{statusCounts.pending}</p>
            <p className="text-sm text-gray-600">承認待ち</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-emerald-600 mb-1">{statusCounts.approved}</p>
            <p className="text-sm text-gray-600">承認済み</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          すべて ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'pending'
              ? 'bg-indigo-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          承認待ち ({statusCounts.pending})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'approved'
              ? 'bg-indigo-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          承認済み ({statusCounts.approved})
        </button>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              イベントがありません
            </h3>
            <p className="text-sm text-gray-600">
              {filter === 'pending' ? '承認待ちのイベントはありません' : filter === 'approved' ? '承認済みのイベントはありません' : 'イベントが登録されていません'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const isApproved = event.approval_status === 'approved';
            return (
              <Card key={event.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {event.event_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        登録日: {formatDate(event.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={isApproved ? 'approved' : 'pending'} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">開催期間</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {formatDateRange(event.event_start_date, event.event_end_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">会場</p>
                        <p className="font-medium text-gray-900 text-sm">{event.venue_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                      <Building2 className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">主催者</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {event.organizer?.organization_name || '不明'} ({event.organizer?.name || '不明'})
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {!isApproved ? (
                      <>
                        <Button
                          onClick={() => handleApprove(event.id)}
                          disabled={processing === event.id}
                          className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === event.id ? '処理中...' : '承認する'}
                        </Button>
                        <Button
                          onClick={() => handleReject(event.id)}
                          disabled={processing === event.id}
                          className="flex-1 h-10 bg-white border border-red-500 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === event.id ? '処理中...' : '却下する'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleReject(event.id)}
                        disabled={processing === event.id}
                        className="flex-1 h-10 bg-white border border-amber-500 hover:bg-amber-50 text-amber-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
