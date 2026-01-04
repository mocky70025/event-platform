'use client';

import { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import WelcomeScreen from './components/WelcomeScreen';
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
  const [authError, setAuthError] = useState<{ title: string; message: string } | null>(null);
  const processingRef = useRef(false);
  const checkingAuthRef = useRef(false); // checkAuthの重複実行防止用

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

  useEffect(() => {
    const processHashToken = async () => {
      try {
        if (typeof window === 'undefined') return;

        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        if (error) {
          setAuthError({
            title: '認証エラー',
            message: errorDescription?.replace(/\+/g, ' ') || '認証リンクが無効か期限切れです。',
          });
          history.replaceState(null, '', window.location.pathname);
          setLoading(false);
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          if (processingRef.current) return;
          processingRef.current = true;
          setLoading(true);

          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Exchange code error:', exchangeError);
            setAuthError({
              title: '認証失敗',
              message: exchangeError.message || '認証コードの交換に失敗しました。',
            });
            setLoading(false);
          } else {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            await checkAuth();
          }
          processingRef.current = false;
          return;
        }

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          if (processingRef.current) return;
          processingRef.current = true;
          setLoading(true);

          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error('Set session error:', sessionError);
            setAuthError({
              title: '認証エラー',
              message: 'セッションの確立に失敗しました。',
            });
            setLoading(false);
          } else {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            await checkAuth();
          }
          processingRef.current = false;
          return;
        }

        const tokenHash = hashParams.get('token_hash');
        const type = hashParams.get('type');

        if (tokenHash && (type === 'signup' || type === 'magiclink' || type === 'recovery' || !type)) {
          if (processingRef.current) return;
          processingRef.current = true;
          setLoading(true);

          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: (type as any) || 'signup',
          });

          if (verifyError) {
            console.error('Verify OTP error:', verifyError);
            setAuthError({
              title: '認証失敗',
              message: verifyError.message || '認証に失敗しました。リンクが期限切れの可能性があります。',
            });
            setLoading(false);
          } else {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            await checkAuth();
          }
          processingRef.current = false;
          return;
        }

        // トークンが無い場合でも既存セッションを確認
        await checkAuth();
      } catch (err: any) {
        console.error('Error processing hash token:', err);
        setAuthError({
          title: 'システムエラー',
          message: '予期せぬエラーが発生しました。',
        });
        processingRef.current = false;
        setLoading(false);
      }
    };

    processHashToken();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (processingRef.current) {
        return;
      }

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setExhibitor(null);
      } else if (event === 'SIGNED_IN' && session) {
        setTimeout(() => checkAuth(), 100);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      if (checkingAuthRef.current) {
        return;
      }
      checkingAuthRef.current = true;

      setLoading(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setUser(null);
        setExhibitor(null);
        setLoading(false);
        checkingAuthRef.current = false;
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setUser(null);
        setExhibitor(null);
        setLoading(false);
        checkingAuthRef.current = false;
        return;
      }

      setUser(currentUser);

      const { data: exhibitorData, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('user_id', currentUser.id)
        .limit(1)
        .maybeSingle();

      if (exhibitorError && exhibitorError.code !== 'PGRST116') {
        console.error('Error checking exhibitor:', exhibitorError);
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
        } else {
          effectiveExhibitor = created;
        }
      }

      setExhibitor(effectiveExhibitor || null);
      setCurrentView('search');
    } catch (error: any) {
      console.error('Error checking auth:', error);
      setUser(null);
      setExhibitor(null);
    } finally {
      setLoading(false);
      checkingAuthRef.current = false;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
        <LoadingSpinner />
        <p className="mt-4 text-xs text-gray-400">読み込み中です...</p>
      </div>
    );
  }

  if (typeof window !== 'undefined') {
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes('token_hash') || hash.includes('access_token') || search.includes('code=')) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
          <LoadingSpinner />
          <p className="mt-4 text-xs text-gray-400">認証処理中です...</p>
        </div>
      );
    }
  }

  if (!user) {
    return <WelcomeScreen />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'search':
        return (
          <EventList
            exhibitor={exhibitor}
            onNavigateToProfile={() => setCurrentView('profile')}
          />
        );
      case 'profile':
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
