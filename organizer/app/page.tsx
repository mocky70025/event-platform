'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import WelcomeScreen from './components/WelcomeScreen';
import RegistrationForm from './components/RegistrationForm';
import EventManagement from './components/EventManagement';
import OrganizerProfile from './components/OrganizerProfile';
import NotificationBox from './components/NotificationBox';
import EventApplications from './components/EventApplications';
import LoadingSpinner from './components/LoadingSpinner';
import { Bell, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type View = 'events' | 'profile' | 'notifications' | 'applications';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('events');
  const [authCompleted, setAuthCompleted] = useState(false); // 認証完了フラグ
  const processingRef = useRef(false);

  useEffect(() => {
    // メールリンクのハッシュ処理
    const processHashToken = async () => {
      try {
        if (typeof window !== 'undefined') {
          const hashString = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hashString);
          const searchParams = new URLSearchParams(window.location.search);
          
          // エラーチェック
          const error = hashParams.get('error') || searchParams.get('error');
          if (error) {
            console.error('Auth error:', error);
            return;
          }

          // PKCEフロー (code) の処理
          const code = searchParams.get('code');
          if (code) {
            if (processingRef.current) return;
            processingRef.current = true;
            setLoading(true);
            
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (!error) {
              setAuthCompleted(true); // 認証完了をマーク
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              await checkAuth();
            }
            processingRef.current = false;
            return;
          }

          // Implicitフロー (access_token) の処理
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            if (processingRef.current) return;
            processingRef.current = true;
            setLoading(true);

            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (!error) {
              setAuthCompleted(true); // 認証完了をマーク
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              await checkAuth();
            }
            processingRef.current = false;
            return;
          }

          // Implicitフロー (token_hash) の処理
          const th = hashParams.get('token_hash');
          const type = hashParams.get('type');
          
          if (th && (type === 'signup' || type === 'magiclink' || type === 'recovery' || !type)) {
            if (processingRef.current) return;
            processingRef.current = true;
            setLoading(true);
            
            const { error } = await supabase.auth.verifyOtp({ 
              token_hash: th, 
              type: (type as any) || 'signup'
            });
            
            if (!error) {
              setAuthCompleted(true); // 認証完了をマーク
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              await checkAuth();
            }
            processingRef.current = false;
          }
        }
      } catch (err: any) {
        console.error('Error processing hash token:', err);
        processingRef.current = false;
      }
    };

    processHashToken();
    checkAuth();
    
    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // トークン処理中はイベントによるチェックをスキップする（競合防止）
        if (processingRef.current) {
          return;
        }

        if (event === 'SIGNED_OUT' || !session) {
          // セッションが無効な場合、sessionStorageを完全にクリア
          if (typeof window !== 'undefined') {
            sessionStorage.clear();
          }
          setUser(null);
          setOrganizer(null);
          setAuthCompleted(false); // ログアウト時はフラグをリセット
        } else if (event === 'SIGNED_IN' && session) {
          // 認証完了をマーク（Google/LINE認証の場合）
          setAuthCompleted(true);
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
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <LoadingSpinner />
      </div>
    );
  }

  // セッションが無効な場合、WelcomeScreenを表示
  if (!user) {
    return <WelcomeScreen />;
  }

  // セッションが有効だが未登録の場合、RegistrationFormを表示
  // メール認証完了後は登録フォームを表示し、フォーム完了後にメインUIに遷移
  if (!organizer) {
    return (
      <RegistrationForm 
        onRegistrationComplete={() => {
          setAuthCompleted(true);
          checkAuth();
        }}
      />
    );
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
        return <div className="p-4">申し込み管理は各イベント詳細ページから利用できます。</div>;
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
    <div className="min-h-screen flex flex-col bg-orange-50 pb-16">
      {renderContent()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 shadow-sm">
        <button
          onClick={() => setCurrentView('events')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2 px-2 transition-colors",
            currentView === 'events' ? 'text-orange-500' : 'text-gray-600'
          )}
        >
          <Calendar className={cn("h-5 w-5 mb-1", currentView === 'events' && "text-orange-500")} />
          <span className="text-xs font-medium">イベント</span>
        </button>

        <button
          onClick={() => setCurrentView('notifications')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2 px-2 transition-colors relative",
            currentView === 'notifications' ? 'text-orange-500' : 'text-gray-600'
          )}
        >
          <div className="relative">
            <Bell className={cn("h-5 w-5 mb-1", currentView === 'notifications' && "text-orange-500")} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">通知</span>
        </button>

        <button
          onClick={() => setCurrentView('profile')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2 px-2 transition-colors",
            currentView === 'profile' ? 'text-orange-500' : 'text-gray-600'
          )}
        >
          <User className={cn("h-5 w-5 mb-1", currentView === 'profile' && "text-orange-500")} />
          <span className="text-xs font-medium">プロフィール</span>
        </button>
      </div>
    </div>
  );
}

