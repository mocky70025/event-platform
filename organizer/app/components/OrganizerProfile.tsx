'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Edit, LogOut, Building2, User, Phone, Mail, CheckCircle, Clock } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-orange-500"></div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="pt-6 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              主催者情報が登録されていません
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              情報を登録してイベントを作成しましょう
            </p>
            <Button
              onClick={() => router.push('/register')}
              className="h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                プロフィール
              </h1>
              <p className="text-sm text-gray-600">
                あなたの主催者情報
              </p>
            </div>
            <Button
              onClick={handleSignOut}
              className="h-9 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors"
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
                {organizer.organization_name[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {organizer.organization_name}
                </h2>
                <p className="text-base text-gray-600 mb-4">{organizer.name}</p>
                <Button
                  className="h-9 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  プロフィール編集
                </Button>
              </div>
            </div>

            {/* Approval Status */}
            <div className={`p-4 rounded-lg border ${
              organizer.is_approved 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                {organizer.is_approved ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-900">承認済み</p>
                      <p className="text-sm text-emerald-700">イベントの作成が可能です</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-900">承認待ち</p>
                      <p className="text-sm text-amber-700">
                        管理者による承認をお待ちください
                      </p>
                    </div>
                  </>
                )}
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
                  組織名
                </label>
                <p className="text-base font-medium text-gray-900">
                  {organizer.organization_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  担当者名
                </label>
                <p className="text-base font-medium text-gray-900">
                  {organizer.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  電話番号
                </label>
                <p className="text-base font-medium text-gray-900">
                  {organizer.phone_number}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  メールアドレス
                </label>
                <p className="text-base font-medium text-gray-900 break-all">
                  {organizer.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
