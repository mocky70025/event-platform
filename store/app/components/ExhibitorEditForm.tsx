'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface ExhibitorData {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone_number: string;
  email: string;
  genre_category: string | null;
  genre_free_text: string | null;
}

export default function ExhibitorEditForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ExhibitorData>({
    id: '',
    name: '',
    gender: '',
    age: 0,
    phone_number: '',
    email: '',
    genre_category: null,
    genre_free_text: null,
  });

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
      setFormData(data);
    } catch (error) {
      console.error('出店者情報取得エラー:', error);
      setError('情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ExhibitorData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('exhibitors')
        .update({
          name: formData.name,
          gender: formData.gender,
          age: formData.age,
          phone_number: formData.phone_number,
          email: formData.email,
          genre_category: formData.genre_category,
          genre_free_text: formData.genre_free_text,
        })
        .eq('id', formData.id);

      if (updateError) throw updateError;

      alert('プロフィールを更新しました');
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-8">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 flex items-center">
          <Button
            onClick={() => router.push('/profile')}
            variant="ghost"
            size="sm"
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <h1 className="ml-4 text-xl font-bold text-gray-800">
            プロフィール編集
          </h1>
        </div>
      </header>

      <main className="px-4 py-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            {error && (
              <div className="p-3 mb-5 bg-red-50 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  名前 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  性別 <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="それ以外">それ以外</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  年齢 <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  電話番号 <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
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
                  className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  ジャンル（カテゴリ）
                </label>
                <input
                  type="text"
                  value={formData.genre_category || ''}
                  onChange={(e) => handleInputChange('genre_category', e.target.value || null)}
                  className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  ジャンル（自由記述）
                </label>
                <textarea
                  value={formData.genre_free_text || ''}
                  onChange={(e) => handleInputChange('genre_free_text', e.target.value || null)}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-store focus:border-transparent"
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-store hover:bg-store-dark"
              >
                {saving ? '保存中...' : '保存する'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
