'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import ProgressBar from './ProgressBar';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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
  businessLicenseExpiry?: string;
  vehicleInspectionExpiry?: string;
  automobileInspectionExpiry?: string;
  plInsuranceExpiry?: string;
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
    businessLicenseExpiry: '',
    vehicleInspectionExpiry: '',
    automobileInspectionExpiry: '',
    plInsuranceExpiry: '',
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
      businessLicenseExpiry: formData.businessLicenseExpiry,
      vehicleInspectionExpiry: formData.vehicleInspectionExpiry,
      automobileInspectionExpiry: formData.automobileInspectionExpiry,
      plInsuranceExpiry: formData.plInsuranceExpiry,
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

  const handleRecognized = (field: keyof FormData, data: any) => {
    if (!data) return;
    
    console.log(`Recognized data for ${field}:`, data);

    let expiry = '';
    // APIのプロンプト定義に基づくキー名
    if (field === 'businessLicenseExpiry') {
        expiry = data['有効期限'] || data['有効期間'] || '';
    } else if (field === 'vehicleInspectionExpiry') {
        expiry = data['車検有効期限'] || data['有効期限'] || data['有効期間の満了する日'] || '';
    } else if (field === 'automobileInspectionExpiry') {
        expiry = data['保険期間'] || data['有効期限'] || '';
    } else if (field === 'plInsuranceExpiry') {
        expiry = data['保険期間'] || data['有効期限'] || '';
    }

    if (expiry) {
        setFormData(prev => ({ ...prev, [field]: expiry }));
        // 非同期更新のため、saveDraftはuseEffectで監視するか、ここで新しいstateを使って呼ぶ必要があるが
        // 簡易的にここでもセットする（ただしprevには依存できないので注意）
        // 今回はhandleInputChangeと同様の更新フローに乗せるため、以下のようにする
    }
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
      console.log('Registration attempt - User ID:', user?.id);
      
      if (!user) {
        // セッション切れの可能性があるので、もう一度取得を試みる
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Session recovered - User ID:', session.user.id);
          // 続行
        } else {
          throw new Error('ログインが必要です。再度ログインしてください。');
        }
      }

      const userId = user?.id || (await supabase.auth.getSession()).data.session?.user.id;
      if (!userId) throw new Error('ユーザーIDの取得に失敗しました');

      // 画像アップロード処理
      const imageUrls: Record<string, string | null> = {};
      const imageFields = [
        { key: 'businessLicenseImage', name: 'business_license' },
        { key: 'vehicleInspectionImage', name: 'vehicle_inspection' },
        { key: 'automobileInspectionImage', name: 'automobile_inspection' },
        { key: 'plInsuranceImage', name: 'pl_insurance' },
        { key: 'fireEquipmentLayoutImage', name: 'fire_equipment_layout' },
      ];

      for (const field of imageFields) {
        const file = (formData as any)[field.key];
        if (file) {
          const url = await uploadImage(file, `exhibitors/${userId}/${field.name}`);
          imageUrls[`${field.key}Url`] = url;
        }
      }

      // 出店者データの保存
      console.log('Inserting exhibitor data for:', userId);
      const { error: insertError } = await supabase
        .from('exhibitors')
        .insert({
          user_id: userId,
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
        <LoadingSpinner />
        <p className="mt-4 text-sm text-gray-600">登録処理中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 p-6 pb-20">
      <Card className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="pt-8 pb-8 px-6 md:px-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              出店者情報登録
            </h1>
            <p className="text-sm text-gray-600">
              ステップ {currentStep} / 3
            </p>
          </div>

          <ProgressBar currentStep={currentStep} totalSteps={3} />

          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-2 block">
                    性別 <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger id="gender" className="h-10">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                      <SelectItem value="それ以外">それ以外</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-2 block">
                    年齢 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    required
                    min="0"
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                    電話番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    メールアドレス <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="genreCategory" className="text-sm font-medium text-gray-700 mb-2 block">
                    ジャンル（カテゴリ）
                  </Label>
                  <Input
                    id="genreCategory"
                    type="text"
                    value={formData.genreCategory}
                    onChange={(e) => handleInputChange('genreCategory', e.target.value)}
                    placeholder="例: 飲食、雑貨、アート"
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="genreFreeText" className="text-sm font-medium text-gray-700 mb-2 block">
                    ジャンル（自由記述）
                  </Label>
                  <Textarea
                    id="genreFreeText"
                    value={formData.genreFreeText}
                    onChange={(e) => handleInputChange('genreFreeText', e.target.value)}
                    placeholder="ジャンルの詳細を記入してください"
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="space-y-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-900">書類アップロード</h2>
              <p className="text-sm text-gray-600">
                画像をアップロードすると、AIが有効期限などを自動認識します。認識結果が誤っている場合は修正してください。
              </p>

              <div className="space-y-5">
                <div>
                  <ImageUpload
                    label="営業許可証"
                    onFileSelect={(file) => handleImageSelect('businessLicenseImage', file)}
                    enableOCR={true}
                    documentType="businessLicense"
                    onRecognized={(data) => handleRecognized('businessLicenseExpiry', data)}
                  />
                  {(formData.businessLicenseImage || formData.businessLicenseExpiry) && (
                    <div className="mt-2 ml-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                       <Label className="text-xs font-semibold text-gray-700">有効期限 (自動認識)</Label>
                       <Input 
                         value={formData.businessLicenseExpiry || ''} 
                         onChange={(e) => handleInputChange('businessLicenseExpiry', e.target.value)}
                         placeholder="例: 2025年12月31日"
                         className="h-9 mt-1 text-sm bg-white"
                       />
                    </div>
                  )}
                </div>

                <div>
                  <ImageUpload
                    label="車検証"
                    onFileSelect={(file) => handleImageSelect('vehicleInspectionImage', file)}
                    enableOCR={true}
                    documentType="vehicleInspection"
                    onRecognized={(data) => handleRecognized('vehicleInspectionExpiry', data)}
                  />
                  {(formData.vehicleInspectionImage || formData.vehicleInspectionExpiry) && (
                    <div className="mt-2 ml-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                       <Label className="text-xs font-semibold text-gray-700">車検有効期限 (自動認識)</Label>
                       <Input 
                         value={formData.vehicleInspectionExpiry || ''} 
                         onChange={(e) => handleInputChange('vehicleInspectionExpiry', e.target.value)}
                         placeholder="例: 2025年12月31日"
                         className="h-9 mt-1 text-sm bg-white"
                       />
                    </div>
                  )}
                </div>

                <div>
                  <ImageUpload
                    label="自賠責保険"
                    onFileSelect={(file) => handleImageSelect('automobileInspectionImage', file)}
                    enableOCR={true}
                    documentType="automobileInspection"
                    onRecognized={(data) => handleRecognized('automobileInspectionExpiry', data)}
                  />
                  {(formData.automobileInspectionImage || formData.automobileInspectionExpiry) && (
                    <div className="mt-2 ml-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                       <Label className="text-xs font-semibold text-gray-700">保険期間 (自動認識)</Label>
                       <Input 
                         value={formData.automobileInspectionExpiry || ''} 
                         onChange={(e) => handleInputChange('automobileInspectionExpiry', e.target.value)}
                         placeholder="例: 2025年12月31日"
                         className="h-9 mt-1 text-sm bg-white"
                       />
                    </div>
                  )}
                </div>

                <div>
                  <ImageUpload
                    label="PL保険"
                    onFileSelect={(file) => handleImageSelect('plInsuranceImage', file)}
                    enableOCR={true}
                    documentType="plInsurance"
                    onRecognized={(data) => handleRecognized('plInsuranceExpiry', data)}
                  />
                  {(formData.plInsuranceImage || formData.plInsuranceExpiry) && (
                    <div className="mt-2 ml-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                       <Label className="text-xs font-semibold text-gray-700">保険期間 (自動認識)</Label>
                       <Input 
                         value={formData.plInsuranceExpiry || ''} 
                         onChange={(e) => handleInputChange('plInsuranceExpiry', e.target.value)}
                         placeholder="例: 2025年12月31日"
                         className="h-9 mt-1 text-sm bg-white"
                       />
                    </div>
                  )}
                </div>

                <ImageUpload
                  label="消防設備配置図"
                  onFileSelect={(file) => handleImageSelect('fireEquipmentLayoutImage', file)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Terms */}
          {currentStep === 3 && (
            <div className="space-y-6 mt-8">
              <h2 className="text-lg font-semibold text-gray-900">利用規約確認</h2>

              <div className="p-5 bg-sky-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <h3 className="text-base font-semibold mb-3 text-gray-900">利用規約</h3>
                <div className="text-sm leading-relaxed text-gray-600 space-y-3">
                  <p>本サービスをご利用いただくにあたり、以下の利用規約に同意していただく必要があります。</p>
                  <p>1. 出店者は、提供する情報が正確であることを保証します。</p>
                  <p>2. 出店者は、必要な書類を適切に提出する責任があります。</p>
                  <p>3. 主催者は、出店者の申請を承認または却下する権利を有します。</p>
                  <p>4. 個人情報は適切に管理され、本サービスの目的のみに使用されます。</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                  利用規約に同意します <span className="text-red-500">*</span>
                </Label>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-10 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                className="flex-1 h-10 bg-white border border-gray-300 hover:bg-sky-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                戻る
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="flex-1 h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                次へ進む
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                登録を完了する
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
