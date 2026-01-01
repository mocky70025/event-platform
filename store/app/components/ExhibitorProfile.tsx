'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, LogOut, FileText, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-sky-500"></div>
      </div>
    );
  }

  if (!exhibitor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 p-4">
        <Card className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              出店者情報が登録されていません
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              情報を登録してイベントに申し込みましょう
            </p>
            <Button
              onClick={() => router.push('/register')}
              className="h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
            >
              情報を登録する
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                プロフィール
              </h1>
              <p className="text-sm text-gray-600">
                あなたの情報と登録書類
              </p>
            </div>
            <Button
              onClick={handleSignOut}
              className="h-9 bg-white border border-gray-300 hover:bg-sky-50 text-gray-700 text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <Card className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-semibold">
                {exhibitor.name[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {exhibitor.name}
                </h2>
                <p className="text-sm text-gray-600 mb-4">{exhibitor.email}</p>
                <Button
                  className="h-9 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  プロフィール編集
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  氏名
                </label>
                <p className="text-base font-medium text-gray-900">
                  {exhibitor.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  性別
                </label>
                <p className="text-base font-medium text-gray-900">
                  {exhibitor.gender}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  年齢
                </label>
                <p className="text-base font-medium text-gray-900">
                  {exhibitor.age}歳
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  電話番号
                </label>
                <p className="text-base font-medium text-gray-900">
                  {exhibitor.phone_number}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  ジャンル
                </label>
                <p className="text-base font-medium text-gray-900">
                  {exhibitor.genre_category || exhibitor.genre_free_text || '未設定'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">登録書類</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Object.entries(documentLabels).map(([key, label]) => {
                const url = exhibitor[key as keyof ExhibitorData];
                const hasDocument = Boolean(url);
                
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-sky-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {hasDocument ? (
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600">
                          {hasDocument ? '登録済み' : '未登録'}
                        </p>
                      </div>
                    </div>
                    {hasDocument && (
                      <Button
                        className="h-8 bg-white border border-gray-300 hover:bg-sky-50 text-gray-700 text-sm font-medium rounded-lg px-3 transition-colors"
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
                className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
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
