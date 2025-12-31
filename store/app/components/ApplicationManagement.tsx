'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Application {
  id: string;
  application_status: string;
  applied_at: string;
  event: {
    id: string;
    event_name: string;
    event_start_date: string;
    event_end_date: string;
    venue_name: string;
    main_image_url?: string;
  };
}

export default function ApplicationManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        setError('ログインが必要です');
        return;
      }

      const { data: exhibitor } = await supabase
        .from('exhibitors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!exhibitor) {
        setError('出店者情報が登録されていません');
        return;
      }

      const { data, error: queryError } = await supabase
        .from('event_applications')
        .select(`
          *,
          event:events (
            id,
            event_name,
            event_start_date,
            event_end_date,
            venue_name,
            main_image_url
          )
        `)
        .eq('exhibitor_id', exhibitor.id)
        .order('applied_at', { ascending: false });

      if (queryError) throw queryError;

      setApplications((data || []) as Application[]);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || '申し込み履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter(app => app.application_status === statusFilter)
      );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '審査中';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '却下';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'approved':
        return '#27ae60';
      case 'rejected':
        return '#e74c3c';
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      paddingBottom: '80px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '16px',
        }}>
          申し込み履歴
        </h1>

        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '8px 16px',
                backgroundColor: statusFilter === status ? '#5DABA8' : '#f0f0f0',
                color: statusFilter === status ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {status === 'all' ? 'すべて' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        padding: '20px',
      }}>
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {filteredApplications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>📋</div>
            <div style={{
              fontSize: '16px',
            }}>
              申し込み履歴がありません
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px',
          }}>
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {application.event.main_image_url && (
                  <img
                    src={application.event.main_image_url}
                    alt={application.event.event_name}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '12px',
                    }}
                  />
                )}

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}>
                  {application.event.event_name}
                </h3>

                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '12px',
                }}>
                  📅 {new Date(application.event.event_start_date).toLocaleDateString('ja-JP')} - {new Date(application.event.event_end_date).toLocaleDateString('ja-JP')}
                </div>

                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '12px',
                }}>
                  📍 {application.event.venue_name}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: getStatusColor(application.application_status),
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}>
                      {getStatusLabel(application.application_status)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                  }}>
                    {new Date(application.applied_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

