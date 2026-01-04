'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  FileCheck,
  BarChart3
} from 'lucide-react';

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
  const [stats, setStats] = useState({
    activeEvents: 0,
    pendingApplications: 0,
    monthlyApplications: 0,
    approvalRate: 0
  });

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

      const { count: activeCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', organizerData.id)
        .eq('approval_status', 'approved');

      const { count: pendingCount } = await supabase
        .from('event_applications')
        .select('*, events!inner(*)', { count: 'exact', head: true })
        .eq('events.organizer_id', organizerData.id)
        .eq('application_status', 'pending');

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
    } catch (error) {
      console.error('統計取得エラー:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: organizerData } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!organizerData) return;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerData.id)
        .order('event_start_date', { ascending: false })
        .limit(6);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('イベント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              イベント管理
            </h1>
            <p className="text-sm text-gray-600">
              イベントの作成と応募者管理
            </p>
          </div>
          <Button
            onClick={() => router.push('/event/new')}
            className="h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新規作成
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">開催中イベント</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeEvents}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">現在募集中のイベント</p>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">承認待ち</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">審査待ちの申し込み</p>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">総応募数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.monthlyApplications}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-sky-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">今月の申し込み件数</p>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">承認率</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approvalRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">申し込みの承認率</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/event/new')}
              className="h-auto py-5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-700 rounded-xl flex flex-col items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">イベント作成</span>
            </Button>
            <Button
              onClick={() => router.push('/applications')}
              className="h-auto py-5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-700 rounded-xl flex flex-col items-center gap-2 transition-colors"
            >
              <FileCheck className="w-5 h-5" />
              <span className="text-sm font-medium">応募者管理</span>
            </Button>
            <Button
              onClick={() => router.push('/analytics')}
              className="h-auto py-5 bg-white border border-gray-200 hover:bg-orange-50 text-gray-700 rounded-xl flex flex-col items-center gap-2 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">統計</span>
            </Button>
          </div>
        </div>

        {/* Event List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">作成したイベント</h2>
          {events.length === 0 ? (
            <Card className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">まだイベントがありません</p>
              <Button
                onClick={() => router.push('/event/new')}
                className="h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
              >
                最初のイベントを作成
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow cursor-pointer"
                  onClick={() => router.push(`/event/${event.id}`)}
                >
                  <div className="flex items-start gap-4">
                    {event.main_image_url ? (
                      <img
                        src={event.main_image_url}
                        alt={event.event_name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {event.event_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(event.event_start_date).toLocaleDateString('ja-JP')}
                        {' - '}
                        {new Date(event.event_end_date).toLocaleDateString('ja-JP')}
                      </p>
                      <p className="text-sm text-gray-600">{event.venue_name}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}