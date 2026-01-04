'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const channel = typeof window !== 'undefined' ? new BroadcastChannel('auth-flow') : null;
    channel?.postMessage({ type: 'verify-begin' });

    const handleSessionSuccess = async (session: any) => {
      if (!mounted) return;

      sessionStorage.setItem('auth_type', 'email');
      sessionStorage.setItem('user_id', session.user.id);
      sessionStorage.setItem('user_email', session.user.email || '');
      sessionStorage.removeItem('pending_email');

      await supabase
        .from('exhibitors')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (mounted) {
        setStatus('success');
        setTimeout(() => {
          if (mounted) router.push('/');
        }, 2000);
      }
    };

    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session) {
        await handleSessionSuccess(session);
      }
    }).data.subscription;

    const verifyEmail = async () => {
      let hashParams: URLSearchParams | null = null;
      if (typeof window !== 'undefined') {
        hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      }

      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        if (mounted) {
          setStatus('error');
          setErrorMessage(errorDescription || '認証エラーが発生しました');
        }
        return;
      }

      try {
        const waitForSession = async (timeoutMs: number) => {
          const start = Date.now();
          while (Date.now() - start < timeoutMs) {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (s) return s;
            await new Promise((r) => setTimeout(r, 1000));
          }
          return null;
        };

        const hashAccessToken = hashParams?.get('access_token');
        const hashRefreshToken = hashParams?.get('refresh_token');
        const hashExpiresIn = hashParams?.get('expires_in');

        if (hashAccessToken && hashRefreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken,
            expires_in: hashExpiresIn ? parseInt(hashExpiresIn, 10) : undefined,
          });

          if (sessionError) {
            console.error('Session set error:', sessionError);
            if (mounted) {
              setStatus('error');
              setErrorMessage(sessionError.message || 'セッションの確立に失敗しました');
            }
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await handleSessionSuccess(session);
          return;
        }

        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type') as any;
        const token = searchParams.get('token');
        const emailParam = searchParams.get('email');
        const email = emailParam || (typeof window !== 'undefined' ? sessionStorage.getItem('pending_email') : null);
        const code = searchParams.get('code');
        const hashTokenHash = hashParams?.get('token_hash');

        const effectiveTokenHash = tokenHash || hashTokenHash;

        if (effectiveTokenHash && type === 'signup') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: effectiveTokenHash,
            type: 'signup'
          });

          if (verifyError) {
            console.error('Email verification error:', verifyError);
            if (mounted) {
              setStatus('error');
              setErrorMessage(verifyError.message || 'メールアドレスの確認に失敗しました');
            }
          }
          return;
        }

        if (token && type === 'signup' && email) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token,
            type: 'signup',
            email: email as string
          });
          if (verifyError) {
            console.error('Email verification error:', verifyError);
            if (mounted) {
              setStatus('error');
              setErrorMessage(verifyError.message || 'メールアドレスの確認に失敗しました');
            }
          }
          return;
        }

        if (code) {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (codeError) {
            console.error('Code exchange error:', codeError);
            if (mounted) {
              setStatus('error');
              setErrorMessage(codeError.message || '認証コードの交換に失敗しました');
            }
          }
          return;
        }

        const s = await waitForSession(10000);
        if (s) {
          await handleSessionSuccess(s);
        } else if (mounted && status === 'verifying') {
          setStatus('error');
          setErrorMessage('他のタブで処理中の可能性があります。全てのタブを閉じて再試行してください。');
        }
      } catch (err: any) {
        console.error('Verification init error:', err);
        if (mounted) {
          setStatus('error');
          setErrorMessage(err.message || 'エラーが発生しました');
        }
      }
    };

    verifyEmail();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      channel?.postMessage({ type: 'verify-end' });
      channel?.close();
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 p-6">
      <Card className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-8 text-center">
          {status === 'verifying' && (
            <>
              <LoadingSpinner />
              <h1 className="text-xl font-bold text-gray-900 mt-6 mb-2">
                メールアドレスを確認中...
              </h1>
              <p className="text-sm text-gray-600">
                少々お待ちください
              </p>
              <button 
                onClick={() => router.push('/')} 
                className="mt-8 text-xs text-blue-500 underline hover:text-blue-700 cursor-pointer"
              >
                画面が切り替わらない場合はこちら（ホームへ）
              </button>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                メールアドレスの確認が完了しました
              </h1>
              <p className="text-sm text-gray-600 mb-6">
                メインページにリダイレクトします...
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                すぐに移動する
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                確認に失敗しました
              </h1>
              <p className="text-sm text-gray-600 mb-6">
                {errorMessage}
              </p>
              <Button
                onClick={() => router.push('/')}
                className="h-10 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg px-6 transition-colors"
              >
                ホームに戻る
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
