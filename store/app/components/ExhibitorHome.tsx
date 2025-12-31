'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import EventCard from './EventCard';
import LoadingSpinner from './LoadingSpinner';

interface Event {
  id: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  venue_city?: string;
  main_image_url?: string;
  lead_text?: string;
  application_start_date?: string;
  application_end_date?: string;
}

export default function ExhibitorHome() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // 承認済みで、申し込み期間内のイベントを取得
      let query = supabase
        .from('events')
        .select('*')
        .or(`approval_status.eq.approved,approval_status.is.null`)
        .gte('application_end_date', today)
        .order('event_start_date', { ascending: true });

      const { data, error: queryError } = await query;

      if (queryError) {
        // approval_statusカラムが存在しない場合のエラーハンドリング
        if (queryError.code === 'PGRST116' || queryError.message.includes('column')) {
          // approval_statusカラムがない場合は、すべてのイベントを取得
          const { data: allData, error: allError } = await supabase
            .from('events')
            .select('*')
            .gte('application_end_date', today)
            .order('event_start_date', { ascending: true });

          if (allError) throw allError;
          setEvents(allData || []);
        } else {
          throw queryError;
        }
      } else {
        setEvents(data || []);
      }
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(err.message || 'イベントの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId: string) => {
    window.location.href = `/event/${eventId}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '8px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
        <button
          onClick={loadEvents}
          style={{
            padding: '12px 24px',
            backgroundColor: '#5DABA8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      paddingBottom: '80px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
        }}>
          マイイベント
        </h1>
      </div>

      <div style={{
        padding: '20px',
      }}>
        {events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>📅</div>
            <div style={{
              fontSize: '16px',
            }}>
              現在、申し込み可能なイベントはありません
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px',
          }}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

