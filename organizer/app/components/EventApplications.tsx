'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { User, Phone, Mail, Tag, FileText } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-orange-500 mx-auto"></div>
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
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.all}</p>
            <p className="text-sm text-gray-600">総応募数</p>
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
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-orange-50 text-gray-700'
          }`}
        >
          すべて ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'pending'
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-orange-50 text-gray-700'
          }`}
        >
          審査中 ({statusCounts.pending})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'approved'
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-orange-50 text-gray-700'
          }`}
        >
          承認済み ({statusCounts.approved})
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'rejected'
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-orange-50 text-gray-700'
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
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filterStatus === 'all' ? '申し込みがありません' : '該当する申し込みはありません'}
            </h3>
            <p className="text-sm text-gray-600">
              申し込みがあるとここに表示されます
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow transition-all">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold">
                      {application.exhibitors.name[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {application.exhibitors.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        申し込み日: {formatDate(application.applied_at)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={application.application_status} />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">性別・年齢</p>
                      <p className="font-medium text-gray-900">
                        {application.exhibitors.gender} / {application.exhibitors.age}歳
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">電話番号</p>
                      <p className="font-medium text-gray-900">{application.exhibitors.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">メール</p>
                      <p className="font-medium text-gray-900 text-sm break-all">
                        {application.exhibitors.email}
                      </p>
                    </div>
                  </div>
                  {application.exhibitors.genre_category && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Tag className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">ジャンル</p>
                        <p className="font-medium text-gray-900">
                          {application.exhibitors.genre_category}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Genre Details */}
                {application.exhibitors.genre_free_text && (
                  <div className="mb-5 p-4 bg-orange-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">ジャンル詳細</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {application.exhibitors.genre_free_text}
                    </p>
                  </div>
                )}

                {/* Documents */}
                <div className="mb-5">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
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
                          className="group block border border-gray-200 rounded-lg overflow-hidden hover:border-orange-500 transition-all hover:shadow"
                        >
                          <div className="relative">
                            <img
                              src={doc.url}
                              alt={doc.label}
                              className="w-full h-24 object-cover"
                            />
                          </div>
                          <div className="p-2 bg-orange-50 text-xs text-center font-medium text-gray-700">
                            {doc.label}
                          </div>
                        </a>
                      ) : (
                        <div key={idx} className="border border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center">
                          <p className="text-xs text-gray-400 text-center">
                            {doc.label}<br/>未登録
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {application.application_status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleApprove(application.id)}
                      disabled={processing === application.id}
                      className="flex-1 h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === application.id ? '処理中...' : '承認する'}
                    </Button>
                    <Button
                      onClick={() => handleReject(application.id)}
                      disabled={processing === application.id}
                      className="flex-1 h-10 bg-white border border-red-500 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === application.id ? '処理中...' : '却下する'}
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