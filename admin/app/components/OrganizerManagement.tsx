'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Building2, User, Phone, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Organizer {
  id: string;
  name: string;
  organization_name: string;
  email: string;
  phone_number: string;
  is_approved: boolean;
  created_at: string;
}

interface OrganizerManagementProps {
  onUpdate: () => void;
}

export default function OrganizerManagement({ onUpdate }: OrganizerManagementProps) {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizers();
  }, [filter]);

  const loadOrganizers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('organizers')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_approved', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      setOrganizers(data || []);
    } catch (error: any) {
      console.error('Error loading organizers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from('organizers')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;

      loadOrganizers();
      onUpdate();
    } catch (error: any) {
      alert('承認に失敗しました: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('この主催者を却下しますか？')) return;

    setProcessing(id);
    try {
      const { error } = await supabase
        .from('organizers')
        .update({ is_approved: false })
        .eq('id', id);

      if (error) throw error;

      loadOrganizers();
      onUpdate();
    } catch (error: any) {
      alert('却下に失敗しました: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const statusCounts = {
    all: organizers.length,
    pending: organizers.filter(o => !o.is_approved).length,
    approved: organizers.filter(o => o.is_approved).length,
  };

  const filteredOrganizers = filter === 'all' 
    ? organizers 
    : organizers.filter(o => filter === 'pending' ? !o.is_approved : o.is_approved);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse text-[#3B82F6] font-medium">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.all}</p>
            <p className="text-sm text-gray-600">総主催者数</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-orange-600 mb-1">{statusCounts.pending}</p>
            <p className="text-sm text-gray-600">承認待ち</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">{statusCounts.approved}</p>
            <p className="text-sm text-gray-600">承認済み</p>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <div className="flex gap-3">
        {[
          { value: 'all', label: 'すべて', count: statusCounts.all },
          { value: 'pending', label: '承認待ち', count: statusCounts.pending },
          { value: 'approved', label: '承認済み', count: statusCounts.approved },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value as typeof filter)}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all shadow-sm',
              filter === btn.value
                ? 'bg-[#3B82F6] text-white shadow-md scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            )}
          >
            {btn.label}
            <span className={cn(
              'ml-2 px-2 py-0.5 rounded-full text-xs font-bold',
              filter === btn.value
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
            )}>
              {btn.count}
            </span>
          </button>
        ))}
      </div>

      {/* 主催者一覧 */}
      {filteredOrganizers.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              主催者がいません
            </h3>
            <p className="text-gray-600">
              {filter === 'pending' ? '承認待ちの主催者はいません' : filter === 'approved' ? '承認済みの主催者はいません' : '主催者が登録されていません'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrganizers.map((organizer) => (
            <Card key={organizer.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {organizer.organization_name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {organizer.organization_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        登録日: {formatDate(organizer.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2',
                    organizer.is_approved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  )}>
                    {organizer.is_approved ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        承認済み
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        承認待ち
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">担当者名</p>
                      <p className="font-semibold text-gray-900">{organizer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">電話番号</p>
                      <p className="font-semibold text-gray-900">{organizer.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <Mail className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">メールアドレス</p>
                      <p className="font-semibold text-gray-900 text-sm break-all">{organizer.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  {!organizer.is_approved ? (
                    <>
                      <Button
                        onClick={() => handleApprove(organizer.id)}
                        disabled={processing === organizer.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold shadow-md"
                      >
                        {processing === organizer.id ? '処理中...' : '✓ 承認する'}
                      </Button>
                      <Button
                        onClick={() => handleReject(organizer.id)}
                        disabled={processing === organizer.id}
                        variant="outline"
                        className="flex-1 h-12 text-base font-semibold text-red-600 border-2 border-red-600 hover:bg-red-50 shadow-md"
                      >
                        {processing === organizer.id ? '処理中...' : '✕ 却下する'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleReject(organizer.id)}
                      disabled={processing === organizer.id}
                      variant="outline"
                      className="flex-1 h-12 text-base font-semibold text-orange-600 border-2 border-orange-600 hover:bg-orange-50 shadow-md"
                    >
                      {processing === organizer.id ? '処理中...' : '承認を取り消す'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
