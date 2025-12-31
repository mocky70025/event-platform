'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import ExhibitorEditForm from './ExhibitorEditForm';
import LoadingSpinner from './LoadingSpinner';

interface Exhibitor {
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
}

export default function ExhibitorProfile() {
  const [exhibitor, setExhibitor] = useState<Exhibitor | null>(null);
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
        .from('exhibitors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (queryError) throw queryError;
      setExhibitor(data);
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

  if (error && !exhibitor) {
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

  if (isEditing && exhibitor) {
    return (
      <ExhibitorEditForm
        exhibitor={exhibitor}
        onComplete={handleEditComplete}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (!exhibitor) {
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
            backgroundColor: '#5DABA8',
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
              {exhibitor.name}
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
              性別
            </div>
            <div style={{
              fontSize: '18px',
            }}>
              {exhibitor.gender}
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
              年齢
            </div>
            <div style={{
              fontSize: '18px',
            }}>
              {exhibitor.age}歳
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
              {exhibitor.phone_number}
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
              {exhibitor.email}
            </div>
          </div>

          {exhibitor.genre_category && (
            <div style={{
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '14px',
                color: '#999',
                marginBottom: '4px',
              }}>
                ジャンル（カテゴリ）
              </div>
              <div style={{
                fontSize: '18px',
              }}>
                {exhibitor.genre_category}
              </div>
            </div>
          )}

          {exhibitor.genre_free_text && (
            <div style={{
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '14px',
                color: '#999',
                marginBottom: '4px',
              }}>
                ジャンル（自由記述）
              </div>
              <div style={{
                fontSize: '18px',
                lineHeight: '1.6',
              }}>
                {exhibitor.genre_free_text}
              </div>
            </div>
          )}

          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e0e0e0',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '16px',
            }}>
              登録書類
            </h3>

            {exhibitor.business_license_image_url && (
              <div style={{
                marginBottom: '12px',
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  営業許可証
                </div>
                <img
                  src={exhibitor.business_license_image_url}
                  alt="営業許可証"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}

            {exhibitor.vehicle_inspection_image_url && (
              <div style={{
                marginBottom: '12px',
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  車検証
                </div>
                <img
                  src={exhibitor.vehicle_inspection_image_url}
                  alt="車検証"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}

            {exhibitor.automobile_inspection_image_url && (
              <div style={{
                marginBottom: '12px',
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  自賠責保険
                </div>
                <img
                  src={exhibitor.automobile_inspection_image_url}
                  alt="自賠責保険"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}

            {exhibitor.pl_insurance_image_url && (
              <div style={{
                marginBottom: '12px',
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  PL保険
                </div>
                <img
                  src={exhibitor.pl_insurance_image_url}
                  alt="PL保険"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}

            {exhibitor.fire_equipment_layout_image_url && (
              <div style={{
                marginBottom: '12px',
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  消防設備配置図
                </div>
                <img
                  src={exhibitor.fire_equipment_layout_image_url}
                  alt="消防設備配置図"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

