'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bell, 
  History, 
  Search as SearchIcon, 
  User,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Send,
  AlertCircle,
  X,
  ChevronRight,
  FileCheck,
  Settings,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  venue_name: string;
  main_image_url: string | null;
  approval_status: string;
  recruitment_count: number | null;
}

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function ExhibitorHome() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    monthlyEvents: 0
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetchUserData();
    fetchEvents();
    fetchUnreadNotifications();
    fetchApplicationStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('exhibitors')
        .select('representative_name')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUserName(data.representative_name || 'ユーザー');
      }
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error);
    }
  };

  const fetchApplicationStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 保留中の申し込み
      const { count: pendingCount } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', user.id)
        .eq('application_status', 'pending');

      // 承認済みの申し込み
      const { count: approvedCount } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', user.id)
        .eq('application_status', 'approved');

      setStats({
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        monthlyEvents: approvedCount || 0
      });

      // アラート生成
      if (approvedCount && approvedCount > 0) {
        setAlerts([{
          id: '1',
          type: 'success',
          title: '承認完了',
          message: `${approvedCount}件のイベント出店が承認されました！`,
          action: {
            label: '詳細を見る',
            onClick: () => router.push('/applications')
          }
        }]);
      }
    } catch (error) {
      console.error('統計取得エラー:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('approval_status', 'approved')
        .order('event_start_date', { ascending: true })
        .limit(6);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('イベント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('通知取得エラー:', error);
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = `${startDate.getMonth() + 1}/${startDate.getDate()}`;
    const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
    return `${startStr} - ${endStr}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-[#5DABA8] font-medium">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="text-sm text-gray-500 mt-1">すべての情報をひとつに</p>
          </div>
          <button 
            onClick={() => router.push('/notifications')}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-6">
        {/* ウェルカムメッセージ */}
        <div className="mb-6 p-6 bg-gradient-to-br from-[#F0F9F9] via-white to-[#F0F9F9] rounded-xl border border-[#D1EFED]">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            こんにちは、{userName}さん！👋
          </h2>
          <p className="text-gray-600">
            今日も素敵なイベントと出会いましょう
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/applications?status=pending')}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
                  <Send className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.pending}
              </div>
              <div className="text-xs text-gray-600">
                応募中
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/applications?status=approved')}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.approved}
              </div>
              <div className="text-xs text-gray-600">
                承認済み
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.monthlyEvents}
              </div>
              <div className="text-xs text-gray-600">
                今月の出店
              </div>
            </CardContent>
          </Card>
        </div>

        {/* アラート */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-6">
            {alerts.map((alert) => {
              const colorMap = {
                success: {
                  bg: 'bg-green-50',
                  border: 'border-green-200',
                  icon: 'text-green-600',
                  button: 'bg-green-600 hover:bg-green-700'
                },
                warning: {
                  bg: 'bg-orange-50',
                  border: 'border-orange-200',
                  icon: 'text-orange-600',
                  button: 'bg-orange-600 hover:bg-orange-700'
                },
                info: {
                  bg: 'bg-blue-50',
                  border: 'border-blue-200',
                  icon: 'text-blue-600',
                  button: 'bg-blue-600 hover:bg-blue-700'
                },
                error: {
                  bg: 'bg-red-50',
                  border: 'border-red-200',
                  icon: 'text-red-600',
                  button: 'bg-red-600 hover:bg-red-700'
                }
              };
              
              const colors = colorMap[alert.type];
              
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-xl border-2 animate-slide-down flex items-start gap-3",
                    colors.bg,
                    colors.border
                  )}
                >
                  <AlertCircle className={cn("w-5 h-5 flex-shrink-0", colors.icon)} />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{alert.title}</h3>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                  {alert.action && (
                    <Button
                      onClick={alert.action.onClick}
                      className={cn("text-white shadow-sm text-sm", colors.button)}
                      size="sm"
                    >
                      {alert.action.label}
                    </Button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 rounded hover:bg-black/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* おすすめイベント */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">おすすめイベント</h2>
              <p className="text-sm text-gray-600 mt-1">
                あなたにぴったりのイベント
              </p>
            </div>
            <button 
              onClick={() => router.push('/events')}
              className="text-sm font-medium text-[#5DABA8] hover:text-[#4A9693] transition-colors flex items-center gap-1"
            >
              すべて見る
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">現在、申し込み可能なイベントはありません</p>
                <Button 
                  onClick={() => router.push('/events')}
                  className="bg-[#5DABA8] hover:bg-[#4A9693]"
                >
                  イベントを探す
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 3).map((event) => (
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
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => router.push('/events')}
            className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center gap-3 group"
          >
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white group-hover:shadow-lg transition-shadow">
              <SearchIcon className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-900 text-sm">イベント検索</span>
          </button>

          <button 
            onClick={() => router.push('/profile')}
            className="p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center gap-3 group"
          >
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl text-white group-hover:shadow-lg transition-shadow">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-900 text-sm">書類管理</span>
          </button>
        </div>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-lg">
        <div className="flex items-center justify-around h-16">
          <button
            onClick={() => setActiveTab('home')}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors',
              activeTab === 'home' ? 'text-[#5DABA8]' : 'text-gray-500'
            )}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">ホーム</span>
          </button>

          <button
            onClick={() => router.push('/events')}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors',
              activeTab === 'search' ? 'text-[#5DABA8]' : 'text-gray-500'
            )}
          >
            <SearchIcon className="h-6 w-6" />
            <span className="text-xs mt-1">検索</span>
          </button>

          <button
            onClick={() => router.push('/applications')}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors',
              activeTab === 'history' ? 'text-[#5DABA8]' : 'text-gray-500'
            )}
          >
            <History className="h-6 w-6" />
            <span className="text-xs mt-1">申し込み</span>
          </button>

          <button
            onClick={() => router.push('/profile')}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors',
              activeTab === 'profile' ? 'text-[#5DABA8]' : 'text-gray-500'
            )}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">プロフィール</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
