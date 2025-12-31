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
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!exhibitor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">出店者情報が登録されていません</p>
            <Button
              onClick={() => router.push('/register')}
              className="bg-store hover:bg-store-dark"
            >
              情報を登録する
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">プロフィール</h1>
          <Button
            onClick={() => router.push('/profile/edit')}
            size="sm"
            className="bg-store hover:bg-store-dark"
          >
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-gray-600">名前</span>
              <span className="font-medium">{exhibitor.name}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-gray-600">性別</span>
              <span className="font-medium">{exhibitor.gender}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-gray-600">年齢</span>
              <span className="font-medium">{exhibitor.age}歳</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-gray-600">電話番号</span>
              <span className="font-medium">{exhibitor.phone_number}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-gray-600">メール</span>
              <span className="font-medium break-all">{exhibitor.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* ジャンル情報 */}
        {(exhibitor.genre_category || exhibitor.genre_free_text) && (
          <Card>
            <CardHeader>
              <CardTitle>ジャンル情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exhibitor.genre_category && (
                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span className="text-gray-600">カテゴリ</span>
                  <span className="font-medium">{exhibitor.genre_category}</span>
                </div>
              )}
              {exhibitor.genre_free_text && (
                <div className="text-sm">
                  <span className="text-gray-600 block mb-1">詳細</span>
                  <p className="font-medium whitespace-pre-wrap">
                    {exhibitor.genre_free_text}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 登録書類 */}
        <Card>
          <CardHeader>
            <CardTitle>登録書類</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(documentLabels).map(([key, label]) => {
                const url = exhibitor[key as keyof ExhibitorData] as string | null;
                return (
                  <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={url}
                          alt={label}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-gray-50 text-xs text-center text-gray-700">
                          {label}
                        </div>
                      </a>
                    ) : (
                      <div className="h-32 flex items-center justify-center bg-gray-100">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ログアウトボタン */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full text-red-600 border-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          ログアウト
        </Button>
      </main>
    </div>
  );
}
