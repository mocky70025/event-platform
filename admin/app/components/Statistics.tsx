'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const StatCard = ({ title, value, subtitle, color = 'text-admin' }: {
    title: string;
    value: number;
    subtitle?: string;
    color?: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-gray-600 mb-2">
          {title}
        </div>
        <div className={`text-3xl font-bold mb-1 ${color}`}>
          {value.toLocaleString()}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-400">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-5">
        統計情報
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="主催者"
          value={stats.organizers.total}
          subtitle={`承認待ち: ${stats.organizers.pending} | 承認済み: ${stats.organizers.approved}`}
          color="text-admin"
        />
        <StatCard
          title="出店者"
          value={stats.exhibitors.total}
          color="text-green-600"
        />
        <StatCard
          title="イベント"
          value={stats.events.total}
          subtitle={`承認待ち: ${stats.events.pending} | 承認済み: ${stats.events.approved}`}
          color="text-blue-600"
        />
        <StatCard
          title="申し込み"
          value={stats.applications.total}
          subtitle={`審査中: ${stats.applications.pending} | 承認: ${stats.applications.approved} | 却下: ${stats.applications.rejected}`}
          color="text-amber-600"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold mb-4">
            承認待ち項目
          </h3>
          <div className="space-y-3">
            {stats.organizers.pending > 0 && (
              <div className="p-3 bg-amber-50 rounded flex justify-between items-center">
                <span>主催者承認待ち: {stats.organizers.pending}件</span>
                <Button
                  onClick={() => window.location.href = '/admin?view=organizers'}
                  size="sm"
                  className="bg-admin hover:bg-admin-dark"
                >
                  確認する
                </Button>
              </div>
            )}
            {stats.events.pending > 0 && (
              <div className="p-3 bg-blue-50 rounded flex justify-between items-center">
                <span>イベント承認待ち: {stats.events.pending}件</span>
                <Button
                  onClick={() => window.location.href = '/admin?view=events'}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  確認する
                </Button>
              </div>
            )}
            {stats.applications.pending > 0 && (
              <div className="p-3 bg-amber-50 rounded">
                <span>申し込み審査中: {stats.applications.pending}件</span>
              </div>
            )}
            {stats.organizers.pending === 0 && stats.events.pending === 0 && stats.applications.pending === 0 && (
              <div className="p-3 bg-green-50 rounded text-center text-green-800">
                ✅ 承認待ちの項目はありません
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
