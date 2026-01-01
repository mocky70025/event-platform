'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { User, Phone, Mail, Tag, Search, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        .order('created_at', { ascending: false});

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse text-[#3B82F6] font-medium">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計 */}
      <Card className="shadow-md">
        <CardContent className="pt-6 text-center">
          <p className="text-4xl font-bold text-[#3B82F6] mb-2">{exhibitors.length}</p>
          <p className="text-sm text-gray-600">総出店者数</p>
        </CardContent>
      </Card>

      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="名前またはメールアドレスで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
        />
      </div>

      {/* 出店者一覧 */}
      {filteredExhibitors.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? '該当する出店者が見つかりません' : '出店者がいません'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? '検索条件を変更してください' : '出店者が登録されていません'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExhibitors.map((exhibitor) => (
            <Card key={exhibitor.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {exhibitor.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {exhibitor.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        登録日: {formatDate(exhibitor.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">性別・年齢</p>
                      <p className="font-semibold text-gray-900">{exhibitor.gender} / {exhibitor.age}歳</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">電話番号</p>
                      <p className="font-semibold text-gray-900">{exhibitor.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">メール</p>
                      <p className="font-semibold text-gray-900 text-sm break-all">{exhibitor.email}</p>
                    </div>
                  </div>
                  {exhibitor.genre_category && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Tag className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">ジャンル</p>
                        <p className="font-semibold text-gray-900">{exhibitor.genre_category}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
