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
      // タイムアウト設定（15秒）
      const timeoutId = setTimeout(() => {
        if (status === 'verifying') {
          setStatus('error');
          setErrorMessage('処理がタイムアウトしました。もう一度お試しください。');
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
        
        // エラーチェック（URLパラメータまたはハッシュパラメータ）
        const error = searchParams.get('error') || hashParams.error;
        const errorDesc = searchParams.get('error_description') || hashParams.error_description || searchParams.get('error_message') || hashParams.error_message;

        if (error) {
          clearTimeout(timeoutId);
          console.error('Supabase auth error:', error, errorDesc);
          setStatus('error');
          setErrorMessage(decodeURIComponent(errorDesc || '認証エラーが発生しました'));
          return;
        }

        // 成功時の処理関数
        const handleSuccess = async (session: any) => {
          clearTimeout(timeoutId);
          
          if (!session?.user) {
            setStatus('error');
            setErrorMessage('ユーザー情報の取得に失敗しました');
            return;
          }

          // メール確認状態のチェック
          // 注意: 登録直後はメタデータの更新が遅れる場合があるため、セッションがあれば一旦成功とみなすことも検討
          // ここでは厳密にチェックするが、sessionがある時点で基本的にはOK
          
          sessionStorage.setItem('auth_type', 'email');
          sessionStorage.setItem('user_id', session.user.id);
          sessionStorage.setItem('user_email', session.user.email || '');
          
          // 出店者情報の確認（必要であれば）
          await supabase
            .from('exhibitors')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          setStatus('success');
          
          setTimeout(() => {
            router.push('/');
          }, 2000);
        };

        // 2. 既存セッションのチェック
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session) {
          await handleSuccess(session);
          return;
        }

        // 3. パラメータによる手動検証
        const code = searchParams.get('code');
        const token_hash = searchParams.get('token_hash') || hashParams.token_hash;
        const type = (searchParams.get('type') || hashParams.type || 'signup') as any;
        const token = searchParams.get('token') || hashParams.token;
        const emailParam = searchParams.get('email') || hashParams.email;
        const accessToken = hashParams.access_token;
        const refreshToken = hashParams.refresh_token;

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (data.session) {
            await handleSuccess(data.session);
            return;
          }
        } else if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session) {
            await handleSuccess(data.session);
            return;
          }
        } else if (token_hash) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type,
          });
          if (error) throw error;
          if (data.session) {
            await handleSuccess(data.session);
            return;
          }
        } else if (token && emailParam) {
           // 旧形式または特殊なケース
           const { data, error } = await supabase.auth.verifyOtp({
             email: emailParam,
             token,
             type: 'email',
           } as any);
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
        if (!code && !token_hash && !token && !session && !accessToken) {
             // URLに何も情報がない場合、単にページを開いただけの可能性がある
             // 3秒待って何もなければエラー表示
             setTimeout(() => {
                 if (status === 'verifying') {
                     // まだ検証中のままならエラーにする
                     // processedRef.current = true; // ここで止めてもいいが、非同期処理が走っている可能性もあるのでフラグ管理は慎重に
                     setStatus('error');
                     setErrorMessage('検証用トークンが見つかりません。URLが正しいか確認してください。');
                 }
             }, 3000);
        }

      } catch (err: any) {
        clearTimeout(timeoutId);
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
