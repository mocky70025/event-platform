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
      <div className="py-8 text-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* フィルターボタン */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.status}
            onClick={() => setFilterStatus(btn.status)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              filterStatus === btn.status
                ? 'bg-organizer text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 申し込み一覧 */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">申し込みがありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {application.exhibitors.name}
                  </h3>
                  <StatusBadge status={application.application_status} />
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                      {application.exhibitors.gender} / {application.exhibitors.age}歳
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{application.exhibitors.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="break-all">{application.exhibitors.email}</span>
                  </div>
                  {application.exhibitors.genre_category && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span>{application.exhibitors.genre_category}</span>
                    </div>
                  )}
                </div>

                {application.exhibitors.genre_free_text && (
                  <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {application.exhibitors.genre_free_text}
                    </p>
                  </div>
                )}

                {/* 登録書類 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">登録書類</h4>
                  <div className="grid grid-cols-3 gap-2">
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
                          className="block border border-gray-200 rounded overflow-hidden hover:border-organizer transition-colors"
                        >
                          <img
                            src={doc.url}
                            alt={doc.label}
                            className="w-full h-20 object-cover"
                          />
                          <div className="p-1 bg-gray-50 text-xs text-center">
                            {doc.label}
                          </div>
                        </a>
                      ) : null
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  申し込み日: {formatDate(application.applied_at)}
                </div>

                {/* アクションボタン */}
                {application.application_status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(application.id)}
                      disabled={processing === application.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      承認
                    </Button>
                    <Button
                      onClick={() => handleReject(application.id)}
                      disabled={processing === application.id}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      却下
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
