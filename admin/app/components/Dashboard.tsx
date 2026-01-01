'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import OrganizerManagement from './OrganizerManagement';
import ExhibitorManagement from './ExhibitorManagement';
import EventManagement from './EventManagement';
import Statistics from './Statistics';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type View = 'dashboard' | 'organizers' | 'exhibitors' | 'events' | 'statistics';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [stats, setStats] = useState({
    organizers: { total: 0, pending: 0, approved: 0 },
    exhibitors: { total: 0 },
    events: { total: 0, pending: 0, approved: 0 },
    applications: { total: 0, pending: 0, approved: 0, rejected: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      // 主催者統計
      const { data: organizers, count: orgCount } = await supabase
        .from('organizers')
        .select('*', { count: 'exact' });
      
      const orgPending = organizers?.filter(o => !o.is_approved).length || 0;
      const orgApproved = organizers?.filter(o => o.is_approved).length || 0;

      // 出店者統計
      const { count: exhibitorCount } = await supabase
        .from('exhibitors')
        .select('*', { count: 'exact', head: true });

      // イベント統計
      const { data: events, count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact' });
      
      const eventPending = events?.filter(e => !e.approval_status || e.approval_status !== 'approved').length || 0;
      const eventApproved = events?.filter(e => e.approval_status === 'approved').length || 0;

      // 申し込み統計
      const { data: applications, count: appCount } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact' });
      
      const appPending = applications?.filter(a => a.application_status === 'pending').length || 0;
      const appApproved = applications?.filter(a => a.application_status === 'approved').length || 0;
      const appRejected = applications?.filter(a => a.application_status === 'rejected').length || 0;

      setStats({
        organizers: {
          total: orgCount || 0,
          pending: orgPending,
          approved: orgApproved,
        },
        exhibitors: {
          total: exhibitorCount || 0,
        },
        events: {
          total: eventCount || 0,
          pending: eventPending,
          approved: eventApproved,
        },
        applications: {
          total: appCount || 0,
          pending: appPending,
          approved: appApproved,
          rejected: appRejected,
        },
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Statistics stats={stats} onRefresh={loadStatistics} />;
      case 'organizers':
        return <OrganizerManagement onUpdate={loadStatistics} />;
      case 'exhibitors':
        return <ExhibitorManagement />;
      case 'events':
        return <EventManagement onUpdate={loadStatistics} />;
      default:
        return <Statistics stats={stats} onRefresh={loadStatistics} />;
    }
  };

  if (loading && currentView === 'dashboard') {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-admin text-white px-5 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h1 className="text-xl font-bold">
          管理者ダッシュボード
        </h1>
        <Button
          onClick={loadStatistics}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      {/* サイドバー & コンテンツ */}
      <div className="flex min-h-[calc(100vh-60px)]">
        {/* サイドバー */}
        <div className="w-52 bg-white border-r border-gray-200 py-5">
          <nav className="flex flex-col">
            {[
              { id: 'dashboard', label: '📊 ダッシュボード', count: null },
              { id: 'organizers', label: '👥 主催者管理', count: stats.organizers.pending },
              { id: 'exhibitors', label: '🏪 出店者管理', count: null },
              { id: 'events', label: '📅 イベント管理', count: stats.events.pending },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={cn(
                  'px-5 py-3 border-0 text-left text-sm flex justify-between items-center transition-colors',
                  currentView === item.id
                    ? 'bg-blue-50 text-admin font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span>{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 p-5">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
