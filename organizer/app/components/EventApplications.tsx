'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { User, Phone, Mail, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  exhibitor_id: string;
  application_status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  exhibitors: {
    name: string;
    gender: string;
    age: number;
    phone_number: string;
    email: string;
    genre_category: string | null;
    genre_free_text: string | null;
    business_license_image_url: string | null;
    vehicle_inspection_image_url: string | null;
    automobile_inspection_image_url: string | null;
    pl_insurance_image_url: string | null;
    fire_equipment_layout_image_url: string | null;
  };
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

interface EventApplicationsProps {
  eventId: string;
}

export default function EventApplications({ eventId }: EventApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [eventId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          *,
          exhibitors (
            name,
            gender,
            age,
            phone_number,
            email,
            genre_category,
            genre_free_text,
            business_license_image_url,
            vehicle_inspection_image_url,
            automobile_inspection_image_url,
            pl_insurance_image_url,
            fire_equipment_layout_image_url
          )
        `)
        .eq('event_id', eventId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('申し込み取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setProcessing(applicationId);
    try {
      const { error } = await supabase
        .from('event_applications')
        .update({
          application_status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      // ローカルステートを更新
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, application_status: 'approved' as const }
            : app
        )
      );
    } catch (error) {
      console.error('承認エラー:', error);
      alert('承認に失敗しました');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setProcessing(applicationId);
    try {
      const { error } = await supabase
        .from('event_applications')
        .update({
          application_status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      // ローカルステートを更新
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, application_status: 'rejected' as const }
            : app
        )
      );
    } catch (error) {
      console.error('却下エラー:', error);
      alert('却下に失敗しました');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const filteredApplications =
    filterStatus === 'all'
      ? applications
      : applications.filter((app) => app.application_status === filterStatus);

  const filterButtons: { status: FilterStatus; label: string }[] = [
    { status: 'all', label: 'すべて' },
    { status: 'pending', label: '審査中' },
    { status: 'approved', label: '承認済み' },
    { status: 'rejected', label: '却下' },
  ];

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse text-[#E58A7B] font-medium">読み込み中...</div>
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
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.all}</p>
            <p className="text-sm text-gray-600">総応募数</p>
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
      <div className="flex gap-3 overflow-x-auto pb-2">
        {filterButtons.map((btn) => {
          const count = statusCounts[btn.status];
          return (
            <button
              key={btn.status}
              onClick={() => setFilterStatus(btn.status)}
              className={cn(
                'px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all shadow-sm',
                filterStatus === btn.status
                  ? 'bg-[#E58A7B] text-white shadow-md scale-105'
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
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filterStatus === 'all' ? '申し込みがありません' : `${filterButtons.find(b => b.status === filterStatus)?.label}の申し込みはありません`}
            </h3>
            <p className="text-gray-600">
              申し込みがあるとここに表示されます
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                {/* ヘッダー */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5C0B3] to-[#E58A7B] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {application.exhibitors.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {application.exhibitors.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        申し込み日: {formatDate(application.applied_at)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={application.application_status} />
                </div>

                {/* 基本情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-[#E58A7B] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">性別・年齢</p>
                      <p className="font-semibold text-gray-900">
                        {application.exhibitors.gender} / {application.exhibitors.age}歳
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-[#E58A7B] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">電話番号</p>
                      <p className="font-semibold text-gray-900">{application.exhibitors.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-[#E58A7B] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">メール</p>
                      <p className="font-semibold text-gray-900 text-sm break-all">
                        {application.exhibitors.email}
                      </p>
                    </div>
                  </div>
                  {application.exhibitors.genre_category && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Tag className="h-5 w-5 text-[#E58A7B] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">ジャンル</p>
                        <p className="font-semibold text-gray-900">
                          {application.exhibitors.genre_category}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ジャンル詳細 */}
                {application.exhibitors.genre_free_text && (
                  <div className="mb-5 p-4 bg-gradient-to-br from-[#FFF5F3] to-white rounded-xl border border-[#E58A7B]/20">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">ジャンル詳細</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {application.exhibitors.genre_free_text}
                    </p>
                  </div>
                )}

                {/* 登録書類 */}
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#E58A7B] rounded-full"></span>
                    登録書類
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { url: application.exhibitors.business_license_image_url, label: '営業許可証' },
                      { url: application.exhibitors.vehicle_inspection_image_url, label: '車検証' },
                      { url: application.exhibitors.automobile_inspection_image_url, label: '自賠責保険' },
                      { url: application.exhibitors.pl_insurance_image_url, label: 'PL保険' },
                      { url: application.exhibitors.fire_equipment_layout_image_url, label: '消防設備配置図' },
                    ].map((doc, idx) =>
                      doc.url ? (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#E58A7B] transition-all hover:shadow-md"
                        >
                          <div className="relative">
                            <img
                              src={doc.url}
                              alt={doc.label}
                              className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                          <div className="p-2 bg-gray-50 text-xs text-center font-medium text-gray-700">
                            {doc.label}
                          </div>
                        </a>
                      ) : (
                        <div key={idx} className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center">
                          <p className="text-xs text-gray-400 text-center">
                            {doc.label}<br/>未登録
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* アクションボタン */}
                {application.application_status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(application.id)}
                      disabled={processing === application.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold shadow-md"
                    >
                      {processing === application.id ? '処理中...' : '✓ 承認する'}
                    </Button>
                    <Button
                      onClick={() => handleReject(application.id)}
                      disabled={processing === application.id}
                      variant="outline"
                      className="flex-1 h-12 text-base font-semibold text-red-600 border-2 border-red-600 hover:bg-red-50 shadow-md"
                    >
                      {processing === application.id ? '処理中...' : '✕ 却下する'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
