'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import EventDetail from './EventDetail';
import LoadingSpinner from './LoadingSpinner';

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
      <div style={{ padding: '20px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (selectedEvent) {
    return <EventDetail eventId={selectedEvent.id} />;
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 'bold',
          }}>
            イベント管理
          </h1>
          <button
            onClick={onCreateEvent}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            + 新規作成
          </button>
        </div>
      </div>

      <div style={{
        padding: '20px',
      }}>
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

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
              marginBottom: '20px',
            }}>
              イベントがありません
            </div>
            <button
              onClick={onCreateEvent}
              style={{
                padding: '12px 24px',
                backgroundColor: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              最初のイベントを作成
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px',
          }}>
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {event.main_image_url && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundImage: `url(${event.main_image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }} />
                )}
                <div style={{ padding: '16px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#333',
                  }}>
                    {event.event_name}
                  </h3>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    📅 {new Date(event.event_start_date).toLocaleDateString('ja-JP')} - {new Date(event.event_end_date).toLocaleDateString('ja-JP')}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    📍 {event.venue_name}
                  </div>
                  {event.lead_text && (
                    <div style={{
                      fontSize: '14px',
                      color: '#999',
                      marginTop: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {event.lead_text}
                    </div>
                  )}
                  {event.approval_status && (
                    <div style={{
                      marginTop: '12px',
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        backgroundColor: event.approval_status === 'approved' ? '#27ae60' : '#f39c12',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}>
                        {event.approval_status === 'approved' ? '承認済み' : '審査中'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

