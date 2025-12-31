'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
        }}>
          主催者管理
        </h2>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === f ? '#8B5CF6' : '#f0f0f0',
                color: filter === f ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {f === 'all' ? 'すべて' : f === 'pending' ? '承認待ち' : '承認済み'}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: '16px',
      }}>
        {organizers.map((organizer) => (
          <div
            key={organizer.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '12px',
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}>
                  {organizer.name}
                </h3>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                }}>
                  {organizer.organization_name}
                </div>
              </div>
              <span style={{
                padding: '4px 12px',
                backgroundColor: organizer.is_approved ? '#10B981' : '#F59E0B',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                {organizer.is_approved ? '承認済み' : '承認待ち'}
              </span>
            </div>

            <div style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '12px',
            }}>
              <div>📧 {organizer.email}</div>
              <div>📞 {organizer.phone_number}</div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
                登録日: {new Date(organizer.created_at).toLocaleDateString('ja-JP')}
              </div>
            </div>

            {!organizer.is_approved && (
              <div style={{
                display: 'flex',
                gap: '8px',
              }}>
                <button
                  onClick={() => handleApprove(organizer.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  承認
                </button>
                <button
                  onClick={() => handleReject(organizer.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  却下
                </button>
              </div>
            )}
          </div>
        ))}

        {organizers.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
          }}>
            主催者が見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
}

