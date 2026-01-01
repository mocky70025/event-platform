'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import ProgressBar from './ProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

  useEffect(() => {
    const saved = sessionStorage.getItem('organizer_draft');
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
    sessionStorage.setItem('organizer_draft', JSON.stringify(formData));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    saveDraft();
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
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
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

      sessionStorage.removeItem('organizer_draft');
      router.push('/');
    } catch (err: any) {
      setError(err.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E58A7B] border-t-transparent mb-4"></div>
        <p className="text-[#E58A7B] font-medium">登録処理中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      <Card className="max-w-3xl mx-auto shadow-2xl border-t-4 border-[#E58A7B]">
        <CardContent className="pt-8 pb-8 px-6 md:px-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              主催者情報登録
            </h1>
            <p className="text-gray-600">
              ステップ {currentStep} / 2
            </p>
          </div>

          <ProgressBar currentStep={currentStep} totalSteps={2} />

          {error && (
            <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r text-sm flex items-start gap-3 animate-in slide-in-from-top">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
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
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    組織名 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
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
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
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
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ステップ2: 利用規約確認 */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-5">利用規約確認</h2>

              <div className="p-5 bg-gray-100 rounded-lg mb-5 max-h-96 overflow-y-auto">
                <h3 className="text-base font-bold mb-3">利用規約</h3>
                <div className="text-sm leading-relaxed text-gray-600 space-y-3">
                  <p>本サービスをご利用いただくにあたり、以下の利用規約に同意していただく必要があります。</p>
                  <p>1. 主催者は、提供する情報が正確であることを保証します。</p>
                  <p>2. 主催者は、イベント情報を適切に管理する責任があります。</p>
                  <p>3. 主催者は、出店者の申請を公平に審査する義務があります。</p>
                  <p>4. 個人情報は適切に管理され、本サービスの目的のみに使用されます。</p>
                  <p>5. 管理者による承認後、イベントを作成できるようになります。</p>
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

          <div className="flex gap-4 mt-10 pt-6 border-t">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-12 text-base border-2 border-gray-300 hover:bg-gray-50"
              >
                ← 戻る
              </Button>
            )}
            {currentStep < 2 ? (
              <Button
                onClick={handleNext}
                className="flex-1 h-12 text-base font-semibold bg-[#E58A7B] hover:bg-[#D4796A] shadow-lg hover:shadow-xl transition-all"
              >
                次へ進む →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-[#E58A7B] to-[#D4796A] hover:from-[#D4796A] hover:to-[#C3685A] shadow-lg hover:shadow-xl transition-all"
              >
                ✓ 登録を完了する
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
