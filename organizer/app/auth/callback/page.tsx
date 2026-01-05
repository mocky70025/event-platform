'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AlertCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const handleCallback = async () => {
      try {
        // window.location.searchを直接使用してパラメータを取得
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          if (isMounted) {
            setError('認証に失敗しました');
            setTimeout(() => {
              if (isMounted) {
                router.push('/');
              }
            }, 2000);
          }
          return;
        }

        if (code) {
          try {
            // codeを処理してセッションを確立
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('Exchange code error:', exchangeError);
              if (isMounted) {
                setError('認証処理に失敗しました: ' + exchangeError.message);
                setTimeout(() => {
                  if (isMounted) {
                    router.push('/');
                  }
                }, 3000);
              }
              return;
            }
            
            // 認証成功後、authCompletedフラグをsessionStorageに保存
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('authCompleted', 'true');
            }
            
            // 認証成功後、codeパラメータなしでトップページにリダイレクト
            if (isMounted) {
              router.push('/');
            }
          } catch (err: any) {
            console.error('Auth callback error:', err);
            if (isMounted) {
              setError(err.message || '認証処理に失敗しました');
              setTimeout(() => {
                if (isMounted) {
                  router.push('/');
                }
              }, 3000);
            }
          }
        } else {
          // セッションが既に確立されている場合
          const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;

            if (event === 'SIGNED_IN' && session) {
              // 認証成功後、authCompletedフラグをsessionStorageに保存
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('authCompleted', 'true');
              }
              // 認証完了後、codeパラメータなしでトップページにリダイレクト
              router.push('/');
            } else if (event === 'SIGNED_OUT') {
              router.push('/');
            }
          });
          subscription = authSubscription;
        }
      } catch (err: any) {
        console.error('Callback handler error:', err);
        if (isMounted) {
          setError('認証処理中にエラーが発生しました');
          setTimeout(() => {
            if (isMounted) {
              router.push('/');
            }
          }, 3000);
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <Card className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => router.push('/')}
              className="h-10 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
            >
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <LoadingSpinner />
    </div>
  );
}

export default function AuthCallback() {
  // useSearchParamsを使わないため、Suspenseは不要
  return <AuthCallbackContent />;
}