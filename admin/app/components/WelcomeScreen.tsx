'use client';

import { useState } from 'react';
import { signInWithEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      // 認証成功後はページがリロードされる
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 px-8 pb-8">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            管理者ログイン
          </h1>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-700">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-admin focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm text-gray-700">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-admin focus:border-transparent"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-admin hover:bg-admin-dark"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          <div className="mt-5 p-3 bg-gray-100 rounded text-xs text-gray-600 text-center">
            ⚠️ 管理者専用ページです
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
