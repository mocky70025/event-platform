'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('認証に失敗しました');
        setTimeout(() => {
          router.push('/');
        }, 2000);
        return;
      }

      if (code) {
        try {
          // codeを処理してセッションを確立
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            setError('認証処理に失敗しました');
            setTimeout(() => {
              router.push('/');
            }, 2000);
            return;
          }
          
          // 認証成功後、codeパラメータなしでトップページにリダイレクト
          // メインページのonAuthStateChangeでauthCompletedフラグが設定される
          router.push('/');
        } catch (err) {
          setError('認証処理に失敗しました');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      } else {
        // セッションが既に確立されている場合
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            // 認証完了後、codeパラメータなしでトップページにリダイレクト
            router.push('/');
          } else if (event === 'SIGNED_OUT') {
            router.push('/');
          }
        });
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50 p-6">
        <Card className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => router.push('/')}
              className="h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
            >
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <LoadingSpinner />
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthCallbackContent />
    </Suspense>
  );
}