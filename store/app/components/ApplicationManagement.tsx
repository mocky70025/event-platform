'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';

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

      const { data: exhibitorData, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (exhibitorError) throw exhibitorError;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-sky-500"></div>
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
    <div className="min-h-screen bg-sky-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">申し込み履歴</h1>
          <p className="text-sm text-gray-600">あなたの申し込み状況を確認</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.all}</p>
              <p className="text-sm text-gray-600">総申し込み</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600 mb-1">{statusCounts.pending}</p>
              <p className="text-sm text-gray-600">審査中</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-emerald-600 mb-1">{statusCounts.approved}</p>
              <p className="text-sm text-gray-600">承認済み</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600 mb-1">{statusCounts.rejected}</p>
              <p className="text-sm text-gray-600">却下</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-sky-500 text-white'
                : 'bg-white border border-gray-300 hover:bg-sky-50 text-gray-700'
            }`}
          >
            すべて ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'pending'
                ? 'bg-sky-500 text-white'
                : 'bg-white border border-gray-300 hover:bg-sky-50 text-gray-700'
            }`}
          >
            審査中 ({statusCounts.pending})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'approved'
                ? 'bg-sky-500 text-white'
                : 'bg-white border border-gray-300 hover:bg-sky-50 text-gray-700'
            }`}
          >
            承認済み ({statusCounts.approved})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'rejected'
                ? 'bg-sky-500 text-white'
                : 'bg-white border border-gray-300 hover:bg-sky-50 text-gray-700'
            }`}
          >
            却下 ({statusCounts.rejected})
          </button>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filterStatus === 'all' ? '申し込み履歴がありません' : '該当する申し込みはありません'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                イベントに申し込むと、ここに表示されます
              </p>
              <Button
                onClick={() => router.push('/')}
                className="h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
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
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
                onClick={() => router.push(`/events/${application.event_id}`)}
              >
                {application.events.main_image_url && (
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100 rounded-t-xl">
                    <img
                      src={application.events.main_image_url}
                      alt={application.events.event_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <StatusBadge status={application.application_status} />
                    </div>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {application.events.event_name}
                      </h3>
                      {!application.events.main_image_url && (
                        <StatusBadge status={application.application_status} />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">開催期間</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {formatDateRange(
                            application.events.event_start_date,
                            application.events.event_end_date
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">会場</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {application.events.venue_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
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