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
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 mb-4">申し込み履歴</h1>

          {/* フィルターボタン */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterButtons.map((btn) => (
              <button
                key={btn.status}
                onClick={() => setFilterStatus(btn.status)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  filterStatus === btn.status
                    ? btn.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 申し込み一覧 */}
      <main className="px-4 py-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">申し込み履歴がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card
                key={application.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/events/${application.event_id}`)}
              >
                {application.events.main_image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    <img
                      src={application.events.main_image_url}
                      alt={application.events.event_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold leading-snug">
                      {application.events.event_name}
                    </h3>
                    <StatusBadge status={application.application_status} />
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDateRange(
                          application.events.event_start_date,
                          application.events.event_end_date
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{application.events.venue_name}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      申し込み日: {formatDate(application.applied_at)}
                    </p>
                    {application.reviewed_at && (
                      <p className="text-xs text-gray-500">
                        審査日: {formatDate(application.reviewed_at)}
                      </p>
                    )}
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
