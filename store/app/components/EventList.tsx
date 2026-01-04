'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  X, 
  SlidersHorizontal,
  Grid3x3,
  List,
  ChevronDown
} from 'lucide-react';

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

interface EventListProps {
  exhibitor?: any; // 型定義は厳密に行うべきですが、一旦anyで
  onNavigateToProfile?: () => void;
}

export default function EventList({ exhibitor, onNavigateToProfile }: EventListProps) {
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
  }, [events, filters, sortBy]);

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

    if (filters.keyword) {
      filtered = filtered.filter(
        (event) =>
          event.event_name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          event.venue_name.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (event) => new Date(event.event_start_date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (event) => new Date(event.event_end_date) <= new Date(filters.endDate)
      );
    }

    if (filters.prefecture) {
      filtered = filtered.filter((event) =>
        event.venue_address?.includes(filters.prefecture)
      );
    }

    if (filters.city) {
      filtered = filtered.filter((event) =>
        event.venue_address?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.genre) {
      filtered = filtered.filter((event) =>
        event.genre_category?.toLowerCase().includes(filters.genre.toLowerCase())
      );
    }

    // ソート
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.event_start_date).getTime() - new Date(b.event_start_date).getTime());
    } else if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.event_start_date).getTime() - new Date(a.event_start_date).getTime());
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

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">イベント検索</h1>
          
          {/* Search Bar */}
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
                className="w-full h-10 pl-12 pr-4 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
              />
            </div>
            
            <Button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="h-10 bg-white border border-gray-300 hover:bg-sky-50 text-gray-700 text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden md:inline">フィルター</span>
              {activeFiltersCount > 0 && (
                <span className="bg-sky-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
          
          {/* Sort & View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
              >
                <option value="date">開催日が近い順</option>
                <option value="date-desc">開催日が遠い順</option>
                <option value="popular">人気順</option>
              </select>
            </div>
            
            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-sky-500 text-white'
                    : 'text-gray-600 hover:bg-sky-50'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-sky-500 text-white'
                    : 'text-gray-600 hover:bg-sky-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-gray-600 font-medium">フィルター:</span>
              {filters.prefecture && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                  {filters.prefecture}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, prefecture: '' }))}
                    className="hover:bg-gray-200 rounded p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {filters.genre && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                  {filters.genre}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, genre: '' }))}
                    className="hover:bg-gray-200 rounded p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors ml-2"
              >
                すべてクリア
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">フィルター</h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開催日</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                  />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">場所</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="都道府県"
                    value={filters.prefecture}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, prefecture: e.target.value }))
                    }
                    className="h-10 px-3 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="市区町村"
                    value={filters.city}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="h-10 px-3 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ジャンル</label>
                <input
                  type="text"
                  placeholder="ジャンル"
                  value={filters.genre}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, genre: e.target.value }))
                  }
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={clearFilters}
                className="flex-1 h-10 bg-white border border-gray-300 hover:bg-sky-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                クリア
              </Button>
              <Button
                onClick={() => setShowFilterPanel(false)}
                className="flex-1 h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                適用
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            検索結果: {filteredEvents.length}件
          </h2>
        </div>
        
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              イベントが見つかりませんでした
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              検索条件を変更してみてください
            </p>
            <Button
              onClick={clearFilters}
              className="h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
            >
              フィルターをクリア
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
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
                onClick={() => {
                  router.push(`/events/${event.id}`);
                }}
                onApply={() => {
                  if (!exhibitor) {
                    alert('イベントへの申し込みには出店者情報の登録が必要です。\nプロフィール画面から登録を行ってください。');
                    onNavigateToProfile?.();
                    return;
                  }
                  // 申し込み処理はイベント詳細ページで行う
                  router.push(`/events/${event.id}`);
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
