'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import WelcomeScreen from './components/WelcomeScreen';
import RegistrationForm from './components/RegistrationForm';
import EventManagement from './components/EventManagement';
import OrganizerProfile from './components/OrganizerProfile';
import NotificationBox from './components/NotificationBox';
import EventApplications from './components/EventApplications';
import LoadingSpinner from './components/LoadingSpinner';

type View = 'events' | 'profile' | 'notifications' | 'applications';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('events');

  useEffect(() => {
    checkAuth();
    
    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          // セッションが無効な場合、sessionStorageを完全にクリア
          if (typeof window !== 'undefined') {
            sessionStorage.clear();
          }
          setUser(null);
          setOrganizer(null);
        } else if (event === 'SIGNED_IN' && session) {
          await checkAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // セッションを確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // セッションが無効な場合、sessionStorageを完全にクリア
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
        }
        setUser(null);
        setOrganizer(null);
        setLoading(false);
        return;
      }

      // ユーザー情報を取得
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        // ユーザーが取得できない場合、sessionStorageを完全にクリア
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
        }
        setUser(null);
        setOrganizer(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // 主催者情報を確認
      const { data: organizerData, error: organizerError } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (organizerError && organizerError.code !== 'PGRST116') {
        // PGRST116は「行が見つからない」エラーなので、未登録を意味する
        console.error('Error checking organizer:', organizerError);
      }

      setOrganizer(organizerData || null);
    } catch (error) {
      console.error('Error checking auth:', error);
      // エラーが発生した場合も、sessionStorageを完全にクリア
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      setUser(null);
      setOrganizer(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  // セッションが無効な場合、WelcomeScreenを表示
  if (!user) {
    return <WelcomeScreen />;
  }

  // セッションが有効だが未登録の場合、RegistrationFormを表示
  if (!organizer) {
    return <RegistrationForm />;
  }

  // セッションが有効で登録済みの場合、メイン画面を表示
  const renderContent = () => {
    switch (currentView) {
      case 'events':
        return <EventManagement />;
      case 'profile':
        return <OrganizerProfile />;
      case 'notifications':
        return <NotificationBox />;
      case 'applications':
        return <EventApplications />;
      default:
        return <EventManagement />;
    }
  };

  // 未読通知数を取得
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      const loadUnreadCount = async () => {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('user_type', 'organizer')
            .eq('is_read', false);

          if (!error && data) {
            setUnreadCount(data.length);
          }
        } catch (err) {
          console.error('Error loading unread count:', err);
        }
      };

      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // URLパラメータでapplicationsビューを開く
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('eventId') || urlParams.get('applicationId')) {
        setCurrentView('applications');
      }
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {renderContent()}

      {/* ボトムナビゲーション */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setCurrentView('notifications')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: currentView === 'notifications' ? '#FF6B35' : '#666',
          }}
        >
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-8px',
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '10px',
                fontSize: '10px',
                padding: '2px 6px',
                minWidth: '18px',
                textAlign: 'center',
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span style={{ fontSize: '12px', marginTop: '4px' }}>通知</span>
        </button>

        <button
          onClick={() => setCurrentView('events')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: currentView === 'events' ? '#FF6B35' : '#666',
          }}
        >
          <span style={{ fontSize: '24px' }}>📅</span>
          <span style={{ fontSize: '12px', marginTop: '4px' }}>作成・履歴</span>
        </button>

        <button
          onClick={() => setCurrentView('profile')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: currentView === 'profile' ? '#FF6B35' : '#666',
          }}
        >
          <span style={{ fontSize: '24px' }}>👤</span>
          <span style={{ fontSize: '12px', marginTop: '4px' }}>プロフィール</span>
        </button>
      </div>
    </div>
  );
}

