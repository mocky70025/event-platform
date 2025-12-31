'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
        }}>
          イベント管理
        </h2>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === f ? '#3B82F6' : '#f0f0f0',
                color: filter === f ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {f === 'all' ? 'すべて' : f === 'pending' ? '承認待ち' : '承認済み'}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: '16px',
      }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '12px',
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}>
                  {event.event_name}
                </h3>
                {event.organizer && (
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                  }}>
                    主催者: {event.organizer.name} ({event.organizer.organization_name})
                  </div>
                )}
              </div>
              <span style={{
                padding: '4px 12px',
                backgroundColor: event.approval_status === 'approved' ? '#10B981' : '#F59E0B',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                {event.approval_status === 'approved' ? '承認済み' : '承認待ち'}
              </span>
            </div>

            <div style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '12px',
            }}>
              <div>📅 {new Date(event.event_start_date).toLocaleDateString('ja-JP')} - {new Date(event.event_end_date).toLocaleDateString('ja-JP')}</div>
              <div>📍 {event.venue_name}</div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
                作成日: {new Date(event.created_at).toLocaleDateString('ja-JP')}
              </div>
            </div>

            {event.approval_status !== 'approved' && (
              <button
                onClick={() => handleApprove(event.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                承認
              </button>
            )}
          </div>
        ))}

        {events.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
          }}>
            イベントが見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
}

