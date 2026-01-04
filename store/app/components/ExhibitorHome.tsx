'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bell, 
  History, 
  Search as SearchIcon, 
  User,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Send,
  AlertCircle,
  ChevronRight,
  FileCheck,
  Settings
} from 'lucide-react';

export default function ExhibitorHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    monthlyEvents: 0
  });

  useEffect(() => {
    fetchUserData();
    fetchUnreadNotifications();
    fetchApplicationStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('exhibitors')
        .select('representative_name')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUserName(data.representative_name || 'ユーザー');
      }
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error);
    }
  };

  const fetchApplicationStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: pendingCount } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', user.id)
        .eq('application_status', 'pending');

      const { count: approvedCount } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', user.id)
        .eq('application_status', 'approved');

      setStats({
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        monthlyEvents: approvedCount || 0
      });
    } catch (error) {
      console.error('統計取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('通知取得エラー:', error);
    }
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ダッシュボード
            </h1>
            <p className="text-sm text-gray-600">
              {userName ? `${userName}さん、` : ''}おかえりなさい
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">応募中</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500">審査待ちのイベント</p>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">承認済み</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500">出店が確定したイベント</p>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">今月の出店</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.monthlyEvents}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-sky-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500">今月予定のイベント数</p>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => setActiveTab('events')}
                className="h-auto py-5 bg-white border border-gray-200 hover:bg-sky-50 text-gray-700 rounded-xl flex flex-col items-center gap-2 transition-colors"
              >
                <SearchIcon className="w-5 h-5" />
                <span className="text-sm font-medium">イベント検索</span>
              </Button>
              <Button
                onClick={() => setActiveTab('applications')}
                className="h-auto py-5 bg-white border border-gray-200 hover:bg-sky-50 text-gray-700 rounded-xl flex flex-col items-center gap-2 transition-colors"
              >
                <FileCheck className="w-5 h-5" />
                <span className="text-sm font-medium">申し込み履歴</span>
              </Button>
              <Button
                onClick={() => setActiveTab('notifications')}
                className="h-auto py-5 bg-white border border-gray-200 hover:bg-sky-50 text-gray-700 rounded-xl flex flex-col items-center gap-2 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="text-sm font-medium">通知</span>
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Button
                onClick={() => setActiveTab('profile')}
                className="h-auto py-5 bg-white border border-gray-200 hover:bg-sky-50 text-gray-700 rounded-xl flex flex-col items-center gap-2 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">設定</span>
              </Button>
            </div>
          </div>

          {/* Getting Started */}
          {stats.approved === 0 && stats.pending === 0 && (
            <Card className="bg-sky-50 border border-sky-200 rounded-xl p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">はじめての方へ</h3>
              <p className="text-sm text-gray-600 mb-4">
                イベント検索からお好きなイベントを見つけて、出店申し込みをしましょう。
              </p>
              <Button
                onClick={() => setActiveTab('events')}
                className="h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
              >
                イベントを探す
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <p className="text-gray-500">この機能は開発中です</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Main Content */}
      <main className="pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto px-6 py-3">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'home'
                  ? 'text-sky-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">ホーム</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'events'
                  ? 'text-sky-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SearchIcon className="w-5 h-5" />
              <span className="text-xs font-medium">検索</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'applications'
                  ? 'text-sky-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-xs font-medium">履歴</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors relative ${
                activeTab === 'notifications'
                  ? 'text-sky-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="text-xs font-medium">通知</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'text-sky-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-medium">設定</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}