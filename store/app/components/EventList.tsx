'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

interface Event {
  id: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  venue_address: string;
  main_image_url: string | null;
  approval_status: string;
  recruitment_count: number | null;
  genre_category: string | null;
}

interface SearchFilters {
  keyword: string;
  startDate: string;
  endDate: string;
  prefecture: string;
  city: string;
  genre: string;
}

export default function EventList() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    startDate: '',
    endDate: '',
    prefecture: '',
    city: '',
    genre: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('approval_status', 'approved')
        .order('event_start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error) {
      console.error('イベント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // キーワード検索
    if (filters.keyword) {
      filtered = filtered.filter(
        (event) =>
          event.event_name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          event.venue_name.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    // 開始日フィルター
    if (filters.startDate) {
      filtered = filtered.filter(
        (event) => new Date(event.event_start_date) >= new Date(filters.startDate)
      );
    }

    // 終了日フィルター
    if (filters.endDate) {
      filtered = filtered.filter(
        (event) => new Date(event.event_end_date) <= new Date(filters.endDate)
      );
    }

    // 都道府県フィルター
    if (filters.prefecture) {
      filtered = filtered.filter((event) =>
        event.venue_address?.includes(filters.prefecture)
      );
    }

    // 市区町村フィルター
    if (filters.city) {
      filtered = filtered.filter((event) =>
        event.venue_address?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // ジャンルフィルター
    if (filters.genre) {
      filtered = filtered.filter((event) =>
        event.genre_category?.toLowerCase().includes(filters.genre.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      startDate: '',
      endDate: '',
      prefecture: '',
      city: '',
      genre: '',
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = `${startDate.getMonth() + 1}/${startDate.getDate()}`;
    const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
    return `${startStr} - ${endStr}`;
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 検索ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 mb-4">イベント検索</h1>

          {/* 検索フォーム */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              {/* キーワード検索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="イベント名、会場名で検索"
                  value={filters.keyword}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, keyword: e.target.value }))
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
              </div>

              {/* 日付範囲 */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
              </div>

              {/* 都道府県・市区町村 */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="都道府県"
                  value={filters.prefecture}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, prefecture: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="市区町村"
                  value={filters.city}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
              </div>

              {/* ジャンル */}
              <input
                type="text"
                placeholder="ジャンル"
                value={filters.genre}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, genre: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
              />

              {/* フィルタークリア */}
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  フィルターをクリア
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 結果件数 */}
          <p className="mt-3 text-sm text-gray-600">
            {filteredEvents.length}件のイベントが見つかりました
          </p>
        </div>
      </header>

      {/* イベント一覧 */}
      <main className="px-4 py-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">条件に一致するイベントが見つかりませんでした</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                title={event.event_name}
                date={formatDateRange(event.event_start_date, event.event_end_date)}
                location={event.venue_name}
                capacity={event.recruitment_count || undefined}
                image={event.main_image_url || undefined}
                status={event.approval_status as any}
                accent="store"
                onClick={() => router.push(`/events/${event.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
