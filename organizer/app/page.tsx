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
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  // 認証完了フラグ（メール/Google/LINE）をsessionStorageから読み込む
  const [authCompleted, setAuthCompleted] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('authCompleted') === 'true';
    }
    return false;
  });
  const processingRef = useRef(false);
  const initializedRef = useRef(false);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 環境変数のチェック
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
        console.error('環境変数が設定されていません:', {
          url: supabaseUrl || '未設定',
          key: supabaseAnonKey ? '設定済み' : '未設定'
        });
        setError('環境変数が設定されていません。Vercelの設定を確認してください。');
        setLoading(false);
        return;
      }
      
      // セッションを確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('セッションの取得に失敗しました: ' + sessionError.message);
      }
      
      if (sessionError || !session) {
        // リフレッシュトークンエラーの場合、特別な処理
        if (sessionError?.message?.includes('Refresh Token') || sessionError?.message?.includes('refresh_token')) {
          // リフレッシュトークンが無効な場合、ストレージを完全にクリア
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
          }
          // エラーを表示せず、ログアウト状態にする（正常な動作）
          setUser(null);
          setOrganizer(null);
          setLoading(false);
          return;
        }
        
        // その他のセッションエラーの場合
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
        // データベース接続エラーの可能性がある場合はエラーを表示
        setError('主催者情報の取得に失敗しました: ' + organizerError.message);
      }

      setOrganizer(organizerData || null);
    } catch (error: any) {
      console.error('Error checking auth:', error);
      setError(error.message || '認証チェックに失敗しました');
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

  useEffect(() => {
    // グローバルエラーハンドラー: リフレッシュトークンエラーのみをキャッチ
    const handleGlobalError = (event: ErrorEvent) => {
      // リフレッシュトークンエラーのみを検出（認証コールバック処理中のエラーは除外）
      const errorMessage = event.error?.message || '';
      const isRefreshTokenError = 
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('Refresh Token Not Found') ||
        (errorMessage.includes('refresh_token') && errorMessage.includes('Not Found'));
      
      // 認証コールバック処理中はスキップ（/auth/callbackページで処理）
      const isCallbackPage = typeof window !== 'undefined' && window.location.pathname === '/auth/callback';
      
      if (isRefreshTokenError && !isCallbackPage) {
        // エラーをコンソールに表示しない（自動的に処理される）
        event.preventDefault();
        // ストレージをクリア
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
        }
        // ログアウト状態にする
        setUser(null);
        setOrganizer(null);
        setAuthCompleted(false);
        setLoading(false);
      }
    };

    // エラーハンドラーを登録
    window.addEventListener('error', handleGlobalError);

    // メールリンクのハッシュ処理
    const processHashToken = async (): Promise<boolean> => {
      try {
        if (typeof window !== 'undefined') {
          const hashString = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hashString);
          const searchParams = new URLSearchParams(window.location.search);
          
          // エラーチェック
          const error = hashParams.get('error') || searchParams.get('error');
          if (error) {
            console.error('Auth error:', error);
            setError('認証エラーが発生しました: ' + error);
            setLoading(false);
            return false; // 処理完了（エラー）
          }

          // PKCEフロー (code) の処理
          // auth/callbackページで処理されるため、ここではスキップ
          const code = searchParams.get('code');
          if (code && window.location.pathname !== '/auth/callback') {
            // auth/callback以外のページでcodeがある場合は、auth/callbackにリダイレクト
            window.location.href = `/auth/callback?code=${code}`;
            return false; // リダイレクト中（処理継続不要）
          }

          // Implicitフロー (access_token) の処理
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            if (processingRef.current) return false;
            processingRef.current = true;
            setLoading(true);

            try {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });

              if (!sessionError) {
                // 認証完了をマーク
                setAuthCompleted(true);
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('authCompleted', 'true');
                }
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                await checkAuth();
              } else {
                console.error('Session error:', sessionError);
                setError('セッションの設定に失敗しました: ' + sessionError.message);
                setLoading(false);
              }
            } catch (sessionErr: any) {
              console.error('Error setting session:', sessionErr);
              setError('認証処理に失敗しました: ' + (sessionErr.message || '不明なエラー'));
              setLoading(false);
              } finally {
              processingRef.current = false;
            }
            return true; // 処理完了（認証処理中）
          }

          // Implicitフロー (token_hash) の処理
          const th = hashParams.get('token_hash');
          const type = hashParams.get('type');
          
          if (th && (type === 'signup' || type === 'magiclink' || type === 'recovery' || !type)) {
            if (processingRef.current) return false;
            processingRef.current = true;
            setLoading(true);
            
            try {
              const { error: otpError } = await supabase.auth.verifyOtp({ 
                token_hash: th, 
                type: (type as any) || 'signup'
              });
              
              if (!otpError) {
                // 認証完了をマーク
                setAuthCompleted(true);
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('authCompleted', 'true');
                }
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                await checkAuth();
              } else {
                console.error('OTP verification error:', otpError);
                setError('認証コードの検証に失敗しました: ' + otpError.message);
                setLoading(false);
              }
            } catch (otpErr: any) {
              console.error('Error verifying OTP:', otpErr);
              setError('認証処理に失敗しました: ' + (otpErr.message || '不明なエラー'));
              setLoading(false);
            } finally {
              processingRef.current = false;
            }
            return true; // 処理完了（認証処理中）
          }
        }
        return true; // URLパラメータなし（通常の初期化）
      } catch (err: any) {
        console.error('Error processing hash token:', err);
        setError('認証処理中にエラーが発生しました: ' + (err.message || '不明なエラー'));
        processingRef.current = false;
        setLoading(false);
        return false; // エラー発生
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
          await checkAuth();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // トークンが正常にリフレッシュされた場合、何もしない（正常な動作）
          // エラーは発生していないので、そのまま続行
        }
      }
    );

    // タイムアウト処理（10秒後にローディングを解除）
    const timeoutId = setTimeout(() => {
      if (!initializedRef.current) {
        console.error('認証チェックがタイムアウトしました');
        setError('接続に時間がかかっています。ページをリロードしてください。');
        setLoading(false);
        initializedRef.current = true; // タイムアウトしたことを記録
      }
    }, 10000);

    // まずprocessHashTokenを実行（URLパラメータの処理）
    const initializeAuth = async () => {
      try {
        const processed = await processHashToken();
        
        // processHashTokenがfalseを返した場合（エラーまたはリダイレクト）は処理を終了
        if (!processed) {
          initializedRef.current = true;
          clearTimeout(timeoutId);
          return;
        }
        
        // 初期認証チェック（URLパラメータがない場合、または処理が完了した場合）
        if (!processingRef.current) {
          await checkAuth();
        }
        
        initializedRef.current = true;
        clearTimeout(timeoutId);
      } catch (err: any) {
        console.error('Error initializing auth:', err);
        setError(err.message || '認証の初期化に失敗しました');
        setLoading(false);
        initializedRef.current = true;
        clearTimeout(timeoutId);
      }
    };
    
    initializeAuth();

    // クリーンアップ関数（1つだけ）
    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-4">
        <LoadingSpinner />
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 underline"
            >
              ページをリロード
            </button>
          </div>
        )}
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg"
          >
            ページをリロード
          </button>
        </div>
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
          await checkAuth();
          // checkAuth完了後、organizerが取得されているはずなので、メインUIが表示される
        }}
      />
    );
  }

  // 未読通知数を取得
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

