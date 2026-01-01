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

interface EventFormData {
  // Step 1: 基本情報
  eventName: string;
  eventNameKana: string;
  genre: string;
  shizuokaAssociation: boolean;
  newspaperOptOut: boolean;

  // Step 2: 日程・時間
  eventStartDate: string;
  eventEndDate: string;
  displayPeriod: string;
  eventTime: string;
  scheduleRemarks: string;

  // Step 3: 申し込み期間
  applicationStartDate: string;
  applicationEndDate: string;
  applicationDisplayPeriod: string;
  applicationRemarks: string;

  // Step 4: チケット情報
  ticketSaleStartDate: string;
  salesLocation: string;

  // Step 5: イベント内容
  leadText: string;
  eventDescription: string;
  introductionText: string;

  // Step 6: 会場情報
  venueName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;

  // Step 7: 画像
  mainImageUrl: string | null;
  imageCaption: string;
}

interface EventFormProps {
  eventId?: string;
  initialData?: Partial<EventFormData>;
}

export default function EventForm({ eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    eventNameKana: '',
    genre: '',
    shizuokaAssociation: false,
    newspaperOptOut: false,
    eventStartDate: '',
    eventEndDate: '',
    displayPeriod: '',
    eventTime: '',
    scheduleRemarks: '',
    applicationStartDate: '',
    applicationEndDate: '',
    applicationDisplayPeriod: '',
    applicationRemarks: '',
    ticketSaleStartDate: '',
    salesLocation: '',
    leadText: '',
    eventDescription: '',
    introductionText: '',
    venueName: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    mainImageUrl: null,
    imageCaption: '',
    ...initialData,
  });

  useEffect(() => {
    checkOrganizer();
    const saved = sessionStorage.getItem('event_draft');
    if (saved && !initialData) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  const checkOrganizer = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('organizers')
        .select('id, is_approved')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (!data.is_approved) {
        setError('承認待ちのため、イベントを作成できません');
        return;
      }

      setOrganizerId(data.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveDraft = () => {
    sessionStorage.setItem('event_draft', JSON.stringify(formData));
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    saveDraft();
  };

  const validateStep = (step: number): boolean => {
    setError('');
    switch (step) {
      case 1:
        if (!formData.eventName) {
          setError('イベント名は必須です');
          return false;
        }
        return true;
      case 2:
        if (!formData.eventStartDate || !formData.eventEndDate) {
          setError('開始日と終了日は必須です');
          return false;
        }
        return true;
      case 5:
        if (!formData.leadText || !formData.eventDescription) {
          setError('リードテキストと説明は必須です');
          return false;
        }
        return true;
      case 6:
        if (!formData.venueName) {
          setError('会場名は必須です');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    if (!organizerId) {
      setError('主催者情報が見つかりません');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const eventData = {
        organizer_id: organizerId,
        event_name: formData.eventName,
        event_name_kana: formData.eventNameKana,
        genre: formData.genre,
        shizuoka_association: formData.shizuokaAssociation,
        newspaper_opt_out: formData.newspaperOptOut,
        event_start_date: formData.eventStartDate,
        event_end_date: formData.eventEndDate,
        display_period: formData.displayPeriod,
        event_time: formData.eventTime,
        schedule_remarks: formData.scheduleRemarks,
        application_start_date: formData.applicationStartDate,
        application_end_date: formData.applicationEndDate,
        application_display_period: formData.applicationDisplayPeriod,
        application_remarks: formData.applicationRemarks,
        ticket_sale_start_date: formData.ticketSaleStartDate,
        sales_location: formData.salesLocation,
        lead_text: formData.leadText,
        event_description: formData.eventDescription,
        introduction_text: formData.introductionText,
        venue_name: formData.venueName,
        postal_code: formData.postalCode,
        prefecture: formData.prefecture,
        city: formData.city,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        main_image_url: formData.mainImageUrl,
        image_caption: formData.imageCaption,
        approval_status: 'pending',
      };

      if (eventId) {
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('events')
          .insert(eventData);

        if (insertError) throw insertError;
      }

      sessionStorage.removeItem('event_draft');
      router.push('/events');
    } catch (err: any) {
      setError(err.message || 'イベントの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (file: File) => {
    setLoading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const url = await uploadImage('images', fileName, file);
      handleInputChange('mainImageUrl', url);
    } catch (err: any) {
      setError(err.message || '画像のアップロードに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading && currentStep === 1) {
    return <LoadingSpinner />;
  }

  if (error && !organizerId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="bg-organizer hover:bg-organizer-dark">
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-5 text-center">
            {eventId ? 'イベント編集' : 'イベント作成'}
          </h1>

          <ProgressBar currentStep={currentStep} totalSteps={7} />

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
                    イベント名 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => handleInputChange('eventName', e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    イベント名（ふりがな）
                  </label>
                  <input
                    type="text"
                    value={formData.eventNameKana}
                    onChange={(e) => handleInputChange('eventNameKana', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">ジャンル</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shizuokaAssociation}
                    onChange={(e) => handleInputChange('shizuokaAssociation', e.target.checked)}
                    className="w-5 h-5 mr-2"
                  />
                  <span className="text-sm">静岡県職業能力開発協会関連</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.newspaperOptOut}
                    onChange={(e) => handleInputChange('newspaperOptOut', e.target.checked)}
                    className="w-5 h-5 mr-2"
                  />
                  <span className="text-sm">新聞掲載オプトアウト</span>
                </label>
              </div>
            </div>
          )}

          {/* ステップ2: 日程・時間 */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-5">日程・時間</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    開始日 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.eventStartDate}
                    onChange={(e) => handleInputChange('eventStartDate', e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    終了日 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.eventEndDate}
                    onChange={(e) => handleInputChange('eventEndDate', e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">表示期間</label>
                  <input
                    type="text"
                    value={formData.displayPeriod}
                    onChange={(e) => handleInputChange('displayPeriod', e.target.value)}
                    placeholder="例: 10:00-18:00"
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">時間</label>
                  <input
                    type="text"
                    value={formData.eventTime}
                    onChange={(e) => handleInputChange('eventTime', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">備考</label>
                  <textarea
                    value={formData.scheduleRemarks}
                    onChange={(e) => handleInputChange('scheduleRemarks', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ステップ3: 申し込み期間 */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-lg font-bold mb-5">申し込み期間</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">申し込み開始日</label>
                  <input
                    type="date"
                    value={formData.applicationStartDate}
                    onChange={(e) => handleInputChange('applicationStartDate', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">申し込み終了日</label>
                  <input
                    type="date"
                    value={formData.applicationEndDate}
                    onChange={(e) => handleInputChange('applicationEndDate', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">表示期間</label>
                  <input
                    type="text"
                    value={formData.applicationDisplayPeriod}
                    onChange={(e) => handleInputChange('applicationDisplayPeriod', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">備考</label>
                  <textarea
                    value={formData.applicationRemarks}
                    onChange={(e) => handleInputChange('applicationRemarks', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ステップ4: チケット情報 */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-lg font-bold mb-5">チケット情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">発売開始日</label>
                  <input
                    type="date"
                    value={formData.ticketSaleStartDate}
                    onChange={(e) => handleInputChange('ticketSaleStartDate', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">販売場所</label>
                  <textarea
                    value={formData.salesLocation}
                    onChange={(e) => handleInputChange('salesLocation', e.target.value)}
                    rows={3}
                    placeholder="チケット販売場所を入力してください"
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ステップ5: イベント内容 */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-lg font-bold mb-5">イベント内容</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    リードテキスト <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={formData.leadText}
                    onChange={(e) => handleInputChange('leadText', e.target.value)}
                    rows={3}
                    required
                    placeholder="イベントの要約を入力してください"
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    説明 <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={formData.eventDescription}
                    onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                    rows={5}
                    required
                    placeholder="イベントの詳細を入力してください"
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">紹介文</label>
                  <textarea
                    value={formData.introductionText}
                    onChange={(e) => handleInputChange('introductionText', e.target.value)}
                    rows={4}
                    placeholder="イベントの紹介文を入力してください"
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ステップ6: 会場情報 */}
          {currentStep === 6 && (
            <div>
              <h2 className="text-lg font-bold mb-5">会場情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    会場名 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.venueName}
                    onChange={(e) => handleInputChange('venueName', e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">郵便番号</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="例: 123-4567"
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">都道府県</label>
                  <input
                    type="text"
                    value={formData.prefecture}
                    onChange={(e) => handleInputChange('prefecture', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">市区町村</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">住所</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">緯度</label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      placeholder="例: 35.6762"
                      className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">経度</label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      placeholder="例: 139.6503"
                      className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ステップ7: 画像アップロード */}
          {currentStep === 7 && (
            <div>
              <h2 className="text-lg font-bold mb-5">画像アップロード</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">メイン画像</label>
                  <ImageUpload
                    label="メイン画像"
                    value={formData.mainImageUrl || undefined}
                    onFileSelect={handleImageSelect}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">画像キャプション</label>
                  <input
                    type="text"
                    value={formData.imageCaption}
                    onChange={(e) => handleInputChange('imageCaption', e.target.value)}
                    placeholder="画像の説明を入力してください"
                    className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ボタン */}
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
            {currentStep < 7 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-organizer hover:bg-organizer-dark"
              >
                次へ
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-organizer hover:bg-organizer-dark"
              >
                {loading ? '保存中...' : eventId ? '更新する' : '作成する'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
