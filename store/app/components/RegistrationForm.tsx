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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-5 text-center">
            出店者情報登録
          </h1>

          <ProgressBar currentStep={currentStep} totalSteps={3} />

          {error && (
            <div className="p-3 mb-5 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* ステップ1: 基本情報 */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-bold mb-5">基本情報</h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    名前 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    性別 <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="それ以外">それ以外</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    年齢 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    required
                    min="0"
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    電話番号 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    メールアドレス <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    ジャンル（カテゴリ）
                  </label>
                  <input
                    type="text"
                    value={formData.genreCategory}
                    onChange={(e) => handleInputChange('genreCategory', e.target.value)}
                    placeholder="例: 飲食、雑貨、アート"
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    ジャンル（自由記述）
                  </label>
                  <textarea
                    value={formData.genreFreeText}
                    onChange={(e) => handleInputChange('genreFreeText', e.target.value)}
                    placeholder="ジャンルの詳細を記入してください"
                    rows={4}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ステップ2: 書類アップロード */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-5">書類アップロード</h2>

              <ImageUpload
                label="営業許可証"
                onFileSelect={(file) => handleImageSelect('businessLicenseImage', file)}
                enableOCR={true}
                documentType="businessLicense"
                onRecognized={(data) => {
                  console.log('営業許可証認識結果:', data);
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
              <h2 className="text-lg font-bold mb-5">利用規約確認</h2>

              <div className="p-5 bg-gray-100 rounded-lg mb-5 max-h-96 overflow-y-auto">
                <h3 className="text-base font-bold mb-3">利用規約</h3>
                <div className="text-sm leading-relaxed text-gray-600 space-y-3">
                  <p>本サービスをご利用いただくにあたり、以下の利用規約に同意していただく必要があります。</p>
                  <p>1. 出店者は、提供する情報が正確であることを保証します。</p>
                  <p>2. 出店者は、必要な書類を適切に提出する責任があります。</p>
                  <p>3. 主催者は、出店者の申請を承認または却下する権利を有します。</p>
                  <p>4. 個人情報は適切に管理され、本サービスの目的のみに使用されます。</p>
                </div>
              </div>

              <label className="flex items-center mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm">
                  利用規約に同意します <span className="text-red-600">*</span>
                </span>
              </label>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="secondary"
                className="flex-1"
              >
                戻る
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-store hover:bg-store-dark"
              >
                次へ
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-store hover:bg-store-dark"
              >
                登録する
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
