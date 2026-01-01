'use client';

import { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  Calendar,
  FileCheck,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Google SVGアイコン
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const MessageCircleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
  </svg>
);

export default function WelcomeScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex">
      {/* 左側: ブランディングエリア（デスクトップのみ） */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#7FCAC5] via-[#5DABA8] to-[#4A9693]">
        {/* パターン背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-start px-16 text-white">
          {/* ロゴ */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold tracking-tight mb-3">
              Tomorrow
            </h1>
            <p className="text-white/90 text-xl">
              出店者向けプラットフォーム
            </p>
          </div>
          
          {/* キャッチコピー */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              イベント出店を<br />もっとシンプルに
            </h2>
            <p className="text-white/90 text-lg leading-relaxed max-w-md">
              申し込みから承認まで、すべてをひとつのプラットフォームで。
            </p>
          </div>
          
          {/* 特徴（アイコン付き） */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">イベント検索</p>
                <p className="text-white/80 text-sm">全国のイベント情報を一元管理</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">簡単申し込み</p>
                <p className="text-white/80 text-sm">書類を一度登録すれば何度でも使える</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">リアルタイム通知</p>
                <p className="text-white/80 text-sm">承認状況をすぐに確認</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 右側: 認証フォーム */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* モバイル用ロゴ */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-[#5DABA8] mb-2">
              Tomorrow
            </h1>
            <p className="text-gray-600">出店者向けプラットフォーム</p>
          </div>
          
          {/* カード */}
          <Card className="shadow-xl border-0">
            <CardContent className="pt-6 pb-8 px-6 md:px-8">
              {/* タブ切り替え */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                  className={cn(
                    "flex-1 pb-4 text-base font-semibold transition-all relative",
                    isLogin
                      ? "text-[#5DABA8]"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  ログイン
                  {isLogin && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5DABA8] rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                  className={cn(
                    "flex-1 pb-4 text-base font-semibold transition-all relative",
                    !isLogin
                      ? "text-[#5DABA8]"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  新規登録
                  {!isLogin && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5DABA8] rounded-full" />
                  )}
                </button>
              </div>
              
              {/* エラーメッセージ */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slide-down">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              {/* メール認証フォーム */}
              <form onSubmit={handleEmailAuth} className="space-y-5">
                {/* メールアドレス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5DABA8] focus:border-transparent transition-all outline-none text-base"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                {/* パスワード */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    パスワード
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5DABA8] focus:border-transparent transition-all outline-none text-base"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {isLogin && (
                    <div className="text-right mt-2">
                      <a
                        href="/auth/reset-password"
                        className="text-sm text-[#5DABA8] hover:text-[#4A9693] transition-colors font-medium"
                      >
                        パスワードを忘れた方
                      </a>
                    </div>
                  )}
                </div>
                
                {/* 送信ボタン */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5DABA8] hover:bg-[#4A9693] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-base h-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>処理中...</span>
                    </>
                  ) : (
                    <span>{isLogin ? 'ログイン' : '新規登録'}</span>
                  )}
                </Button>
              </form>
              
              {/* 区切り線 */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    または
                  </span>
                </div>
              </div>
              
              {/* ソーシャルログイン */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 text-base"
                >
                  <GoogleIcon />
                  <span>Googleで{isLogin ? 'ログイン' : '登録'}</span>
                </button>
                
                <button
                  onClick={handleLineAuth}
                  disabled={loading}
                  className="w-full bg-[#06C755] hover:bg-[#05A647] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md text-base"
                >
                  <MessageCircleIcon />
                  <span>LINEで{isLogin ? 'ログイン' : '登録'}</span>
                </button>
              </div>
              
              {/* フッターリンク */}
              <div className="mt-6 text-center text-xs text-gray-600 leading-relaxed">
                <span>登録することで、</span>
                <a
                  href="/terms"
                  className="text-[#5DABA8] hover:text-[#4A9693] transition-colors font-medium mx-1 underline"
                >
                  利用規約
                </a>
                <span>と</span>
                <a
                  href="/privacy"
                  className="text-[#5DABA8] hover:text-[#4A9693] transition-colors font-medium mx-1 underline"
                >
                  プライバシーポリシー
                </a>
                <span>に同意したものとみなされます。</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
