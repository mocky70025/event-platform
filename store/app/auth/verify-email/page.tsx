'use client';

import { useEffect, useState } from 'react';
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

    const verifyEmail = async () => {
      // 1. エラーパラメータのチェック
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        if (mounted) {
          setStatus('error');
          setErrorMessage(errorDescription || '認証エラーが発生しました');
        }
        return;
      }

      // 2. Auth状態の変更を監視
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session) {
          await handleSessionSuccess(session);
        }
      });

      // 3. 初期セッション確認と手動検証
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await handleSessionSuccess(session);
        } else {
          // セッションがない場合、URLパラメータから確認を試みる
          const tokenHash = searchParams.get('token_hash');
          const type = searchParams.get('type') as any;
          const code = searchParams.get('code');

          if (tokenHash && type === 'signup') {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'signup'
            });

            if (error) {
              console.error('Email verification error:', error);
              if (mounted) {
                setStatus('error');
                setErrorMessage(error.message || 'メールアドレスの確認に失敗しました');
              }
            }
            // 成功した場合、onAuthStateChangeがSIGNED_INを発火するはず
          } else if (code) {
            // PKCEフロー: コードがある場合、Supabaseが自動的に交換するのを待つ
            // または手動で交換する（通常は自動処理される）
            const { error } = await supabase.auth.exchangeCodeForSession(code);
             if (error) {
              console.error('Code exchange error:', error);
              if (mounted) {
                setStatus('error');
                setErrorMessage(error.message || '認証コードの交換に失敗しました');
              }
            }
          } else {
            // Implicit Flow (ハッシュ) やその他のケース
            // 少し待ってからタイムアウト判定
            setTimeout(async () => {
              if (!mounted || status === 'success') return;
              
              const { data: { session: lateSession } } = await supabase.auth.getSession();
              if (lateSession) {
                await handleSessionSuccess(lateSession);
              } else {
                if (mounted && status === 'verifying') {
                  setStatus('error');
                  setErrorMessage('確認リンクが無効か、期限切れです。メールを再送信してください。');
                }
              }
            }, 3000); // 3秒待機
          }
        }
      } catch (err: any) {
        console.error('Verification init error:', err);
        if (mounted) {
          setStatus('error');
          setErrorMessage(err.message || 'エラーが発生しました');
        }
      }

      return () => {
        subscription.unsubscribe();
      };
    };

    const handleSessionSuccess = async (session: any) => {
      if (!mounted) return;
      
      // メール確認済みかチェック
      // 注意: 新規登録直後は email_confirmed_at がまだ更新されていない場合があるため、
      // セッションがある時点で成功とみなすか、少し待つ必要があるかもしれません。
      // ここではセッションがあればOKとします。

      sessionStorage.setItem('auth_type', 'email');
      sessionStorage.setItem('user_id', session.user.id);
      sessionStorage.setItem('user_email', session.user.email || '');

      // 登録済みかチェック
      const { data } = await supabase
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

    verifyEmail();

    return () => {
      mounted = false;
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
                登録フォームにリダイレクトします...
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
