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
  businessLicenseImageUrl: string | null;
  vehicleInspectionImageUrl: string | null;
  automobileInspectionImageUrl: string | null;
  plInsuranceImageUrl: string | null;
  fireEquipmentLayoutImageUrl: string | null;
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
    businessLicenseImageUrl: null,
    vehicleInspectionImageUrl: null,
    automobileInspectionImageUrl: null,
    plInsuranceImageUrl: null,
    fireEquipmentLayoutImageUrl: null,
    businessLicenseExpiry: '',
    vehicleInspectionExpiry: '',
    automobileInspectionExpiry: '',
    plInsuranceExpiry: '',
  });

  const [userProfile, setUserProfile] = useState<{ userId: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserProfile({ userId: user.id });
      }
    };
    fetchUser();
  }, []);

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
      ...formData
    };
    sessionStorage.setItem('exhibitor_draft', JSON.stringify(draft));
  };

  const removeDraft = () => {
    sessionStorage.removeItem('exhibitor_draft');
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    saveDraft();
  };

  const handleImageUpload = (field: keyof FormData, url: string) => {
    setFormData(prev => ({ ...prev, [field]: url }));
    saveDraft();

    if (field === 'businessLicenseImageUrl') {
      verifyBusinessLicense(url);
    }
  };

  const verifyBusinessLicense = async (imageUrl: string) => {
    try {
      // APIを呼び出して有効期限を確認
      const response = await fetch('/api/events/verify-business-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      
      if (!response.ok) throw new Error('Verification failed');
      
      const data = await response.json();
      if (data.expirationDate) {
        setFormData(prev => ({ ...prev, businessLicenseExpiry: data.expirationDate }));
      }
      
      if (data.result === 'no') {
        alert('営業許可証の有効期限が切れている、または無効な可能性があります。確認してください。');
      }
    } catch (e) {
      console.error('License verification error:', e);
    }
  };

  const convertToHalfWidth = (str: string): string => {
    return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const halfWidth = convertToHalfWidth(phone.replace(/-/g, ''));
    return /^\d+$/.test(halfWidth) && halfWidth.length >= 10 && halfWidth.length <= 15;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.gender || !formData.age || !formData.phoneNumber || !formData.email) {
      setError('すべての必須項目を入力してください');
      return false;
    }
    
    // 年齢の正規化チェック
    const normalizedAge = convertToHalfWidth(formData.age);
    if (isNaN(Number(normalizedAge)) || Number(normalizedAge) < 0 || Number(normalizedAge) > 100) {
      setError('年齢は正の数で正しく入力してください（0-100歳）');
      return false;
    }

    // 電話番号バリデーション
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setError('電話番号の形式が正しくありません（半角数字、ハイフンなしで10-15桁）');
      return false;
    }

    // メールアドレスバリデーション
    if (!validateEmail(formData.email)) {
      setError('メールアドレスの形式が正しくありません');
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

    // バリデーションチェック
    if (!validateStep1()) {
      return;
    }

    // 画像の必須チェック
    const requiredImages = [
      formData.businessLicenseImageUrl,
      formData.vehicleInspectionImageUrl,
      formData.automobileInspectionImageUrl,
      formData.plInsuranceImageUrl,
      formData.fireEquipmentLayoutImageUrl
    ];

    if (requiredImages.some(img => !img)) {
      setError('すべての必要書類画像をアップロードしてください');
      return;
    }

    setLoading(true);

    try {
      let user = await getCurrentUser();
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('ログインが必要です。再度ログインしてください。');
        }
        user = session.user as any;
      }

      if (!user) throw new Error('ユーザーIDの取得に失敗しました');
      const userId = user.id;

      // 認証タイプに応じて重複登録チェック
      const authType = user.user_metadata?.authType || 'line';
      let existingUser = null;

      if (authType === 'email') {
        const { data } = await supabase
          .from('exhibitors')
          .select('id')
          .eq('user_id', userId)
          .single();
        existingUser = data;
      } else {
        // LINE認証の場合、user_metadataにline_user_idが含まれているか、
        // あるいはexhibitorsテーブルのline_user_idカラムにuserIdを格納する設計か確認が必要。
        // 旧版では line_user_id カラムに userId (Supabase Auth ID) を入れているのか、
        // それとも LINE Provider ID を入れているのか？
        // 旧版コード: .eq('line_user_id', userProfile.userId)
        // ここでは userId を使う。
        const { data } = await supabase
          .from('exhibitors')
          .select('id')
          .eq('line_user_id', userId)
          .single();
        existingUser = data;
      }

      if (existingUser) {
        alert('既に登録済みです。');
        setLoading(false);
        return;
      }

      // 出店者データの保存
      console.log('Inserting exhibitor data for:', userId);
      
      const normalizedAge = parseInt(convertToHalfWidth(formData.age), 10);
      const normalizedPhone = convertToHalfWidth(formData.phoneNumber.replace(/-/g, ''));

      const insertPayload: any = {
        name: formData.name,
        gender: formData.gender,
        age: normalizedAge,
        phone_number: normalizedPhone,
        email: formData.email,
        genre_category: formData.genreCategory || null,
        genre_free_text: formData.genreFreeText || null,
        business_license_image_url: formData.businessLicenseImageUrl || null,
        vehicle_inspection_image_url: formData.vehicleInspectionImageUrl || null,
        automobile_inspection_image_url: formData.automobileInspectionImageUrl || null,
        pl_insurance_image_url: formData.plInsuranceImageUrl || null,
        fire_equipment_layout_image_url: formData.fireEquipmentLayoutImageUrl || null,
      };

      if (authType === 'email') {
        insertPayload.user_id = userId;
      } else {
        insertPayload.line_user_id = userId;
      }

      const { error: insertError } = await supabase
        .from('exhibitors')
        .insert(insertPayload);

      if (insertError) throw insertError;

      // ドラフト削除
      await removeDraft();
      
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
                    value={formData.businessLicenseImageUrl}
                    onUploadComplete={(url) => handleImageUpload('businessLicenseImageUrl', url)}
                    userId={userProfile?.userId}
                    documentType="business_license"
                  />
                  {(formData.businessLicenseImageUrl || formData.businessLicenseExpiry) && (
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
                    value={formData.vehicleInspectionImageUrl}
                    onUploadComplete={(url) => handleImageUpload('vehicleInspectionImageUrl', url)}
                    userId={userProfile?.userId}
                    documentType="vehicle_inspection"
                  />
                  {(formData.vehicleInspectionImageUrl || formData.vehicleInspectionExpiry) && (
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
                    value={formData.automobileInspectionImageUrl}
                    onUploadComplete={(url) => handleImageUpload('automobileInspectionImageUrl', url)}
                    userId={userProfile?.userId}
                    documentType="automobile_inspection"
                  />
                  {(formData.automobileInspectionImageUrl || formData.automobileInspectionExpiry) && (
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
                    value={formData.plInsuranceImageUrl}
                    onUploadComplete={(url) => handleImageUpload('plInsuranceImageUrl', url)}
                    userId={userProfile?.userId}
                    documentType="pl_insurance"
                  />
                  {(formData.plInsuranceImageUrl || formData.plInsuranceExpiry) && (
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

                <div>
                  <ImageUpload
                    label="消防署へのレイアウト提出控え"
                    value={formData.fireEquipmentLayoutImageUrl}
                    onUploadComplete={(url) => handleImageUpload('fireEquipmentLayoutImageUrl', url)}
                    userId={userProfile?.userId}
                    documentType="fire_equipment_layout"
                  />
                </div>
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
