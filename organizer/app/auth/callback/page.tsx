'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let cleanup: (() => void) | undefined;

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

      const finalizeSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          sessionStorage.setItem('auth_type', 'oauth');
          sessionStorage.setItem('user_id', session.user.id);
          sessionStorage.setItem('user_email', session.user.email || '');

          const { data: existing } = await supabase
            .from('organizers')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!existing) {
            await supabase
              .from('organizers')
              .upsert({
                user_id: session.user.id,
                name: null,
                organization_name: null,
                phone_number: null,
                email: session.user.email,
                is_approved: false,
              }, { onConflict: 'user_id' });
          }

          router.replace('/');
          return true;
        }

        return false;
      };

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setError(exchangeError.message || '認証処理に失敗しました');
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        await finalizeSession();
        return;
      }

      const ensured = await finalizeSession();
      if (ensured) return;

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await finalizeSession();
        }
      });

      cleanup = () => subscription.unsubscribe();
    };

    handleCallback();

    return () => cleanup?.();
  }, [searchParams, router]);

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
