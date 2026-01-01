'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  AlertCircle,
  X,
  FileCheck,
  BarChart3
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
  event_description: string | null;
}

export default function EventManagement() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeEvents: 0,
    pendingApplications: 0,
    monthlyApplications: 0,
    approvalRate: 0
  });
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: organizerData } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!organizerData) return;

      // アクティブなイベント数
      const { count: activeCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', organizerData.id)
        .eq('approval_status', 'approved');

      // 保留中の申し込み
      const { count: pendingCount } = await supabase
        .from('event_applications')
        .select('*, events!inner(*)', { count: 'exact', head: true })
        .eq('events.organizer_id', organizerData.id)
        .eq('application_status', 'pending');

      // 今月の申し込み
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: monthlyCount } = await supabase
        .from('event_applications')
        .select('*, events!inner(*)', { count: 'exact', head: true })
        .eq('events.organizer_id', organizerData.id)
        .gte('created_at', startOfMonth);

      setStats({
        activeEvents: activeCount || 0,
        pendingApplications: pendingCount || 0,
        monthlyApplications: monthlyCount || 0,
        approvalRate: 85
      });

      // アラート生成
      if (pendingCount && pendingCount > 0) {
        setAlerts([{
          id: '1',
          type: 'info',
          title: '新規申し込み',
          message: `${pendingCount}件の新規申し込みがあります`,
          action: {
            label: '今すぐ審査',
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
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      // 主催者IDを取得
      const { data: organizerData, error: organizerError } = await supabase
        .from('organizers')
        .select('id, is_approved')
        .eq('user_id', user.id)
        .single();

      if (organizerError) throw organizerError;
      setOrganizerId(organizerData.id);

      // イベント一覧を取得
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('イベント取得エラー:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="animate-pulse text-[#E58A7B] font-medium">読み込み中...</div>
      </div>
    );
  }

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ダッシュボード
          </h1>
          <p className="text-gray-600">
            イベント管理と出店者審査を効率的に
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+1</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.activeEvents}
              </div>
              <div className="text-sm text-gray-600">
                開催中のイベント
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                {stats.pendingApplications > 0 && (
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    要対応
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.pendingApplications}
              </div>
              <div className="text-sm text-gray-600">
                申込承認待ち
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.monthlyApplications}
              </div>
              <div className="text-sm text-gray-600">
                今月の応募数
              </div>
              <div className="text-xs text-gray-500 mt-2">
                先月比
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.approvalRate}%
              </div>
              <div className="text-sm text-gray-600">
                承認率
              </div>
            </CardContent>
          </Card>
        </div>

        {/* アラート */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-8">
            {alerts.map((alert) => {
              const colorMap = {
                info: {
                  bg: 'bg-blue-50',
                  border: 'border-blue-200',
                  icon: 'text-blue-600',
                  button: 'bg-blue-600 hover:bg-blue-700'
                },
                warning: {
                  bg: 'bg-orange-50',
                  border: 'border-orange-200',
                  icon: 'text-orange-600',
                  button: 'bg-orange-600 hover:bg-orange-700'
                }
              };
              
              const colors = colorMap[alert.type as keyof typeof colorMap] || colorMap.info;
              
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-xl border-2 flex items-center gap-4",
                    colors.bg,
                    colors.border
                  )}
                >
                  <AlertCircle className={cn("w-5 h-5", colors.icon)} />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{alert.title}</h3>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                  {alert.action && (
                    <Button
                      onClick={alert.action.onClick}
                      className={cn("text-white shadow-sm", colors.button)}
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

        {/* イベント管理セクション */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              イベント管理
            </h2>
            <Button 
              onClick={() => router.push('/events/new')}
              className="bg-[#E58A7B] hover:bg-[#D87564] flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              新しいイベントを作成
            </Button>
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  イベントがありません
                </h3>
                <p className="text-gray-600 mb-6">
                  最初のイベントを作成してみましょう
                </p>
                <Button
                  onClick={() => router.push('/events/new')}
                  className="bg-[#E58A7B] hover:bg-[#D87564]"
                >
                  イベントを作成
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <EventCard
                  key={event.id}
                  title={event.event_name}
                  date={formatDateRange(event.event_start_date, event.event_end_date)}
                  location={event.venue_name}
                  capacity={event.recruitment_count || undefined}
                  image={event.main_image_url || undefined}
                  status={event.approval_status as any}
                  accent="organizer"
                  onClick={() => router.push(`/events/${event.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => router.push('/events/new')}
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mb-4 group-hover:shadow-lg transition-shadow">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">新規イベント作成</h3>
            <p className="text-sm text-gray-600">新しいイベントを登録</p>
          </button>

          <button 
            onClick={() => router.push('/applications')}
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white mb-4 group-hover:shadow-lg transition-shadow">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">申し込み一括審査</h3>
            <p className="text-sm text-gray-600">保留中の申し込みを審査</p>
          </button>

          <button 
            onClick={() => console.log('Analytics')}
            className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white mb-4 group-hover:shadow-lg transition-shadow">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">統計レポート</h3>
            <p className="text-sm text-gray-600">詳細な分析を確認</p>
          </button>
        </div>
      </main>
    </div>
  );
}
