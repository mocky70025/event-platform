'use client';

import { useEffect, useState, useRef } from 'react';
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
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const verifyEmail = async () => {
      let timeoutId: NodeJS.Timeout;

      // 成功時の処理関数
      const handleSuccess = async (session: any) => {
        if (timeoutId) clearTimeout(timeoutId);
        
        if (!session?.user) {
          setStatus('error');
          setErrorMessage('ユーザー情報の取得に失敗しました');
          return;
        }

        // メール確認状態のチェック
        sessionStorage.setItem('auth_type', 'email');
        sessionStorage.setItem('user_id', session.user.id);
        sessionStorage.setItem('user_email', session.user.email || '');
        
        try {
          // 出店者情報の確認（必要であれば）
          // エラーが出てもリダイレクトは阻害しないようにする
          await supabase
            .from('exhibitors')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
        } catch (e) {
          console.warn('Exhibitor check failed:', e);
        }
        
        setStatus('success');
        
        setTimeout(() => {
          router.push('/');
        }, 2000);
      };

      // タイムアウト設定（15秒）
      timeoutId = setTimeout(async () => {
        if (status === 'verifying') {
          // タイムアウト時も念のためセッション確認
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await handleSuccess(session);
            return;
          }
          setStatus('error');
          setErrorMessage('処理がタイムアウトしました。確認は完了している可能性があります。');
        }
      }, 15000);

      try {
        // 1. URLハッシュからのパラメータ取得（Implicit Flowやエラー用）
        const getHashParams = () => {
          if (typeof window === 'undefined') return {};
          const hash = window.location.hash.replace(/^#/, '');
          const params = new URLSearchParams(hash);
          const result: Record<string, string> = {};
          params.forEach((value, key) => { result[key] = value; });
          return result;
        };
        const hashParams = getHashParams();
        
        // デバッグ用：パラメータ取得状況をコンソールに出力
        console.log('Verify Email Params:', { 
          search: Object.fromEntries(searchParams.entries()), 
          hash: hashParams 
        });

        // エラーチェック（URLパラメータまたはハッシュパラメータ）
        const error = searchParams.get('error') || hashParams.error;
        const errorDesc = searchParams.get('error_description') || hashParams.error_description || searchParams.get('error_message') || hashParams.error_message;

        if (error) {
          if (timeoutId) clearTimeout(timeoutId);
          console.error('Supabase auth error:', error, errorDesc);
          setStatus('error');
          setErrorMessage(decodeURIComponent(errorDesc || '認証エラーが発生しました'));
          return;
        }

        // API呼び出しのタイムアウト制御用ラッパー
        const withTimeout = async <T,>(promise: Promise<T>, ms: number = 10000): Promise<T> => {
          const timeout = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('API request timeout')), ms)
          );
          return Promise.race([promise, timeout]);
        };

        // 2. 既存セッションのチェック
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session) {
          await handleSuccess(session);
          return;
        }

        // 3. パラメータによる手動検証

        const code = searchParams.get('code');
        // tokenパラメータが長い文字列（ハッシュ）の場合はtoken_hashとして扱う
        let token_hash = searchParams.get('token_hash') || hashParams.token_hash;
        const rawToken = searchParams.get('token') || hashParams.token;
        
        if (!token_hash && rawToken && rawToken.length > 6) {
          token_hash = rawToken;
        }

        const type = (searchParams.get('type') || hashParams.type || 'signup') as any;
        const emailParam = searchParams.get('email') || hashParams.email;
        const accessToken = hashParams.access_token;
        const refreshToken = hashParams.refresh_token;

        if (accessToken && refreshToken) {
          const { data, error } = await withTimeout(supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          }));
          if (error) throw error;
          if (data.session) {
            await handleSuccess(data.session);
            return;
          }
        } else if (code) {
          const { data, error } = await withTimeout(supabase.auth.exchangeCodeForSession(code));
          if (error) throw error;
          if (data.session) {
            await handleSuccess(data.session);
            return;
          }
        } else if (token_hash) {
          const { data, error } = await withTimeout(supabase.auth.verifyOtp({
            token_hash,
            type,
          }));
          if (error) throw error;
          if (data.session) {
            await handleSuccess(data.session);
            return;
          }
        } else if (rawToken && emailParam) {
           // 旧形式または特殊なケース
           const { data, error } = await withTimeout(supabase.auth.verifyOtp({
             email: emailParam,
             token: rawToken,
             type: 'email',
           } as any));
           if (error) throw error;
           if (data.session) {
             await handleSuccess(data.session);
             return;
           }
        }

        // 4. Auth State Changeリスナー (Implicit Flowなどで遅れてセッションが入る場合)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe();
            await handleSuccess(session);
          }
        });

        // パラメータもなく、セッションもない場合
        if (!code && !token_hash && !rawToken && !session && !accessToken) {
             // URLに何も情報がない場合、単にページを開いただけの可能性がある
             // 3秒待って何もなければエラー表示
             setTimeout(async () => {
                 if (status === 'verifying') {
                     // 念のためもう一度セッション確認
                     const { data: { session: lateSession } } = await supabase.auth.getSession();
                     if (lateSession) {
                       await handleSuccess(lateSession);
                       return;
                     }

                     setStatus('error');
                     setErrorMessage('検証用トークンが見つかりません。URLが正しいか確認してください。');
                 }
             }, 3000);
        }

      } catch (err: any) {
        // エラー発生時も、念のためセッションがあるか確認する
        // (APIがエラーを返しても、実は認証できているケースへの保険)
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (fallbackSession) {
          await handleSuccess(fallbackSession);
          return;
        }

        clearTimeout(timeoutId);
        console.error('Verification error:', err);
        setStatus('error');
        // エラーメッセージを少し親切に
        const msg = err.message || 'メールアドレスの確認中にエラーが発生しました';
        if (msg.includes('Timeout') || msg.includes('timeout')) {
          setErrorMessage('サーバーからの応答がありませんでした。再読み込みするか、ログインをお試しください。');
        } else {
          setErrorMessage(msg);
        }
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
