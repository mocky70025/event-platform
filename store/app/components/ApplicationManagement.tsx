'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { EventCard } from '@/components/event-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  event_id: string;
  application_status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  reviewed_at: string | null;
  events: {
    id: string;
    event_name: string;
    event_start_date: string;
    event_end_date: string;
    venue_name: string;
    main_image_url: string | null;
  };
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function ApplicationManagement() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      // まず出店者IDを取得
      const { data: exhibitorData, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (exhibitorError) throw exhibitorError;

      // 申し込み履歴を取得
      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          *,
          events (
            id,
            event_name,
            event_start_date,
            event_end_date,
            venue_name,
            main_image_url
          )
        `)
        .eq('exhibitor_id', exhibitorData.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('申し込み履歴取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startStr = `${startDate.getMonth() + 1}/${startDate.getDate()}`;
    const endStr = `${endDate.getMonth() + 1}/${endDate.getDate()}`;
    return `${startStr} - ${endStr}`;
  };

  const filteredApplications =
    filterStatus === 'all'
      ? applications
      : applications.filter((app) => app.application_status === filterStatus);

  const filterButtons: { status: FilterStatus; label: string; color: string }[] = [
    { status: 'all', label: 'すべて', color: 'bg-gray-100 text-gray-800' },
    { status: 'pending', label: '審査中', color: 'bg-orange-100 text-orange-800' },
    { status: 'approved', label: '承認済み', color: 'bg-green-100 text-green-800' },
    { status: 'rejected', label: '却下', color: 'bg-red-100 text-red-800' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-[#5DABA8] font-medium">読み込み中...</div>
      </div>
    );
  }

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.application_status === 'pending').length,
    approved: applications.filter(a => a.application_status === 'approved').length,
    rejected: applications.filter(a => a.application_status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">申し込み履歴</h1>
          <p className="text-gray-600">あなたの申し込み状況を確認</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-md">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.all}</p>
              <p className="text-sm text-gray-600">総申し込み</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-600 mb-1">{statusCounts.pending}</p>
              <p className="text-sm text-gray-600">審査中</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600 mb-1">{statusCounts.approved}</p>
              <p className="text-sm text-gray-600">承認済み</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600 mb-1">{statusCounts.rejected}</p>
              <p className="text-sm text-gray-600">却下</p>
            </CardContent>
          </Card>
        </div>

        {/* フィルターボタン */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
          {filterButtons.map((btn) => {
            const count = statusCounts[btn.status];
            return (
              <button
                key={btn.status}
                onClick={() => setFilterStatus(btn.status)}
                className={cn(
                  'px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all shadow-sm',
                  filterStatus === btn.status
                    ? 'bg-[#5DABA8] text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                )}
              >
                {btn.label}
                <span className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs font-bold',
                  filterStatus === btn.status
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 申し込み一覧 */}
        {filteredApplications.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filterStatus === 'all' ? '申し込み履歴がありません' : `${filterButtons.find(b => b.status === filterStatus)?.label}の申し込みはありません`}
              </h3>
              <p className="text-gray-600 mb-6">
                イベントに申し込むと、ここに表示されます
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-[#5DABA8] hover:bg-[#4A9693]"
              >
                イベントを探す
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card
                key={application.id}
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01]"
                onClick={() => router.push(`/events/${application.event_id}`)}
              >
                {application.events.main_image_url && (
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    <img
                      src={application.events.main_image_url}
                      alt={application.events.event_name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                      <StatusBadge status={application.application_status} />
                    </div>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 leading-snug mb-2">
                        {application.events.event_name}
                      </h3>
                      {!application.events.main_image_url && (
                        <StatusBadge status={application.application_status} />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-[#5DABA8] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">開催期間</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatDateRange(
                            application.events.event_start_date,
                            application.events.event_end_date
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-[#5DABA8] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">会場</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {application.events.venue_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>申し込み日: {formatDate(application.applied_at)}</span>
                      {application.reviewed_at && (
                        <span>審査日: {formatDate(application.reviewed_at)}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
