'use client';

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatisticsProps {
  stats: {
    organizers: { total: number; pending: number; approved: number };
    exhibitors: { total: number };
    events: { total: number; pending: number; approved: number };
    applications: { total: number; pending: number; approved: number; rejected: number };
  };
  onRefresh: () => void;
}

export default function Statistics({ stats, onRefresh }: StatisticsProps) {
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    gradient,
    trend
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    gradient: string;
    trend?: { value: number; direction: 'up' | 'down'; label?: string };
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br shadow-sm",
            gradient
          )}>
            <div className="text-white">{icon}</div>
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
              trend.direction === 'up' 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            )}>
              <TrendingUp className="w-3 h-3" />
              <span>+{trend.value}</span>
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {value.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          {title}
        </div>
        {trend?.label && (
          <div className="text-xs text-gray-500 mt-2">
            {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const pendingApprovals = stats.organizers.pending + stats.events.pending;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          全体統計
        </h2>
        <p className="text-gray-600">
          プラットフォーム全体を統括管理
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="総ユーザー数"
          value={stats.organizers.total + stats.exhibitors.total}
          icon={<Users className="w-6 h-6" />}
          gradient="from-blue-400 to-blue-600"
          trend={{ value: 45, direction: 'up', label: '今月' }}
        />
        <StatCard
          title="アクティブユーザー"
          value={Math.floor((stats.organizers.total + stats.exhibitors.total) * 0.7)}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-green-400 to-green-600"
        />
        <StatCard
          title="総イベント数"
          value={stats.events.total}
          icon={<Calendar className="w-6 h-6" />}
          gradient="from-purple-400 to-purple-600"
        />
        <StatCard
          title="今月の成約数"
          value={stats.applications.approved}
          icon={<CheckCircle className="w-6 h-6" />}
          gradient="from-orange-400 to-orange-600"
        />
      </div>

      {/* 承認待ち */}
      {pendingApprovals > 0 && (
        <Card className="mb-8 border-l-4 border-orange-500">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              承認待ち
            </h2>
            <div className="space-y-3">
              {stats.organizers.pending > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    新規主催者: <strong>{stats.organizers.pending}件</strong>
                  </span>
                  <Button 
                    size="sm" 
                    className="bg-[#3B82F6] hover:bg-[#2563EB]"
                    onClick={() => window.location.href = '/admin?view=organizers'}
                  >
                    今すぐ承認
                  </Button>
                </div>
              )}
              {stats.events.pending > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    新規イベント: <strong>{stats.events.pending}件</strong>
                  </span>
                  <Button 
                    size="sm" 
                    className="bg-[#3B82F6] hover:bg-[#2563EB]"
                    onClick={() => window.location.href = '/admin?view=events'}
                  >
                    今すぐ承認
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 最近のアクティビティ */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">最近のアクティビティ</h2>
          <div className="space-y-3">
            {stats.organizers.approved > 0 && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700">
                    {stats.organizers.approved}件の主催者が承認されました
                  </span>
                </div>
                <span className="text-sm text-gray-500">今月</span>
              </div>
            )}
            {stats.events.approved > 0 && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700">
                    {stats.events.approved}件のイベントが公開されました
                  </span>
                </div>
                <span className="text-sm text-gray-500">今月</span>
              </div>
            )}
            {stats.applications.approved > 0 && (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-700">
                    {stats.applications.approved}件の申し込みが成約しました
                  </span>
                </div>
                <span className="text-sm text-gray-500">今月</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => window.location.href = '/admin?view=organizers'}
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mb-4 group-hover:shadow-lg transition-shadow">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">ユーザー管理</h3>
          <p className="text-sm text-gray-600">出店者・主催者を管理</p>
        </button>

        <button 
          onClick={() => window.location.href = '/admin?view=events'}
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white mb-4 group-hover:shadow-lg transition-shadow">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">イベント管理</h3>
          <p className="text-sm text-gray-600">全てのイベントを確認</p>
        </button>

        <button 
          onClick={onRefresh}
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white mb-4 group-hover:shadow-lg transition-shadow">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">統計レポート</h3>
          <p className="text-sm text-gray-600">詳細な分析を確認</p>
        </button>
      </div>
    </div>
  );
}
