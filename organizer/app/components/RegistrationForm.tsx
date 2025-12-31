'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import ProgressBar from './ProgressBar';
import LoadingSpinner from './LoadingSpinner';

interface FormData {
  name: string;
  organizationName: string;
  phoneNumber: string;
  email: string;
}

export default function RegistrationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    organizationName: '',
    phoneNumber: '',
    email: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.organizationName || !formData.phoneNumber || !formData.email) {
      setError('すべての必須項目を入力してください');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('認証されていません');
      }

      // 主催者情報を保存
      const { error: insertError } = await supabase
        .from('organizers')
        .insert({
          user_id: user.id,
          name: formData.name,
          organization_name: formData.organizationName,
          phone_number: formData.phoneNumber,
          email: formData.email,
          is_approved: false,
        });

      if (insertError) throw insertError;

      router.push('/');
    } catch (err: any) {
      setError(err.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          主催者情報登録
        </h1>

        <ProgressBar currentStep={currentStep} totalSteps={2} />

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* ステップ1: 基本情報 */}
        {currentStep === 1 && (
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}>
              基本情報
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                名前 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                組織名 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                電話番号 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                メールアドレス <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
              />
            </div>
          </div>
        )}

        {/* ステップ2: 利用規約確認 */}
        {currentStep === 2 && (
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}>
              利用規約確認
            </h2>

            <div style={{
              padding: '20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '20px',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '12px',
              }}>
                利用規約
              </h3>
              <div style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#666',
              }}>
                <p style={{ marginBottom: '12px' }}>
                  本サービスをご利用いただくにあたり、以下の利用規約に同意していただく必要があります。
                </p>
                <p style={{ marginBottom: '12px' }}>
                  1. 主催者は、提供する情報が正確であることを保証します。
                </p>
                <p style={{ marginBottom: '12px' }}>
                  2. 主催者は、イベント情報を適切に管理する責任があります。
                </p>
                <p style={{ marginBottom: '12px' }}>
                  3. 主催者は、出店者の申請を承認または却下する権利を有します。
                </p>
                <p style={{ marginBottom: '12px' }}>
                  4. 個人情報は適切に管理され、本サービスの目的のみに使用されます。
                </p>
              </div>
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                required
                style={{
                  marginRight: '8px',
                  width: '20px',
                  height: '20px',
                }}
              />
              <span style={{ fontSize: '14px' }}>
                利用規約に同意します <span style={{ color: '#e74c3c' }}>*</span>
              </span>
            </label>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '30px',
        }}>
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              戻る
            </button>
          )}
          {currentStep < 2 ? (
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              次へ
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              登録する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

