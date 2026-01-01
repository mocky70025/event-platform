'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  X, 
  SlidersHorizontal,
  MapPin,
  Calendar as CalendarIcon,
  Tag,
  Grid3x3,
  List,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState('date');
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
        <div className="animate-pulse text-[#5DABA8] font-medium">読み込み中...</div>
      </div>
    );
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* 検索バー */}
          <div className="flex gap-3 items-center mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="イベント名、場所、キーワードで検索..."
                value={filters.keyword}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, keyword: e.target.value }))
                }
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5DABA8] focus:border-transparent transition-all outline-none text-base"
              />
            </div>
            
            {/* フィルターボタン */}
            <Button
              variant="outline"
              className="flex items-center gap-2 border-2 px-4 py-3 h-auto"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden md:inline">フィルター</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#5DABA8] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
          
          {/* フィルターチップ・ソート・ビュー切替 */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* フィルターチップ */}
            <div className="flex gap-2 flex-wrap items-center">
              <button 
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 hover:border-[#5DABA8] rounded-lg transition-all text-sm font-medium"
              >
                <MapPin className="w-4 h-4" />
                <span>場所</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 hover:border-[#5DABA8] rounded-lg transition-all text-sm font-medium"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>日付</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 hover:border-[#5DABA8] rounded-lg transition-all text-sm font-medium"
              >
                <Tag className="w-4 h-4" />
                <span>ジャンル</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {/* ソート・ビュー切替 */}
            <div className="flex gap-2 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DABA8] focus:border-transparent outline-none text-sm font-medium"
              >
                <option value="date">開催日が近い順</option>
                <option value="date-desc">開催日が遠い順</option>
                <option value="popular">人気順</option>
              </select>
              
              <div className="flex bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'grid'
                      ? "bg-[#5DABA8] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'list'
                      ? "bg-[#5DABA8] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* アクティブフィルター */}
      {activeFiltersCount > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-gray-600 font-medium">
                フィルター:
              </span>
              {filters.prefecture && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F0F9F9] text-[#5DABA8] rounded-full text-sm font-semibold">
                  📍 {filters.prefecture}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, prefecture: '' }))}
                    className="hover:bg-[#5DABA8] hover:text-white rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {filters.genre && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F0F9F9] text-[#5DABA8] rounded-full text-sm font-semibold">
                  🏷️ {filters.genre}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, genre: '' }))}
                    className="hover:bg-[#5DABA8] hover:text-white rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-[#5DABA8] font-medium transition-colors ml-2"
              >
                すべてクリア
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* フィルターパネル */}
      {showFilterPanel && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-xl md:rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">フィルター</h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* 日付範囲 */}
              <div>
                <h3 className="font-semibold mb-3">開催日</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DABA8]"
                  />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DABA8]"
                  />
                </div>
              </div>
              
              {/* 場所 */}
              <div>
                <h3 className="font-semibold mb-3">場所</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="都道府県"
                    value={filters.prefecture}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, prefecture: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DABA8]"
                  />
                  <input
                    type="text"
                    placeholder="市区町村"
                    value={filters.city}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DABA8]"
                  />
                </div>
              </div>
              
              {/* ジャンル */}
              <div>
                <h3 className="font-semibold mb-3">ジャンル</h3>
                <input
                  type="text"
                  placeholder="ジャンル"
                  value={filters.genre}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, genre: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DABA8]"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearFilters}
              >
                クリア
              </Button>
              <Button
                className="flex-1 bg-[#5DABA8] hover:bg-[#4A9693]"
                onClick={() => setShowFilterPanel(false)}
              >
                適用
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 検索結果数 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            検索結果: {filteredEvents.length}件のイベント
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            あなたにぴったりのイベントを見つけましょう
          </p>
        </div>
        
        {/* イベント一覧 */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              イベントが見つかりませんでした
            </h3>
            <p className="text-gray-600 mb-6">
              検索条件を変更してみてください
            </p>
            <Button
              onClick={clearFilters}
              className="bg-[#5DABA8] hover:bg-[#4A9693]"
            >
              フィルターをクリア
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "mb-8",
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
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
