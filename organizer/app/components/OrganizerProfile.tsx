'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Edit, LogOut } from 'lucide-react';

interface OrganizerData {
  id: string;
  name: string;
  organization_name: string;
  phone_number: string;
  email: string;
  is_approved: boolean;
}

export default function OrganizerProfile() {
  const router = useRouter();
  const [organizer, setOrganizer] = useState<OrganizerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setOrganizer(data);
    } catch (error) {
      console.error('主催者情報取得エラー:', error);
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

  if (!organizer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">主催者情報が登録されていません</p>
            <Button
              onClick={() => router.push('/register')}
              className="bg-organizer hover:bg-organizer-dark"
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
            className="bg-organizer hover:bg-organizer-dark"
          >
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* 承認ステータス */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">承認ステータス</span>
              <StatusBadge
                status={organizer.is_approved ? 'approved' : 'pending'}
              />
            </div>
            {!organizer.is_approved && (
              <p className="mt-3 text-sm text-gray-600 bg-orange-50 p-3 rounded">
                管理者による承認待ちです。承認されるとイベントを作成できるようになります。
              </p>
            )}
          </CardContent>
        </Card>

        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-gray-600">名前</span>
              <span className="font-medium">{organizer.name}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-gray-600">組織名</span>
              <span className="font-medium">{organizer.organization_name}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-gray-600">電話番号</span>
              <span className="font-medium">{organizer.phone_number}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="text-gray-600">メール</span>
              <span className="font-medium break-all">{organizer.email}</span>
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
