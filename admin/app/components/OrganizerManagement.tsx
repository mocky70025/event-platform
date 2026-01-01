'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { StatusBadge } from '@/components/status-badge';
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
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('この主催者を却下しますか？')) return;

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
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          主催者管理
        </h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-admin text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {f === 'all' ? 'すべて' : f === 'pending' ? '承認待ち' : '承認済み'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {organizers.map((organizer) => (
          <Card key={organizer.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    {organizer.name}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {organizer.organization_name}
                  </div>
                </div>
                <StatusBadge
                  status={organizer.is_approved ? 'approved' : 'pending'}
                />
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <div>📧 {organizer.email}</div>
                <div>📞 {organizer.phone_number}</div>
                <div className="mt-1 text-xs text-gray-400">
                  登録日: {new Date(organizer.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>

              {!organizer.is_approved && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(organizer.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    承認
                  </Button>
                  <Button
                    onClick={() => handleReject(organizer.id)}
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

        {organizers.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            主催者が見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
}
