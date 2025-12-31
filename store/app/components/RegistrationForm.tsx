'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import ProgressBar from './ProgressBar';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';

interface FormData {
  name: string;
  gender: string;
  age: string;
  phoneNumber: string;
  email: string;
  genreCategory: string;
  genreFreeText: string;
  businessLicenseImage: File | null;
  vehicleInspectionImage: File | null;
  automobileInspectionImage: File | null;
  plInsuranceImage: File | null;
  fireEquipmentLayoutImage: File | null;
}

export default function RegistrationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: '',
    age: '',
    phoneNumber: '',
    email: '',
    genreCategory: '',
    genreFreeText: '',
    businessLicenseImage: null,
    vehicleInspectionImage: null,
    automobileInspectionImage: null,
    plInsuranceImage: null,
    fireEquipmentLayoutImage: null,
  });

  // 下書き保存（sessionStorage）
  useEffect(() => {
    const saved = sessionStorage.getItem('exhibitor_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  const saveDraft = () => {
    const draft = {
      name: formData.name,
      gender: formData.gender,
      age: formData.age,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      genreCategory: formData.genreCategory,
      genreFreeText: formData.genreFreeText,
    };
    sessionStorage.setItem('exhibitor_draft', JSON.stringify(draft));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    saveDraft();
  };

  const handleImageSelect = (field: keyof FormData, file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.gender || !formData.age || !formData.phoneNumber || !formData.email) {
      setError('すべての必須項目を入力してください');
      return false;
    }
    if (isNaN(Number(formData.age)) || Number(formData.age) < 0) {
      setError('年齢は正の数で入力してください');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
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

      // 画像アップロード
      const uploadPromises: Promise<string>[] = [];
      const imageFields = [
        'businessLicenseImage',
        'vehicleInspectionImage',
        'automobileInspectionImage',
        'plInsuranceImage',
        'fireEquipmentLayoutImage',
      ] as const;

      const imageUrls: Record<string, string> = {};

      for (const field of imageFields) {
        const file = formData[field];
        if (file) {
          const path = `exhibitors/${user.id}/${field}_${Date.now()}.${file.name.split('.').pop()}`;
          uploadPromises.push(
            uploadImage('documents', path, file).then(url => {
              imageUrls[field.replace('Image', 'ImageUrl')] = url;
              return url;
            })
          );
        }
      }

      await Promise.all(uploadPromises);

      // 出店者情報を保存
      const { error: insertError } = await supabase
        .from('exhibitors')
        .insert({
          user_id: user.id,
          name: formData.name,
          gender: formData.gender,
          age: parseInt(formData.age),
          phone_number: formData.phoneNumber,
          email: formData.email,
          genre_category: formData.genreCategory || null,
          genre_free_text: formData.genreFreeText || null,
          business_license_image_url: imageUrls.businessLicenseImageUrl || null,
          vehicle_inspection_image_url: imageUrls.vehicleInspectionImageUrl || null,
          automobile_inspection_image_url: imageUrls.automobileInspectionImageUrl || null,
          pl_insurance_image_url: imageUrls.plInsuranceImageUrl || null,
          fire_equipment_layout_image_url: imageUrls.fireEquipmentLayoutImageUrl || null,
        });

      if (insertError) throw insertError;

      // 下書きをクリア
      sessionStorage.removeItem('exhibitor_draft');
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
          出店者情報登録
        </h1>

        <ProgressBar currentStep={currentStep} totalSteps={3} />

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
                性別 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
              >
                <option value="">選択してください</option>
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="それ以外">それ以外</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                年齢 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                required
                min="0"
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

            <div style={{ marginBottom: '16px' }}>
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                ジャンル（カテゴリ）
              </label>
              <input
                type="text"
                value={formData.genreCategory}
                onChange={(e) => handleInputChange('genreCategory', e.target.value)}
                placeholder="例: 飲食、雑貨、アート"
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
                ジャンル（自由記述）
              </label>
              <textarea
                value={formData.genreFreeText}
                onChange={(e) => handleInputChange('genreFreeText', e.target.value)}
                placeholder="ジャンルの詳細を記入してください"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        )}

        {/* ステップ2: 書類アップロード */}
        {currentStep === 2 && (
          <div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}>
              書類アップロード
            </h2>

            <ImageUpload
              label="営業許可証"
              onFileSelect={(file) => handleImageSelect('businessLicenseImage', file)}
              enableOCR={true}
              documentType="businessLicense"
              onRecognized={(data) => {
                console.log('営業許可証認識結果:', data);
                // 認識結果を保存する場合はここで処理
              }}
            />

            <ImageUpload
              label="車検証"
              onFileSelect={(file) => handleImageSelect('vehicleInspectionImage', file)}
              enableOCR={true}
              documentType="vehicleInspection"
              onRecognized={(data) => {
                console.log('車検証認識結果:', data);
              }}
            />

            <ImageUpload
              label="自賠責保険"
              onFileSelect={(file) => handleImageSelect('automobileInspectionImage', file)}
              enableOCR={true}
              documentType="automobileInspection"
              onRecognized={(data) => {
                console.log('自賠責保険認識結果:', data);
              }}
            />

            <ImageUpload
              label="PL保険"
              onFileSelect={(file) => handleImageSelect('plInsuranceImage', file)}
              enableOCR={true}
              documentType="plInsurance"
              onRecognized={(data) => {
                console.log('PL保険認識結果:', data);
              }}
            />

            <ImageUpload
              label="消防設備配置図"
              onFileSelect={(file) => handleImageSelect('fireEquipmentLayoutImage', file)}
            />
          </div>
        )}

        {/* ステップ3: 利用規約確認 */}
        {currentStep === 3 && (
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
                  1. 出店者は、提供する情報が正確であることを保証します。
                </p>
                <p style={{ marginBottom: '12px' }}>
                  2. 出店者は、必要な書類を適切に提出する責任があります。
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
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#5DABA8',
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
                backgroundColor: '#5DABA8',
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

