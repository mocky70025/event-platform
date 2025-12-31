'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import OrganizerEditForm from './OrganizerEditForm';
import LoadingSpinner from './LoadingSpinner';

interface Organizer {
  id: string;
  name: string;
  organization_name: string;
  phone_number: string;
  email: string;
  is_approved: boolean;
}

export default function OrganizerProfile() {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        setError('ログインが必要です');
        return;
      }

      const { data, error: queryError } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (queryError) throw queryError;
      setOrganizer(data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    loadProfile();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !organizer) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '8px',
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (isEditing && organizer) {
    return (
      <OrganizerEditForm
        organizer={organizer}
        onComplete={handleEditComplete}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (!organizer) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '16px',
          color: '#999',
        }}>
          プロフィール情報がありません
        </div>
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
        }}>
          プロフィール
        </h1>
        <button
          onClick={() => setIsEditing(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          編集
        </button>
      </div>

      <div style={{
        padding: '20px',
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            marginBottom: '20px',
          }}>
            <div style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '4px',
            }}>
              名前
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '500',
            }}>
              {organizer.name}
            </div>
          </div>

          <div style={{
            marginBottom: '20px',
          }}>
            <div style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '4px',
            }}>
              組織名
            </div>
            <div style={{
              fontSize: '18px',
            }}>
              {organizer.organization_name}
            </div>
          </div>

          <div style={{
            marginBottom: '20px',
          }}>
            <div style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '4px',
            }}>
              電話番号
            </div>
            <div style={{
              fontSize: '18px',
            }}>
              {organizer.phone_number}
            </div>
          </div>

          <div style={{
            marginBottom: '20px',
          }}>
            <div style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '4px',
            }}>
              メールアドレス
            </div>
            <div style={{
              fontSize: '18px',
            }}>
              {organizer.email}
            </div>
          </div>

          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e0e0e0',
          }}>
            <div style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '4px',
            }}>
              承認ステータス
            </div>
            <div>
              <span style={{
                padding: '4px 12px',
                backgroundColor: organizer.is_approved ? '#27ae60' : '#f39c12',
                color: 'white',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                {organizer.is_approved ? '承認済み' : '審査中'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

