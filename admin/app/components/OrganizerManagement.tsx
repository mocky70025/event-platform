'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Building2, User, Phone, Mail, CheckCircle, Clock } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">主催者管理</h2>
        <p className="text-sm text-gray-600">主催者の承認と管理を行います</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.all}</p>
            <p className="text-sm text-gray-600">総主催者数</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-amber-600 mb-1">{statusCounts.pending}</p>
            <p className="text-sm text-gray-600">承認待ち</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-emerald-600 mb-1">{statusCounts.approved}</p>
            <p className="text-sm text-gray-600">承認済み</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          すべて ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'pending'
              ? 'bg-indigo-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          承認待ち ({statusCounts.pending})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'approved'
              ? 'bg-indigo-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          承認済み ({statusCounts.approved})
        </button>
      </div>

      {/* Organizers List */}
      {filteredOrganizers.length === 0 ? (
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              主催者がいません
            </h3>
            <p className="text-sm text-gray-600">
              {filter === 'pending' ? '承認待ちの主催者はいません' : filter === 'approved' ? '承認済みの主催者はいません' : '主催者が登録されていません'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrganizers.map((organizer) => (
            <Card key={organizer.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-semibold">
                      {organizer.organization_name[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {organizer.organization_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        登録日: {formatDate(organizer.created_at)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={organizer.is_approved ? 'approved' : 'pending'} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">担当者名</p>
                      <p className="font-medium text-gray-900">{organizer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">電話番号</p>
                      <p className="font-medium text-gray-900">{organizer.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <Mail className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">メールアドレス</p>
                      <p className="font-medium text-gray-900 text-sm break-all">{organizer.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {!organizer.is_approved ? (
                    <>
                      <Button
                        onClick={() => handleApprove(organizer.id)}
                        disabled={processing === organizer.id}
                        className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === organizer.id ? '処理中...' : '承認する'}
                      </Button>
                      <Button
                        onClick={() => handleReject(organizer.id)}
                        disabled={processing === organizer.id}
                        className="flex-1 h-10 bg-white border border-red-500 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === organizer.id ? '処理中...' : '却下する'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleReject(organizer.id)}
                      disabled={processing === organizer.id}
                      className="flex-1 h-10 bg-white border border-amber-500 hover:bg-amber-50 text-amber-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
