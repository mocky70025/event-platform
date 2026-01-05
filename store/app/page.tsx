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
  const checkingAuthRef = useRef(false); // checkAuthの重複実行防止用
  // 認証完了フラグ（メール/Google/LINE）をsessionStorageから読み込む
  const [authCompleted, setAuthCompleted] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('authCompleted') === 'true';
    }
    return false;
  });
  
  // 未読通知数を取得するフックをここに移動
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

  // タブ間同期（認証フローの一時停止制御）は削除しました
  // 元のタブを閉じなくても動作するように変更

  // メールリンクのハッシュ処理と認証状態監視
  useEffect(() => {
    const processHashToken = async () => {
      try {
        if (typeof window !== 'undefined') {
          // ハッシュパラメータの取得
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
            history.replaceState(null, '', window.location.pathname);
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
               await checkAuth();
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
              await checkAuth();
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
          await checkAuth();
        }
      }
    };
    
    // 少し待ってから初期認証チェックを実行（processHashTokenの完了を待つ）
    setTimeout(() => {
      checkInitialAuth();
    }, 500);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // トークン処理中はイベントによるチェックをスキップする（競合防止）
        if (processingRef.current) {
          return;
        }

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setExhibitor(null);
          // ログアウト時はフラグをリセット
          setAuthCompleted(false);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('authCompleted');
          }
        } else if (event === 'SIGNED_IN' && session) {
          // 認証完了をマーク（Google/LINE認証の場合）
          // 既存ユーザーでも新規ユーザーでも、認証完了後はメインUIを表示
          setAuthCompleted(true);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('authCompleted', 'true');
          }
          // checkAuth()を実行してuserとexhibitorの状態を更新
          await checkAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // pauseAuthへの依存を削除

  const checkAuth = async () => {
    try {
      // 重複実行防止
      if (checkingAuthRef.current) {
        return;
      }
      checkingAuthRef.current = true;
      
      setLoading(true);
      
      // セッションを確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setUser(null);
        setExhibitor(null);
        setLoading(false);
        checkingAuthRef.current = false;
        return;
      }

      // ユーザー情報を取得
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setUser(null);
        setExhibitor(null);
        setLoading(false);
        checkingAuthRef.current = false;
        return;
      }

      setUser(currentUser);

      // 出店者情報を確認
      const { data: exhibitorData, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('user_id', currentUser.id)
        .limit(1)
        .maybeSingle();

      if (exhibitorError) {
        console.error('Error checking exhibitor:', exhibitorError);
      }

      setExhibitor(exhibitorData || null);
      
      // authCompletedフラグをsessionStorageから再読み込み（認証完了後の状態を反映）
      if (typeof window !== 'undefined') {
        const authCompletedFlag = sessionStorage.getItem('authCompleted') === 'true';
        if (authCompletedFlag !== authCompleted) {
          setAuthCompleted(authCompletedFlag);
        }
      }
    } catch (error: any) {
      console.error('Error checking auth:', error);
      setUser(null);
      setExhibitor(null);
    } finally {
      setLoading(false);
      checkingAuthRef.current = false;
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
    // 削除した機能の残骸も削除
    return null;
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
    if (hash.includes('token_hash') || hash.includes('access_token') || search.includes('code=')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-sky-50">
          <LoadingSpinner />
        </div>
      );
    }
  }

    // 開発モードの場合は認証チェックをスキップ
  if (!DEV_MODE) {
    // ローディング中は何も表示しない（認証チェックが完了するまで待つ）
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-sky-50">
          <LoadingSpinner />
        </div>
      );
    }

    // セッションが無効な場合、WelcomeScreenを表示
    if (!user) {
      return <WelcomeScreen />;
    }

    // ユーザーは認証済みだが、出店者情報が未登録の場合
    // 認証完了直後（メール/Google/LINE）はイベント一覧を表示（登録はプロフィール画面から可能）
    // それ以外の場合は登録フォームを表示
    // authCompletedがtrueの場合は、メインUIを表示（登録はプロフィール画面から可能）
    if (user && !exhibitor && !authCompleted) {
      return (
        <div className="min-h-screen bg-sky-50">
          <RegistrationForm 
            onRegistrationComplete={() => {
              setAuthCompleted(true);
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('authCompleted', 'true');
              }
              checkAuth();
            }}
          />
        </div>
      );
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