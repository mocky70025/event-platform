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
  venue_town?: string;
  main_image_url?: string;
  lead_text?: string;
  genre?: string;
  application_start_date?: string;
  application_end_date?: string;
}

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchPrefecture, setSearchPrefecture] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchGenre, setSearchGenre] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchKeyword, searchStartDate, searchEndDate, searchPrefecture, searchCity, searchGenre]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('events')
        .select('*')
        .gte('application_end_date', today)
        .order('event_start_date', { ascending: true });

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(err.message || 'イベントの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (searchKeyword) {
      filtered = filtered.filter(event =>
        event.event_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        event.lead_text?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (searchStartDate) {
      filtered = filtered.filter(event =>
        event.event_start_date >= searchStartDate
      );
    }

    if (searchEndDate) {
      filtered = filtered.filter(event =>
        event.event_end_date <= searchEndDate
      );
    }

    if (searchPrefecture) {
      filtered = filtered.filter(event =>
        event.venue_city?.includes(searchPrefecture)
      );
    }

    if (searchCity) {
      filtered = filtered.filter(event =>
        event.venue_town?.includes(searchCity) ||
        event.venue_city?.includes(searchCity)
      );
    }

    if (searchGenre) {
      filtered = filtered.filter(event =>
        event.genre?.includes(searchGenre)
      );
    }

    setFilteredEvents(filtered);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleApply = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('ログインが必要です');
        return;
      }

      // 出店者情報を取得
      const { data: exhibitor } = await supabase
        .from('exhibitors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!exhibitor) {
        alert('出店者情報が登録されていません');
        return;
      }

      // 申し込みを作成
      const { error } = await supabase
        .from('event_applications')
        .insert({
          exhibitor_id: exhibitor.id,
          event_id: eventId,
          application_status: 'pending',
        });

      if (error) throw error;

      alert('申し込みが完了しました');
      setSelectedEvent(null);
      loadEvents();
    } catch (err: any) {
      alert(err.message || '申し込みに失敗しました');
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
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
      }}>
        <button
          onClick={() => setSelectedEvent(null)}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← 戻る
        </button>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          {selectedEvent.main_image_url && (
            <img
              src={selectedEvent.main_image_url}
              alt={selectedEvent.event_name}
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            />
          )}

          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
          }}>
            {selectedEvent.event_name}
          </h1>

          <div style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '20px',
            lineHeight: '1.6',
          }}>
            <div style={{ marginBottom: '8px' }}>
              📅 {new Date(selectedEvent.event_start_date).toLocaleDateString('ja-JP')} - {new Date(selectedEvent.event_end_date).toLocaleDateString('ja-JP')}
            </div>
            <div style={{ marginBottom: '8px' }}>
              📍 {selectedEvent.venue_name}
              {selectedEvent.venue_city && ` (${selectedEvent.venue_city})`}
            </div>
            {selectedEvent.genre && (
              <div style={{ marginBottom: '8px' }}>
                🏷️ {selectedEvent.genre}
              </div>
            )}
          </div>

          {selectedEvent.lead_text && (
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
            }}>
              {selectedEvent.lead_text}
            </div>
          )}

          <button
            onClick={() => handleApply(selectedEvent.id)}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#5DABA8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            このイベントに申し込む
          </button>
        </div>
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
          marginBottom: '16px',
        }}>
          イベント検索
        </h1>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <input
            type="text"
            placeholder="キーワード検索"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}>
            <input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <input
            type="text"
            placeholder="都道府県"
            value={searchPrefecture}
            onChange={(e) => setSearchPrefecture(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />

          <input
            type="text"
            placeholder="市区町村"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />

          <input
            type="text"
            placeholder="ジャンル"
            value={searchGenre}
            onChange={(e) => setSearchGenre(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
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

        {filteredEvents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>🔍</div>
            <div style={{
              fontSize: '16px',
            }}>
              条件に一致するイベントが見つかりませんでした
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px',
          }}>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

