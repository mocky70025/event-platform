'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Application {
  id: string;
  application_status: string;
  applied_at: string;
  exhibitor: {
    id: string;
    name: string;
    gender: string;
    age: number;
    phone_number: string;
    email: string;
    genre_category?: string;
    genre_free_text?: string;
    business_license_image_url?: string;
    vehicle_inspection_image_url?: string;
    automobile_inspection_image_url?: string;
    pl_insurance_image_url?: string;
    fire_equipment_layout_image_url?: string;
  };
}

export default function EventApplications() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (eventId) {
      loadApplications();
    }
  }, [eventId]);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      if (!eventId) {
        setError('イベントIDが指定されていません');
        return;
      }

      const { data, error: queryError } = await supabase
        .from('event_applications')
        .select(`
          *,
          exhibitor:exhibitors (
            id,
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

      if (queryError) throw queryError;

      setApplications((data || []) as Application[]);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || '申し込みの読み込みに失敗しました');
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

  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('event_applications')
        .update({ application_status: status })
        .eq('id', applicationId);

      if (error) throw error;

      // 通知を作成
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        // 出店者のuser_idを取得
        const { data: exhibitorData } = await supabase
          .from('exhibitors')
          .select('user_id')
          .eq('id', application.exhibitor.id)
          .single();

        if (exhibitorData && exhibitorData.user_id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: exhibitorData.user_id,
              user_type: 'exhibitor',
              notification_type: status === 'approved' ? 'application_approved' : 'application_rejected',
              title: status === 'approved' ? '申し込みが承認されました' : '申し込みが却下されました',
              message: status === 'approved'
                ? 'あなたのイベント申し込みが承認されました。'
                : '申し訳ございませんが、あなたのイベント申し込みが却下されました。',
              related_application_id: applicationId,
              is_read: false,
            });
        }
      }

      loadApplications();
    } catch (err: any) {
      alert(err.message || 'ステータスの更新に失敗しました');
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
          申し込み管理
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
                backgroundColor: statusFilter === status ? '#FF6B35' : '#f0f0f0',
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
              申し込みがありません
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
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}>
                    {application.exhibitor.name}
                  </h3>
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
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '12px',
                }}>
                  <div>性別: {application.exhibitor.gender}</div>
                  <div>年齢: {application.exhibitor.age}歳</div>
                  <div>電話番号: {application.exhibitor.phone_number}</div>
                  <div>メール: {application.exhibitor.email}</div>
                  {application.exhibitor.genre_category && (
                    <div>ジャンル: {application.exhibitor.genre_category}</div>
                  )}
                </div>

                {application.exhibitor.genre_free_text && (
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                  }}>
                    {application.exhibitor.genre_free_text}
                  </div>
                )}

                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e0e0e0',
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                  }}>
                    登録書類
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '12px',
                  }}>
                    {application.exhibitor.business_license_image_url && (
                      <div>
                        <img
                          src={application.exhibitor.business_license_image_url}
                          alt="営業許可証"
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginTop: '4px',
                        }}>
                          営業許可証
                        </div>
                      </div>
                    )}
                    {application.exhibitor.vehicle_inspection_image_url && (
                      <div>
                        <img
                          src={application.exhibitor.vehicle_inspection_image_url}
                          alt="車検証"
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginTop: '4px',
                        }}>
                          車検証
                        </div>
                      </div>
                    )}
                    {application.exhibitor.automobile_inspection_image_url && (
                      <div>
                        <img
                          src={application.exhibitor.automobile_inspection_image_url}
                          alt="自賠責保険"
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginTop: '4px',
                        }}>
                          自賠責保険
                        </div>
                      </div>
                    )}
                    {application.exhibitor.pl_insurance_image_url && (
                      <div>
                        <img
                          src={application.exhibitor.pl_insurance_image_url}
                          alt="PL保険"
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginTop: '4px',
                        }}>
                          PL保険
                        </div>
                      </div>
                    )}
                    {application.exhibitor.fire_equipment_layout_image_url && (
                      <div>
                        <img
                          src={application.exhibitor.fire_equipment_layout_image_url}
                          alt="消防設備配置図"
                          style={{
                            width: '100%',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginTop: '4px',
                        }}>
                          消防設備配置図
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {application.application_status === 'pending' && (
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '16px',
                  }}>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'approved')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      承認
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      却下
                    </button>
                  </div>
                )}

                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  marginTop: '12px',
                }}>
                  申し込み日時: {new Date(application.applied_at).toLocaleString('ja-JP')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

