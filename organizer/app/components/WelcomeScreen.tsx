'use client';

import { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function WelcomeScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || '認証に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google認証に失敗しました');
      setLoading(false);
    }
  };

  const handleLineAuth = () => {
    setError('');
    window.location.href = '/api/auth/line-login';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            主催者向けプラットフォーム
          </h1>

          {/* タブ切り替え */}
          <div className="flex mb-5 border-b border-gray-200">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 px-3 py-3 text-base transition-colors ${
                isLogin
                  ? 'border-b-2 border-organizer text-organizer font-bold'
                  : 'text-gray-600'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 px-3 py-3 text-base transition-colors ${
                !isLogin
                  ? 'border-b-2 border-organizer text-organizer font-bold'
                  : 'text-gray-600'
              }`}
            >
              新規登録
            </button>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 mb-5 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* メール認証フォーム */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-gray-700">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-700">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-organizer focus:border-transparent"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-organizer hover:bg-organizer-dark disabled:opacity-50"
            >
              {loading ? '処理中...' : (isLogin ? 'ログイン' : '新規登録')}
            </Button>
          </form>

          <div className="text-center my-5 text-gray-400 text-sm">
            または
          </div>

          {/* ソーシャルログイン */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleAuth}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <span className="mr-2">🔍</span>
              Googleで{isLogin ? 'ログイン' : '登録'}
            </Button>

            <Button
              onClick={handleLineAuth}
              disabled={loading}
              className="w-full bg-[#06C755] hover:bg-[#05A647] text-white"
            >
              <span className="mr-2">💬</span>
              LINEで{isLogin ? 'ログイン' : '登録'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
