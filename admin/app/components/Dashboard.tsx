'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import OrganizerManagement from './OrganizerManagement';
import ExhibitorManagement from './ExhibitorManagement';
import EventManagement from './EventManagement';
import { Button } from './ui/button';
import { RefreshCw, Users, Store, Calendar } from 'lucide-react';

type View = 'organizers' | 'exhibitors' | 'events';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('organizers');
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

      const { data: organizers, count: orgCount } = await supabase
        .from('organizers')
        .select('*', { count: 'exact' });
      
      const orgPending = organizers?.filter(o => !o.is_approved).length || 0;
      const orgApproved = organizers?.filter(o => o.is_approved).length || 0;

      const { count: exhibitorCount } = await supabase
        .from('exhibitors')
        .select('*', { count: 'exact', head: true });

      const { data: events, count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact' });
      
      const eventPending = events?.filter(e => !e.approval_status || e.approval_status !== 'approved').length || 0;
      const eventApproved = events?.filter(e => e.approval_status === 'approved').length || 0;

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
      case 'organizers':
        return <OrganizerManagement onUpdate={loadStatistics} />;
      case 'exhibitors':
        return <ExhibitorManagement />;
      case 'events':
        return <EventManagement onUpdate={loadStatistics} />;
      default:
        return <OrganizerManagement onUpdate={loadStatistics} />;
    }
  };

  const navItems = [
    { id: 'organizers' as View, label: '主催者管理', icon: Users, count: stats.organizers.pending },
    { id: 'exhibitors' as View, label: '出店者管理', icon: Store, count: null },
    { id: 'events' as View, label: 'イベント管理', icon: Calendar, count: stats.events.pending },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-500 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-semibold">
          管理者ダッシュボード
        </h1>
        <Button
          onClick={loadStatistics}
          className="h-9 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          更新
        </Button>
      </div>

      {/* Sidebar & Content */}
      <div className="flex min-h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <div className="w-56 bg-white border-r border-gray-200 py-5">
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-5 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                    currentView === item.id
                      ? 'bg-indigo-50 text-indigo-600 font-medium border-r-2 border-indigo-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.count !== null && item.count > 0 && (
                    <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
