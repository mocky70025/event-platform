'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import ImageUpload from './ImageUpload';
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

interface ExhibitorEditFormProps {
  exhibitor: Exhibitor;
  onComplete: () => void;
  onCancel: () => void;
}

export default function ExhibitorEditForm({
  exhibitor,
  onComplete,
  onCancel,
}: ExhibitorEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: exhibitor.name,
    gender: exhibitor.gender,
    age: exhibitor.age.toString(),
    phoneNumber: exhibitor.phone_number,
    email: exhibitor.email,
    genreCategory: exhibitor.genre_category || '',
    genreFreeText: exhibitor.genre_free_text || '',
  });

  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (field: string, file: File) => {
    setImageFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        gender: formData.gender,
        age: parseInt(formData.age),
        phone_number: formData.phoneNumber,
        email: formData.email,
        genre_category: formData.genreCategory || null,
        genre_free_text: formData.genreFreeText || null,
      };

      // 画像アップロード
      const imageFields = [
        'businessLicenseImage',
        'vehicleInspectionImage',
        'automobileInspectionImage',
        'plInsuranceImage',
        'fireEquipmentLayoutImage',
      ] as const;

      for (const field of imageFields) {
        const file = imageFiles[field];
        if (file) {
          const path = `exhibitors/${exhibitor.id}/${field}_${Date.now()}.${file.name.split('.').pop()}`;
          const url = await uploadImage('documents', path, file);
          const dbField = field.replace('Image', 'ImageUrl').replace(/([A-Z])/g, '_$1').toLowerCase();
          updateData[dbField] = url;
        }
      }

      const { error: updateError } = await supabase
        .from('exhibitors')
        .update(updateData)
        .eq('id', exhibitor.id);

      if (updateError) throw updateError;

      onComplete();
    } catch (err: any) {
      setError(err.message || '更新に失敗しました');
    } finally {
      setLoading(false);
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
        }}>
          プロフィール編集
        </h1>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          キャンセル
        </button>
      </div>

      <div style={{
        padding: '20px',
      }}>
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}>
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
                書類画像（変更する場合のみ選択）
              </h3>

              <ImageUpload
                label="営業許可証"
                value={exhibitor.business_license_image_url}
                onFileSelect={(file) => handleImageSelect('businessLicenseImage', file)}
              />

              <ImageUpload
                label="車検証"
                value={exhibitor.vehicle_inspection_image_url}
                onFileSelect={(file) => handleImageSelect('vehicleInspectionImage', file)}
              />

              <ImageUpload
                label="自賠責保険"
                value={exhibitor.automobile_inspection_image_url}
                onFileSelect={(file) => handleImageSelect('automobileInspectionImage', file)}
              />

              <ImageUpload
                label="PL保険"
                value={exhibitor.pl_insurance_image_url}
                onFileSelect={(file) => handleImageSelect('plInsuranceImage', file)}
              />

              <ImageUpload
                label="消防設備配置図"
                value={exhibitor.fire_equipment_layout_image_url}
                onFileSelect={(file) => handleImageSelect('fireEquipmentLayoutImage', file)}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#5DABA8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '20px',
              }}
            >
              更新する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

