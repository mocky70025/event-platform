'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, LogOut, FileText } from 'lucide-react';

interface ExhibitorData {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone_number: string;
  email: string;
  genre_category: string | null;
  genre_free_text: string | null;
  business_license_image_url: string | null;
  vehicle_inspection_image_url: string | null;
  automobile_inspection_image_url: string | null;
  pl_insurance_image_url: string | null;
  fire_equipment_layout_image_url: string | null;
}

const documentLabels = {
  business_license_image_url: '営業許可証',
  vehicle_inspection_image_url: '車検証',
  automobile_inspection_image_url: '自賠責保険',
  pl_insurance_image_url: 'PL保険',
  fire_equipment_layout_image_url: '消防設備配置図',
};

export default function ExhibitorProfile() {
  const router = useRouter();
  const [exhibitor, setExhibitor] = useState<ExhibitorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExhibitorData();
  }, []);

  const fetchExhibitorData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setExhibitor(data);
    } catch (error) {
      console.error('出店者情報取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-[#5DABA8] font-medium">読み込み中...</div>
      </div>
    );
  }

  if (!exhibitor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              出店者情報が登録されていません
            </h3>
            <p className="text-gray-600 mb-6">
              情報を登録してイベントに申し込みましょう
            </p>
            <Button
              onClick={() => router.push('/register')}
              className="bg-[#5DABA8] hover:bg-[#4A9693]"
            >
              情報を登録する
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            プロフィール
          </h1>
          <p className="text-gray-600">
            あなたの情報と登録書類
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* プロフィールヘッダー */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7FCAC5] to-[#5DABA8] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {exhibitor.name[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {exhibitor.name}
                </h2>
                <p className="text-gray-600 mb-3">{exhibitor.email}</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-2 border-[#5DABA8] text-[#5DABA8] hover:bg-[#F0F9F9]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    プロフィール編集
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    ログアウト
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 基本情報 */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  氏名
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {exhibitor.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  性別
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {exhibitor.gender}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  年齢
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {exhibitor.age}歳
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  電話番号
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {exhibitor.phone_number}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-1">
                  ジャンル
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {exhibitor.genre_category || exhibitor.genre_free_text || '未設定'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 登録書類 */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">登録書類</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(documentLabels).map(([key, label]) => {
                const url = exhibitor[key as keyof ExhibitorData];
                const hasDocument = Boolean(url);
                
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {hasDocument ? (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-2xl">✓</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600">
                          {hasDocument ? '登録済み' : '未登録'}
                        </p>
                      </div>
                    </div>
                    {hasDocument && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-[#5DABA8] text-[#5DABA8] hover:bg-[#F0F9F9]"
                      >
                        確認
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6">
              <Button
                className="w-full bg-[#5DABA8] hover:bg-[#4A9693]"
              >
                書類を更新
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}