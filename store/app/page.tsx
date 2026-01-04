'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import WelcomeScreen from './components/WelcomeScreen';
import RegistrationForm from './components/RegistrationForm';
import EventList from './components/EventList';
import ExhibitorProfile from './components/ExhibitorProfile';
import ApplicationManagement from './components/ApplicationManagement';
import NotificationBox from './components/NotificationBox';
import LoadingSpinner from './components/LoadingSpinner';
import { Bell, History, Search, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type View = 'search' | 'profile' | 'applications' | 'notifications';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [exhibitor, setExhibitor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('search');
  const [pauseAuth, setPauseAuth] = useState(false);
  const [authError, setAuthError] = useState<{title: string, message: string} | null>(null);
  const processingRef = useRef(false);

  // タブ間同期（認証フローの一時停止制御）
  useEffect(() => {
    const channel = typeof window !== 'undefined' ? new BroadcastChannel('auth-flow') : null;
    let safetyTimeout: ReturnType<typeof setTimeout>;
    if (channel) {
      channel.onmessage = (e) => {
        if (e?.data?.type === 'verify-begin') {
          setPauseAuth(true);
          clearTimeout(safetyTimeout);
          safetyTimeout = setTimeout(() => setPauseAuth(false), 15000);
        } else if (e?.data?.type === 'verify-end') {
          setPauseAuth(false);
          clearTimeout(safetyTimeout);
        }
      };
    }
    return () => {
      channel?.close();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // メールリンクのハッシュ処理と認証状態監視
  useEffect(() => {
    const processHashToken = async () => {
      try {
        if (typeof window !== 'undefined') {
          // ハッシュパラメータの取得
          // URLフラグメント(#)からパラメータをパースする
          const hashString = window.location.hash.substring(1); // #を除去
          const hashParams = new URLSearchParams(hashString);
          const searchParams = new URLSearchParams(window.location.search);
          
          console.log('Processing hash/search params:', { 
            hash: window.location.hash, 
            search: window.location.search,
            token_hash: hashParams.get('token_hash'),
            code: searchParams.get('code')
          });
          
          // エラーチェック (ハッシュまたはクエリパラメータ)
          const error = hashParams.get('error') || searchParams.get('error');
          const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

          if (error) {
            console.error('Auth error from URL:', error, errorDescription);
            setAuthError({
              title: '認証エラー',
              message: errorDescription?.replace(/\+/g, ' ') || '認証リンクが無効か期限切れです。'
            });
            history.replaceState(null, '', window.location.pathname);
            return;
          }

          // PKCEフロー (code) の処理
          const code = searchParams.get('code');
          if (code) {
            if (processingRef.current) return;
            processingRef.current = true;
            setLoading(true); // 明示的にローディング設定
            
            console.log('Exchanging code for session...');
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
               console.error('Exchange code error:', error);
               setAuthError({
                 title: '認証失敗',
                 message: error.message || '認証コードの交換に失敗しました。'
               });
            } else {
               console.log('Code exchange successful');
               // URLをクリーンアップ
               const newUrl = window.location.pathname;
               window.history.replaceState({}, document.title, newUrl);
               // 成功したら明示的にチェック
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
            setLoading(true); // 明示的にローディング設定
            
            console.log('Verifying OTP with token_hash:', type);
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
              console.log('OTP verification successful');
              // 成功時はハッシュをクリア
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              await checkAuth();
            }
            processingRef.current = false;
          }
        }
      } catch (err) {
        console.error('Error processing hash token:', err);
        setAuthError({
          title: 'システムエラー',
          message: '予期せぬエラーが発生しました。'
        });
        processingRef.current = false;
      }
    };

    processHashToken();


    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (pauseAuth) return;
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setExhibitor(null);
        } else if (event === 'SIGNED_IN' && session) {
          await checkAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pauseAuth]);

  const checkAuth = async () => {
    try {
      if (pauseAuth) {
        // 認証一時停止中はローディング状態を維持しないが、チェックもしない
        // UI側でpauseAuthの状態をハンドリングする
        return;
      }
      setLoading(true);
      
      // セッションを確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setUser(null);
        setExhibitor(null);
        setLoading(false);
        return;
      }

      // ユーザー情報を取得
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setUser(null);
        setExhibitor(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // 出店者情報を確認
      const { data: exhibitorData, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (exhibitorError && exhibitorError.code !== 'PGRST116') {
        // PGRST116は「行が見つからない」エラーなので、未登録を意味する
        console.error('Error checking exhibitor:', exhibitorError);
      }

      setExhibitor(exhibitorData || null);
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setExhibitor(null);
    } finally {
      if (!pauseAuth) {
        setLoading(false);
      }
    }
  };

  // 開発モード: 認証チェックをスキップして直接ページを表示
  const DEV_MODE = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (!DEV_MODE && loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [loading, DEV_MODE]);

  if (pauseAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600 font-medium">別のタブで認証を行っています...</p>
      </div>
    );
  }

  // 認証エラー時の表示
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 p-4">
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
            className="bg-sky-500 hover:bg-sky-600 text-white w-full"
          >
            トップページへ戻る
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !DEV_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <LoadingSpinner />
      </div>
    );
  }

  // ハッシュトークンまたは認証コードがある場合は処理中とみなしてローディングを表示
  if (typeof window !== 'undefined') {
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes('token_hash') || search.includes('code=')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-sky-50">
          <LoadingSpinner />
        </div>
      );
    }
  }

    // 開発モードの場合は認証チェックをスキップ
  if (!DEV_MODE) {
    // セッションが無効な場合、WelcomeScreenを表示
    if (!user) {
      return <WelcomeScreen />;
    }
  }

  // セッションが有効で登録済みの場合、メイン画面を表示
  const renderContent = () => {
    switch (currentView) {
      case 'search':
        // EventListにexhibitor情報を渡して、申込時の制御を行えるようにする
        return (
          <EventList 
            exhibitor={exhibitor} 
            onNavigateToProfile={() => setCurrentView('profile')} 
          />
        ); 
      case 'profile':
        // プロフィール画面で未登録時の登録フォーム表示を行う
        return <ExhibitorProfile onExhibitorUpdate={() => checkAuth()} />;
      case 'applications':
        return <ApplicationManagement />;
      case 'notifications':
        return <NotificationBox />;
      default:
        return <EventList />;
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
            .eq('user_type', 'exhibitor')
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

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 pb-16">
      {renderContent()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 shadow-sm">
        <button
          onClick={() => setCurrentView('search')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2 px-2 transition-colors",
            currentView === 'search' ? 'text-sky-500' : 'text-gray-600'
          )}
        >
          <Search className={cn("h-5 w-5 mb-1", currentView === 'search' && "text-sky-500")} />
          <span className="text-xs font-medium">検索</span>
        </button>

        <button
          onClick={() => setCurrentView('applications')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2 px-2 transition-colors",
            currentView === 'applications' ? 'text-sky-500' : 'text-gray-600'
          )}
        >
          <History className={cn("h-5 w-5 mb-1", currentView === 'applications' && "text-sky-500")} />
          <span className="text-xs font-medium">履歴</span>
        </button>

        <button
          onClick={() => setCurrentView('notifications')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2 px-2 transition-colors relative",
            currentView === 'notifications' ? 'text-sky-500' : 'text-gray-600'
          )}
        >
          <div className="relative">
            <Bell className={cn("h-5 w-5 mb-1", currentView === 'notifications' && "text-sky-500")} />
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
            currentView === 'profile' ? 'text-sky-500' : 'text-gray-600'
          )}
        >
          <User className={cn("h-5 w-5 mb-1", currentView === 'profile' && "text-sky-500")} />
          <span className="text-xs font-medium">プロフィール</span>
        </button>
      </div>
    </div>
  );
}
