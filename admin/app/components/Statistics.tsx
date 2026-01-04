'use client';

import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Users, 
  Calendar, 
  FileText
} from 'lucide-react';

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
  const pendingApprovals = stats.organizers.pending + stats.events.pending;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ダッシュボード
        </h2>
        <p className="text-sm text-gray-600">
          プラットフォーム全体の統括管理
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">主催者</p>
              <p className="text-3xl font-bold text-gray-900">{stats.organizers.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            承認待ち: {stats.organizers.pending}件
          </p>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">出店者</p>
              <p className="text-3xl font-bold text-gray-900">{stats.exhibitors.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">登録ユーザー数</p>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">イベント</p>
              <p className="text-3xl font-bold text-gray-900">{stats.events.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            承認待ち: {stats.events.pending}件
          </p>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">申し込み</p>
              <p className="text-3xl font-bold text-gray-900">{stats.applications.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            承認待ち: {stats.applications.pending}件
          </p>
        </Card>
      </div>

      {/* 承認待ち項目 */}
      {pendingApprovals > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">承認待ち項目</h3>
          <div className="space-y-3">
            {stats.organizers.pending > 0 && (
              <Card className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      主催者承認待ち
                    </p>
                    <p className="text-sm text-gray-600">
                      {stats.organizers.pending}件の主催者が承認待ちです
                    </p>
                  </div>
                  <Button
                    onClick={() => onRefresh()}
                    className="h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg px-5 transition-colors"
                  >
                    確認する
                  </Button>
                </div>
              </Card>
            )}

            {stats.events.pending > 0 && (
              <Card className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      イベント承認待ち
                    </p>
                    <p className="text-sm text-gray-600">
                      {stats.events.pending}件のイベントが承認待ちです
                    </p>
                  </div>
                  <Button
                    onClick={() => onRefresh()}
                    className="h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg px-5 transition-colors"
                  >
                    確認する
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {pendingApprovals === 0 && (
        <Card className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <p className="text-sm text-emerald-800">
            現在、承認待ちの項目はありません
          </p>
        </Card>
      )}
    </div>
  );
}