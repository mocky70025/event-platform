'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setErrorMessage(sessionError.message || 'セッションの取得に失敗しました');
          return;
        }

        if (session && session.user) {
          const isEmailConfirmed = !!session.user.email_confirmed_at;
          
          if (!isEmailConfirmed) {
            setStatus('error');
            setErrorMessage('メールアドレスの確認が完了していません。確認メールを再送信してください。');
            return;
          }

          sessionStorage.setItem('auth_type', 'email');
          sessionStorage.setItem('user_id', session.user.id);
          sessionStorage.setItem('user_email', session.user.email || '');
          
          const { data: exhibitor } = await supabase
            .from('exhibitors')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          setStatus('success');
          
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          const getFromHash = (key: string) => {
            if (typeof window === 'undefined') return null;
            const hash = window.location.hash.replace('#', '');
            const params = new URLSearchParams(hash);
            return params.get(key);
          };
          const tokenHash = searchParams.get('token_hash') || getFromHash('token_hash');
          const code = searchParams.get('code') || getFromHash('code');
          const type = searchParams.get('type') || getFromHash('type');

          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('Exchange code error:', error);
              setStatus('error');
              setErrorMessage(error.message || '確認コードの処理に失敗しました');
              return;
            }
            const { data: { session: newSession } } = await supabase.auth.getSession();
            if (newSession && newSession.user) {
              sessionStorage.setItem('auth_type', 'email');
              sessionStorage.setItem('user_id', newSession.user.id);
              sessionStorage.setItem('user_email', newSession.user.email || '');
              const { data: exhibitor } = await supabase
                .from('exhibitors')
                .select('id')
                .eq('user_id', newSession.user.id)
                .maybeSingle();
              setStatus('success');
              setTimeout(() => {
                router.push('/');
              }, 2000);
              return;
            }
          } else if (tokenHash && type === 'signup') {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'signup'
            });

            if (error) {
              console.error('Email verification error:', error);
              setStatus('error');
              setErrorMessage(error.message || 'メールアドレスの確認に失敗しました');
              return;
            }

            const { data: { session: newSession } } = await supabase.auth.getSession();
            
            if (newSession && newSession.user) {
              sessionStorage.setItem('auth_type', 'email');
              sessionStorage.setItem('user_id', newSession.user.id);
              sessionStorage.setItem('user_email', newSession.user.email || '');
              
              const { data: exhibitor } = await supabase
                .from('exhibitors')
                .select('id')
                .eq('user_id', newSession.user.id)
                .maybeSingle();
              
              setStatus('success');
              setTimeout(() => {
                router.push('/');
              }, 2000);
            } else {
              setStatus('error');
              setErrorMessage('セッションの取得に失敗しました');
            }
          } else {
            setStatus('error');
            setErrorMessage('無効な確認リンクです。確認メールを再送信してください。');
          }
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'メールアドレスの確認中にエラーが発生しました');
      }
    };

    verifyEmail();
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
                登録フォームにリダイレクトします...
              </p>
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
