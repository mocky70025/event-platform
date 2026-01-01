'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AuthCallback() {
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
        // LINE認証の場合、バックエンドで処理する必要があります
        // ここでは簡易的にリダイレクトのみ
        try {
          // LINE認証の処理は、実際の実装ではバックエンドAPIで行う必要があります
          // ここでは一旦ホームにリダイレクト
          router.push('/');
        } catch (err) {
          setError('認証処理に失敗しました');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      } else {
        // Supabase認証のコールバック処理
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '8px',
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <LoadingSpinner />
    </div>
  );
}

