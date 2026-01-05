'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import WelcomeScreen from './components/WelcomeScreen';
import RegistrationForm from './components/RegistrationForm';
import EventManagement from './components/EventManagement';
import OrganizerProfile from './components/OrganizerProfile';
import NotificationBox from './components/NotificationBox';
import EventApplications from './components/EventApplications';
import LoadingSpinner from './components/LoadingSpinner';
import { Bell, Calendar, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type View = 'events' | 'profile' | 'notifications' | 'applications';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('events');
  const [authError, setAuthError] = useState<{title: string, message: string} | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  // 認証完了フラグ（メール/Google/LINE）をsessionStorageから読み込む
  const [authCompleted, setAuthCompleted] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('authCompleted') === 'true';
    }
    return false;
  });
  const processingRef = useRef(false);
  const userRef = useRef<any>(null);
  const organizerRef = useRef<any>(null);
  const checkAuthRef = useRef<((showLoading?: boolean) => Promise<void>) | null>(null);

  // userとorganizerの最新値をrefに保持
  useEffect(() => {
    userRef.current = user;
    organizerRef.current = organizer;
  }, [user, organizer]);

  const checkAuth = async (showLoading: boolean = true) => {
    try {
      // 重複実行防止は不要（storeアプリに合わせる）
      
      // 既にデータが存在する場合は、ローディングを表示しない
      const hasExistingData = userRef.current && organizerRef.current;
      if (showLoading && !hasExistingData) {
        setLoading(true);
      }
      
      // セッションを確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setUser(null);
        setOrganizer(null);
        setLoading(false);
        return;
      }

      // ユーザー情報を取得
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setUser(null);
        setOrganizer(null);
        setLoading(false);
        return;
      }

      // 既に同じユーザー情報が存在する場合は、データベースクエリをスキップ
      if (hasExistingData && userRef.current.id === currentUser.id) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // 主催者情報を確認（406エラーを無視）
      const { data: organizerData, error: organizerError } = await supabase
        .from('organizers')
        .select('*')
        .eq('user_id', currentUser.id)
        .limit(1)
        .maybeSingle();

      if (organizerError) {
        console.error('Error checking organizer:', organizerError);
      }

      setOrganizer(organizerData || null);
    } catch (error: any) {
      console.error('Error checking auth:', error);
      setUser(null);
      setOrganizer(null);
    } finally {
      setLoading(false);
    }
  };

  // checkAuthをrefに保存
  useEffect(() => {
    checkAuthRef.current = checkAuth;
  });

  useEffect(() => {
    // メールリンクのハッシュ処理と認証状態監視
    const processHashToken = async () => {
      try {
        if (typeof window !== 'undefined') {
          const hashString = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hashString);
          const searchParams = new URLSearchParams(window.location.search);
          
          // エラーチェック
          const error = hashParams.get('error') || searchParams.get('error');
          const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
          if (error) {
            console.error('Auth error:', error, errorDescription);
            setAuthError({
              title: '認証エラー',
              message: errorDescription?.replace(/\+/g, ' ') || '認証リンクが無効か期限切れです。'
            });
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }

          // PKCEフロー (code) の処理
          const code = searchParams.get('code');
          if (code) {
            if (processingRef.current) return;
            processingRef.current = true;
            setLoading(true);
            
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Exchange code error:', error);
              setAuthError({
                title: '認証失敗',
                message: error.message || '認証コードの交換に失敗しました。'
              });
            } else {
              // 認証完了をマーク（Google/LINE認証含む）
              setAuthCompleted(true);
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('authCompleted', 'true');
              }
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              if (checkAuthRef.current) {
                await checkAuthRef.current(true);
              }
            }
            processingRef.current = false;
            return;
          }

          // Implicitフロー (access_token) の直接処理
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

            if (error) {
              console.error('Set session error:', error);
              setAuthError({
                title: '認証エラー',
                message: 'セッションの確立に失敗しました。'
              });
            } else {
              // 認証完了をマーク
              setAuthCompleted(true);
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('authCompleted', 'true');
              }
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              if (checkAuthRef.current) {
                await checkAuthRef.current(true);
              }
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
            
            if (error) {
              console.error('Verify OTP error:', error);
              setAuthError({
                title: '認証失敗',
                message: error.message || '認証に失敗しました。リンクが期限切れの可能性があります。'
              });
            } else {
              // 認証完了をマーク
              setAuthCompleted(true);
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('authCompleted', 'true');
              }
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              if (checkAuthRef.current) {
                await checkAuthRef.current(true);
              }
            }
            processingRef.current = false;
          }
        }
      } catch (err: any) {
        console.error('Error processing hash token:', err);
        setAuthError({
          title: 'システムエラー',
          message: '予期せぬエラーが発生しました。'
        });
        processingRef.current = false;
      }
    };

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // トークン処理中はイベントによるチェックをスキップする（競合防止）
        if (processingRef.current) {
          return;
        }

        // リフレッシュトークンエラーが発生した場合、セッションをクリア
        if (event === 'TOKEN_REFRESHED' && !session) {
          // リフレッシュトークンが無効な場合、ストレージをクリア
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
          }
          setUser(null);
          setOrganizer(null);
          setAuthCompleted(false);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_OUT' || !session) {
          // セッションが無効な場合、sessionStorageを完全にクリア
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
          }
          setUser(null);
          setOrganizer(null);
          // ログアウト時はフラグをリセット
          setAuthCompleted(false);
        } else if (event === 'SIGNED_IN' && session) {
          // 認証完了をマーク（Google/LINE認証の場合）
          setAuthCompleted(true);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('authCompleted', 'true');
          }
          // checkAuthを呼び出す（エラーが発生しても続行）
          // 既にデータが存在する場合はローディングを表示しない
          try {
            if (checkAuthRef.current) {
              await checkAuthRef.current(false);
            }
          } catch (err) {
            console.error('Error in checkAuth from onAuthStateChange:', err);
            // エラーが発生しても処理を続行
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // トークンが正常にリフレッシュされた場合、何もしない（正常な動作）
          // エラーは発生していないので、そのまま続行
          // タブがフォーカスされたときの再読み込みを防ぐため、checkAuthは呼ばない
        }
      }
    );

    // まずprocessHashTokenを実行（URLパラメータの処理）
    processHashToken();
    
    // 初期認証チェック（URLパラメータがない場合）
    // processHashTokenでcodeが処理されない場合のみ実行
    const checkInitialAuth = async () => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasCode = searchParams.get('code') || hashParams.get('access_token') || hashParams.get('token_hash');
        
        // URLパラメータがない場合のみ初期認証チェックを実行
        if (!hasCode) {
          if (checkAuthRef.current) {
            await checkAuthRef.current(true);
          }
        }
      }
    };
    
    // 少し待ってから初期認証チェックを実行（processHashTokenの完了を待つ）
    setTimeout(() => {
      checkInitialAuth();
    }, 500);

    // クリーンアップ関数（1つだけ）
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 認証エラー時の表示
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{authError.title}</h2>
          <p className="text-gray-600 mb-6">{authError.message}</p>
          <Button 
            onClick={() => {
              setAuthError(null);
              setLoading(true);
              // URLのハッシュやクエリパラメータをクリアしてリロード
              window.location.href = window.location.origin;
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full"
          >
            トップページへ戻る
          </Button>
        </div>
      </div>
    );
  }

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

  // セッションが有効だが未登録の場合
  // 認証完了直後（メール/Google/LINE）で主催者情報がない場合は登録フォームを表示
  // authCompletedがtrueの場合は、メインUIを表示（登録はプロフィール画面から可能）
  if (!organizer && !authCompleted) {
    // 認証完了前で主催者情報がない場合は登録フォームを表示
    return (
      <RegistrationForm 
        onRegistrationComplete={async () => {
          // 登録完了後、主催者情報を取得してからメインUIを表示
          if (checkAuthRef.current) {
            await checkAuthRef.current(true);
          }
          // checkAuth完了後、organizerが取得されているはずなので、メインUIが表示される
        }}
      />
    );
  }

  // 未読通知数を取得
  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

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
        } else {
          // エラーが発生しても0に設定（エラーを表示しない）
          setUnreadCount(0);
        }
      } catch (err) {
        console.error('Error loading unread count:', err);
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

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

