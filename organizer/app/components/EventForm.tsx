'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import ProgressBar from './ProgressBar';
import ImageUpload from './ImageUpload';
import LoadingSpinner from './LoadingSpinner';

interface EventFormProps {
  eventId?: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function EventForm({ eventId, onComplete, onCancel }: EventFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    eventName: '',
    eventNameFurigana: '',
    genre: '',
    isShizuokaVocationalAssocRelated: false,
    optOutNewspaperPublication: false,
    eventStartDate: '',
    eventEndDate: '',
    eventDisplayPeriod: '',
    eventPeriodNotes: '',
    eventTime: '',
    schedules: [] as any[],
    applicationStartDate: '',
    applicationEndDate: '',
    applicationDisplayPeriod: '',
    applicationNotes: '',
    ticketReleaseStartDate: '',
    ticketSalesLocation: '',
    leadText: '',
    eventDescription: '',
    eventIntroductionText: '',
    venueName: '',
    venuePostalCode: '',
    venueCity: '',
    venueTown: '',
    venueAddress: '',
    venueLatitude: '',
    venueLongitude: '',
    mainImage: null as File | null,
    mainImageCaption: '',
  });

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          eventName: data.event_name || '',
          eventNameFurigana: data.event_name_furigana || '',
          genre: data.genre || '',
          isShizuokaVocationalAssocRelated: data.is_shizuoka_vocational_assoc_related || false,
          optOutNewspaperPublication: data.opt_out_newspaper_publication || false,
          eventStartDate: data.event_start_date || '',
          eventEndDate: data.event_end_date || '',
          eventDisplayPeriod: data.event_display_period || '',
          eventPeriodNotes: data.event_period_notes || '',
          eventTime: data.event_time || '',
          schedules: data.schedules || [],
          applicationStartDate: data.application_start_date || '',
          applicationEndDate: data.application_end_date || '',
          applicationDisplayPeriod: data.application_display_period || '',
          applicationNotes: data.application_notes || '',
          ticketReleaseStartDate: data.ticket_release_start_date || '',
          ticketSalesLocation: data.ticket_sales_location || '',
          leadText: data.lead_text || '',
          eventDescription: data.event_description || '',
          eventIntroductionText: data.event_introduction_text || '',
          venueName: data.venue_name || '',
          venuePostalCode: data.venue_postal_code || '',
          venueCity: data.venue_city || '',
          venueTown: data.venue_town || '',
          venueAddress: data.venue_address || '',
          venueLatitude: data.venue_latitude || '',
          venueLongitude: data.venue_longitude || '',
          mainImage: null,
          mainImageCaption: data.main_image_caption || '',
        });
      }
    } catch (err: any) {
      console.error('Error loading event:', err);
      setError(err.message || 'イベントの読み込みに失敗しました');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('認証されていません');
      }

      const { data: organizer } = await supabase
        .from('organizers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!organizer) {
        throw new Error('主催者情報が登録されていません');
      }

      let mainImageUrl = '';

      if (formData.mainImage) {
        const path = `events/${organizer.id}/${Date.now()}_${formData.mainImage.name}`;
        mainImageUrl = await uploadImage('images', path, formData.mainImage);
      }

      const eventData: any = {
        organizer_id: organizer.id,
        event_name: formData.eventName,
        event_name_furigana: formData.eventNameFurigana,
        genre: formData.genre,
        is_shizuoka_vocational_assoc_related: formData.isShizuokaVocationalAssocRelated,
        opt_out_newspaper_publication: formData.optOutNewspaperPublication,
        event_start_date: formData.eventStartDate,
        event_end_date: formData.eventEndDate,
        event_display_period: formData.eventDisplayPeriod,
        event_period_notes: formData.eventPeriodNotes || null,
        event_time: formData.eventTime || null,
        schedules: formData.schedules.length > 0 ? formData.schedules : null,
        application_start_date: formData.applicationStartDate || null,
        application_end_date: formData.applicationEndDate || null,
        application_display_period: formData.applicationDisplayPeriod || null,
        application_notes: formData.applicationNotes || null,
        ticket_release_start_date: formData.ticketReleaseStartDate || null,
        ticket_sales_location: formData.ticketSalesLocation || null,
        lead_text: formData.leadText,
        event_description: formData.eventDescription,
        event_introduction_text: formData.eventIntroductionText || null,
        venue_name: formData.venueName,
        venue_postal_code: formData.venuePostalCode || null,
        venue_city: formData.venueCity || null,
        venue_town: formData.venueTown || null,
        venue_address: formData.venueAddress || null,
        venue_latitude: formData.venueLatitude || null,
        venue_longitude: formData.venueLongitude || null,
        main_image_caption: formData.mainImageCaption || null,
      };

      if (mainImageUrl) {
        eventData.main_image_url = mainImageUrl;
      }

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

      onComplete();
    } catch (err: any) {
      setError(err.message || 'イベントの保存に失敗しました');
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
      paddingBottom: '100px',
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
          {eventId ? 'イベント編集' : 'イベント作成'}
        </h1>

        <ProgressBar currentStep={currentStep} totalSteps={7} />

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
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>基本情報</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                イベント名 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => handleInputChange('eventName', e.target.value)}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                イベント名（ふりがな）
              </label>
              <input
                type="text"
                value={formData.eventNameFurigana}
                onChange={(e) => handleInputChange('eventNameFurigana', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                ジャンル
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isShizuokaVocationalAssocRelated}
                  onChange={(e) => handleInputChange('isShizuokaVocationalAssocRelated', e.target.checked)}
                  style={{ marginRight: '8px', width: '20px', height: '20px' }}
                />
                <span style={{ fontSize: '14px' }}>静岡県職業能力開発協会関連</span>
              </label>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.optOutNewspaperPublication}
                  onChange={(e) => handleInputChange('optOutNewspaperPublication', e.target.checked)}
                  style={{ marginRight: '8px', width: '20px', height: '20px' }}
                />
                <span style={{ fontSize: '14px' }}>新聞掲載オプトアウト</span>
              </label>
            </div>
          </div>
        )}

        {/* ステップ2: 日程・時間 */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>日程・時間</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                開始日 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.eventStartDate}
                onChange={(e) => handleInputChange('eventStartDate', e.target.value)}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                終了日 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.eventEndDate}
                onChange={(e) => handleInputChange('eventEndDate', e.target.value)}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                表示期間
              </label>
              <input
                type="text"
                value={formData.eventDisplayPeriod}
                onChange={(e) => handleInputChange('eventDisplayPeriod', e.target.value)}
                placeholder="例: 2024年1月1日〜1月31日"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                時間
              </label>
              <input
                type="text"
                value={formData.eventTime}
                onChange={(e) => handleInputChange('eventTime', e.target.value)}
                placeholder="例: 10:00〜18:00"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                備考
              </label>
              <textarea
                value={formData.eventPeriodNotes}
                onChange={(e) => handleInputChange('eventPeriodNotes', e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        )}

        {/* ステップ3: 申し込み期間 */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>申し込み期間</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                申し込み開始日
              </label>
              <input
                type="date"
                value={formData.applicationStartDate}
                onChange={(e) => handleInputChange('applicationStartDate', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                申し込み終了日
              </label>
              <input
                type="date"
                value={formData.applicationEndDate}
                onChange={(e) => handleInputChange('applicationEndDate', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                表示期間
              </label>
              <input
                type="text"
                value={formData.applicationDisplayPeriod}
                onChange={(e) => handleInputChange('applicationDisplayPeriod', e.target.value)}
                placeholder="例: 2024年1月1日〜1月15日"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                備考
              </label>
              <textarea
                value={formData.applicationNotes}
                onChange={(e) => handleInputChange('applicationNotes', e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        )}

        {/* ステップ4: チケット情報 */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>チケット情報</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                発売開始日
              </label>
              <input
                type="date"
                value={formData.ticketReleaseStartDate}
                onChange={(e) => handleInputChange('ticketReleaseStartDate', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                販売場所
              </label>
              <input
                type="text"
                value={formData.ticketSalesLocation}
                onChange={(e) => handleInputChange('ticketSalesLocation', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
          </div>
        )}

        {/* ステップ5: イベント内容 */}
        {currentStep === 5 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>イベント内容</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                リードテキスト <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <textarea
                value={formData.leadText}
                onChange={(e) => handleInputChange('leadText', e.target.value)}
                required
                rows={3}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                説明 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <textarea
                value={formData.eventDescription}
                onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                required
                rows={6}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                紹介文
              </label>
              <textarea
                value={formData.eventIntroductionText}
                onChange={(e) => handleInputChange('eventIntroductionText', e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        )}

        {/* ステップ6: 会場情報 */}
        {currentStep === 6 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>会場情報</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                会場名 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.venueName}
                onChange={(e) => handleInputChange('venueName', e.target.value)}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                郵便番号
              </label>
              <input
                type="text"
                value={formData.venuePostalCode}
                onChange={(e) => handleInputChange('venuePostalCode', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                都道府県
              </label>
              <input
                type="text"
                value={formData.venueCity}
                onChange={(e) => handleInputChange('venueCity', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                市区町村
              </label>
              <input
                type="text"
                value={formData.venueTown}
                onChange={(e) => handleInputChange('venueTown', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                住所
              </label>
              <input
                type="text"
                value={formData.venueAddress}
                onChange={(e) => handleInputChange('venueAddress', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  緯度
                </label>
                <input
                  type="text"
                  value={formData.venueLatitude}
                  onChange={(e) => handleInputChange('venueLatitude', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  経度
                </label>
                <input
                  type="text"
                  value={formData.venueLongitude}
                  onChange={(e) => handleInputChange('venueLongitude', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ステップ7: 画像アップロード */}
        {currentStep === 7 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>画像アップロード</h2>
            <ImageUpload
              label="メイン画像"
              onFileSelect={(file) => handleInputChange('mainImage', file)}
            />
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                画像キャプション
              </label>
              <input
                type="text"
                value={formData.mainImageCaption}
                onChange={(e) => handleInputChange('mainImageCaption', e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          <button
            onClick={onCancel}
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
            キャンセル
          </button>
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
          {currentStep < 7 ? (
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
              保存
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

