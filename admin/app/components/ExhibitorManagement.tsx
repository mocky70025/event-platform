'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Exhibitor {
  id: string;
  name: string;
  gender: string;
  age: number;
  email: string;
  phone_number: string;
  genre_category?: string;
  created_at: string;
}

export default function ExhibitorManagement() {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadExhibitors();
  }, []);

  const loadExhibitors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExhibitors(data || []);
    } catch (error: any) {
      console.error('Error loading exhibitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExhibitors = exhibitors.filter(exhibitor =>
    exhibitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exhibitor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          出店者管理
        </h2>
        <input
          type="text"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm w-52 focus:outline-none focus:ring-2 focus:ring-admin focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">名前</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">性別</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">年齢</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">メール</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">ジャンル</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">登録日</th>
              </tr>
            </thead>
            <tbody>
              {filteredExhibitors.map((exhibitor) => (
                <tr
                  key={exhibitor.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-3 py-3 text-sm">{exhibitor.name}</td>
                  <td className="px-3 py-3 text-sm">{exhibitor.gender}</td>
                  <td className="px-3 py-3 text-sm">{exhibitor.age}歳</td>
                  <td className="px-3 py-3 text-sm">{exhibitor.email}</td>
                  <td className="px-3 py-3 text-sm">{exhibitor.genre_category || '-'}</td>
                  <td className="px-3 py-3 text-sm text-gray-600">
                    {new Date(exhibitor.created_at).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredExhibitors.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              {searchTerm ? '検索結果が見つかりませんでした' : '出店者が見つかりませんでした'}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        合計: {filteredExhibitors.length}件
      </div>
    </div>
  );
}
