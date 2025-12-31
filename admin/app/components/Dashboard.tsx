'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import OrganizerManagement from './OrganizerManagement';
import ExhibitorManagement from './ExhibitorManagement';
import EventManagement from './EventManagement';
import Statistics from './Statistics';

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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      {/* ヘッダー */}
      <div style={{
        backgroundColor: '#8B5CF6',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
        }}>
          管理者ダッシュボード
        </h1>
        <button
          onClick={loadStatistics}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          🔄 更新
        </button>
      </div>

      {/* サイドバー */}
      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 60px)',
      }}>
        <div style={{
          width: '200px',
          backgroundColor: 'white',
          borderRight: '1px solid #e0e0e0',
          padding: '20px 0',
        }}>
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            {[
              { id: 'dashboard', label: '📊 ダッシュボード', count: null },
              { id: 'organizers', label: '👥 主催者管理', count: stats.organizers.pending },
              { id: 'exhibitors', label: '🏪 出店者管理', count: null },
              { id: 'events', label: '📅 イベント管理', count: stats.events.pending },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  backgroundColor: currentView === item.id ? '#f3f0ff' : 'transparent',
                  color: currentView === item.id ? '#8B5CF6' : '#333',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '12px',
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* メインコンテンツ */}
        <div style={{
          flex: 1,
          padding: '20px',
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

