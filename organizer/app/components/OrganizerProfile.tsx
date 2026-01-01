'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Edit, LogOut, Building2, User, Phone, Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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
        <div className="animate-pulse text-[#E58A7B] font-medium">読み込み中...</div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              主催者情報が登録されていません
            </h3>
            <p className="text-gray-600 mb-6">
              情報を登録してイベントを作成しましょう
            </p>
            <Button
              onClick={() => router.push('/register')}
              className="bg-[#E58A7B] hover:bg-[#D4796A]"
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
            あなたの主催者情報
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* プロフィールヘッダー */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F5C0B3] to-[#E58A7B] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {organizer.organization_name[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  {organizer.organization_name}
                </h2>
                <p className="text-lg text-gray-600 mb-3">{organizer.name}</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-2 border-[#E58A7B] text-[#E58A7B] hover:bg-[#FFF5F3]"
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

            {/* 承認ステータス */}
            <div className={`p-4 rounded-xl border-2 ${
              organizer.is_approved 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-3">
                {organizer.is_approved ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">承認済み</p>
                      <p className="text-sm text-green-700">イベントの作成が可能です</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-900">承認待ち</p>
                      <p className="text-sm text-orange-700">
                        管理者による承認をお待ちください。承認されるとイベントを作成できるようになります。
                      </p>
                    </div>
                  </>
                )}
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
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF5F3] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-[#E58A7B]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    組織名
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {organizer.organization_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF5F3] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#E58A7B]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    担当者名
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {organizer.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF5F3] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#E58A7B]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    電話番号
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {organizer.phone_number}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF5F3] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#E58A7B]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    メールアドレス
                  </label>
                  <p className="text-lg font-semibold text-gray-900 break-all">
                    {organizer.email}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アクティビティ統計（ダミー） */}
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">活動統計</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-[#E58A7B] mb-1">0</p>
                <p className="text-sm text-gray-600">作成イベント</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-[#E58A7B] mb-1">0</p>
                <p className="text-sm text-gray-600">開催中</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-[#E58A7B] mb-1">0</p>
                <p className="text-sm text-gray-600">総応募数</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-[#E58A7B] mb-1">0</p>
                <p className="text-sm text-gray-600">承認済み</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
