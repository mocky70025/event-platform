'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { StatusBadge } from '@/components/status-badge';
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
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          イベント管理
        </h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {f === 'all' ? 'すべて' : f === 'pending' ? '承認待ち' : '承認済み'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    {event.event_name}
                  </h3>
                  {event.organizer && (
                    <div className="text-sm text-gray-600">
                      主催者: {event.organizer.name} ({event.organizer.organization_name})
                    </div>
                  )}
                </div>
                <StatusBadge
                  status={event.approval_status === 'approved' ? 'approved' : 'pending'}
                />
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <div>📅 {new Date(event.event_start_date).toLocaleDateString('ja-JP')} - {new Date(event.event_end_date).toLocaleDateString('ja-JP')}</div>
                <div>📍 {event.venue_name}</div>
                <div className="mt-1 text-xs text-gray-400">
                  作成日: {new Date(event.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>

              {event.approval_status !== 'approved' && (
                <Button
                  onClick={() => handleApprove(event.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  承認
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {events.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            イベントが見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
}
