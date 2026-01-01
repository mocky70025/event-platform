'use client';

import { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Users, Calendar, Bell, FileCheck } from 'lucide-react';

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
    <div className="min-h-screen flex bg-gray-50">
      {/* 左側：ブランディングエリア（デスクトップのみ） */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#F5C0B3] to-[#E58A7B] p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">
            主催者向けプラットフォーム
          </h1>
          <p className="text-xl text-white/90 mb-12">
            イベントの企画から応募管理まで、全てをシームレスに
          </p>
          
          {/* 特徴 */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  簡単イベント作成
                </h3>
                <p className="text-white/80 text-sm">
                  直感的なフォームで数分でイベントを公開
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  応募者管理
                </h3>
                <p className="text-white/80 text-sm">
                  応募者の情報を一元管理、承認もワンクリック
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  リアルタイム通知
                </h3>
                <p className="text-white/80 text-sm">
                  新規応募や重要な更新を即座にお知らせ
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  書類確認機能
                </h3>
                <p className="text-white/80 text-sm">
                  出店者の必要書類をオンラインで確認
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-white/60 text-sm">
          © 2024 イベントプラットフォーム
        </div>
      </div>

      {/* 右側：認証フォーム */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="lg:hidden mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                主催者向けプラットフォーム
              </h1>
              <p className="text-gray-600">
                イベント管理をもっとスマートに
              </p>
            </div>

            {/* タブ切り替え */}
            <div className="flex mb-8 relative">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`flex-1 px-4 py-3 text-base font-medium transition-colors relative z-10 ${
                  isLogin ? 'text-[#E58A7B]' : 'text-gray-600'
                }`}
              >
                ログイン
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 px-4 py-3 text-base font-medium transition-colors relative z-10 ${
                  !isLogin ? 'text-[#E58A7B]' : 'text-gray-600'
                }`}
              >
                新規登録
              </button>
              <div
                className={`absolute bottom-0 h-0.5 bg-[#E58A7B] transition-all duration-300 ease-in-out ${
                  isLogin ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
                }`}
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in slide-in-from-top duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* メール認証フォーム */}
            <form onSubmit={handleEmailAuth} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#E58A7B] focus:border-transparent transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#E58A7B] focus:border-transparent transition-shadow"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E58A7B] hover:bg-[#D4796A] text-white py-3 h-auto disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    処理中...
                  </>
                ) : (
                  isLogin ? 'ログイン' : '新規登録'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">または</span>
              </div>
            </div>

            {/* ソーシャルログイン */}
            <div className="space-y-3">
              <Button
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="outline"
                className="w-full py-3 h-auto border-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Googleで{isLogin ? 'ログイン' : '登録'}
              </Button>

              <Button
                onClick={handleLineAuth}
                disabled={loading}
                className="w-full py-3 h-auto bg-[#06C755] hover:bg-[#05A647] text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                LINEで{isLogin ? 'ログイン' : '登録'}
              </Button>
            </div>

            {!isLogin && (
              <p className="mt-6 text-xs text-gray-500 text-center">
                登録することで、<a href="#" className="text-[#E58A7B] hover:underline">利用規約</a>と
                <a href="#" className="text-[#E58A7B] hover:underline">プライバシーポリシー</a>に同意したことになります
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
