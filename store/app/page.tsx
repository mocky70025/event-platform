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
  const [debugInfo, setDebugInfo] = useState<string>(''); // デバッグ情報
  
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
          
          const debugMsg = `Hash: ${window.location.hash}, Search: ${window.location.search}`;
          console.log(debugMsg);
          setDebugInfo(prev => prev + '\n' + debugMsg);
          
          // エラーチェック
          const error = hashParams.get('error') || searchParams.get('error');
          const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

          if (error) {
            const errorMsg = `Auth error: ${error} - ${errorDescription}`;
            console.error(errorMsg);
            setDebugInfo(prev => prev + '\n' + errorMsg);
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
            
            setDebugInfo(prev => prev + '\nExchanging code...');
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
               console.error('Exchange code error:', error);
               setDebugInfo(prev => prev + '\nExchange code error: ' + error.message);
               setAuthError({
                 title: '認証失敗',
                 message: error.message || '認証コードの交換に失敗しました。'
               });
            } else {
               setDebugInfo(prev => prev + '\nCode exchange successful');
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
             setDebugInfo(prev => prev + '\nFound access_token in hash');

             const { error } = await supabase.auth.setSession({
               access_token: accessToken,
               refresh_token: refreshToken || '',
             });

             if (error) {
               console.error('Set session error:', error);
               setDebugInfo(prev => prev + '\nError setting session: ' + error.message);
               setAuthError({
                 title: '認証エラー',
                 message: 'セッションの確立に失敗しました。'
               });
             } else {
               setDebugInfo(prev => prev + '\nSession set manually from hash');
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
            
            setDebugInfo(prev => prev + `\nVerifying OTP: ${type}`);
            const { error } = await supabase.auth.verifyOtp({ 
              token_hash: th, 
              type: (type as any) || 'signup'
            });
            
            if (error) {
              console.error('Verify OTP error:', error);
              setDebugInfo(prev => prev + '\nVerify OTP error: ' + error.message);
              setAuthError({
                title: '認証失敗',
                message: error.message || '認証に失敗しました。リンクが期限切れの可能性があります。'
              });
            } else {
              setDebugInfo(prev => prev + '\nOTP verification successful');
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              await checkAuth();
            }
            processingRef.current = false;
          }
        }
      } catch (err: any) {
        console.error('Error processing hash token:', err);
        setDebugInfo(prev => prev + '\nSystem error: ' + err.message);
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
        setDebugInfo(prev => prev + `\nAuth state change: ${event}`);
        
        // トークン処理中はイベントによるチェックをスキップする（競合防止）
        if (processingRef.current) {
          setDebugInfo(prev => prev + ' (Skipped due to processing)');
          return;
        }

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setExhibitor(null);
        } else if (event === 'SIGNED_IN' && session) {
          // 少し待ってからチェック（競合緩和）
          setTimeout(() => checkAuth(), 100);
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
        setDebugInfo(prev => prev + '\nCheck auth skipped (already running)');
        return;
      }
      checkingAuthRef.current = true;
      
      setLoading(true);
      
      setDebugInfo(prev => prev + '\nChecking auth...');
      
      // セッションを確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setDebugInfo(prev => prev + '\nNo session found');
        setUser(null);
        setExhibitor(null);
        setLoading(false);
        checkingAuthRef.current = false;
        return;
      }

      setDebugInfo(prev => prev + '\nSession found: ' + session.user.id);

      // ユーザー情報を取得
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setDebugInfo(prev => prev + '\nUser fetch failed');
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

      if (exhibitorError && exhibitorError.code !== 'PGRST116') {
        console.error('Error checking exhibitor:', exhibitorError);
        setDebugInfo(prev => prev + '\nExhibitor check error: ' + exhibitorError.message);
      }

      let effectiveExhibitor = exhibitorData;

      if (!effectiveExhibitor) {
        const { data: created, error: createError } = await supabase
          .from('exhibitors')
          .upsert({
            user_id: currentUser.id,
            email: currentUser.email,
            name: null,
            gender: null,
            age: null,
            phone_number: null,
            genre_category: null,
            genre_free_text: null,
            business_license_image_url: null,
            vehicle_inspection_image_url: null,
            automobile_inspection_image_url: null,
            pl_insurance_image_url: null,
            fire_equipment_layout_image_url: null,
          }, { onConflict: 'user_id' })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating exhibitor placeholder:', createError);
          setDebugInfo(prev => prev + '\nExhibitor create error: ' + createError.message);
        } else {
          effectiveExhibitor = created;
        }
      }

      setExhibitor(effectiveExhibitor || null);
      setCurrentView('search');
      setDebugInfo(prev => prev + '\nAuth check complete. Exhibitor: ' + (effectiveExhibitor ? 'Found' : 'Not found'));
    } catch (error: any) {
      console.error('Error checking auth:', error);
      setDebugInfo(prev => prev + '\nAuth check exception: ' + error.message);
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
          <pre className="text-xs text-left bg-gray-100 p-2 rounded mb-4 overflow-auto max-h-32">
            {debugInfo}
          </pre>
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
        <LoadingSpinner />
        <p className="mt-4 text-xs text-gray-400">Loading... (Debug)</p>
        <pre className="mt-2 text-[10px] text-gray-400 max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
            {debugInfo.split('\n').slice(-1)[0]}
        </pre>
      </div>
    );
  }

  // ハッシュトークンまたは認証コードがある場合は処理中とみなしてローディングを表示
  if (typeof window !== 'undefined') {
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes('token_hash') || hash.includes('access_token') || search.includes('code=')) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
          <LoadingSpinner />
          <p className="mt-4 text-xs text-gray-400">Processing Token... (Debug)</p>
        </div>
      );
    }
  }

    // 開発モードの場合は認証チェックをスキップ
  if (!DEV_MODE) {
    // セッションが無効な場合、WelcomeScreenを表示
    if (!user) {
        // ★★★ デバッグ情報をWelcomeScreenに渡すか、あるいはここで表示する ★★★
      return (
        <div className="relative">
            <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 text-white text-[10px] p-2 max-h-32 overflow-auto pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
                DEBUG INFO:<br/>
                {debugInfo.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
            <WelcomeScreen />
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
