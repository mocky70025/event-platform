'use client';

import { useState } from 'react';
import { signInWithEmail } from '../../lib/auth';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Shield, Users, Activity, FileCheck } from 'lucide-react';

export default function WelcomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex bg-gray-50">
      {/* 左側：ブランディングエリア（デスクトップのみ） */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              管理者ダッシュボード
            </h1>
          </div>
          <p className="text-xl text-white/90 mb-12">
            プラットフォーム全体を統括・管理
          </p>
          
          {/* 特徴 */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  ユーザー管理
                </h3>
                <p className="text-white/80 text-sm">
                  主催者・出店者のアカウントを一元管理
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  承認フロー
                </h3>
                <p className="text-white/80 text-sm">
                  出店者・イベントの承認をワンクリックで
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  統計情報
                </h3>
                <p className="text-white/80 text-sm">
                  リアルタイムで全体の状況を把握
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  セキュアな環境
                </h3>
                <p className="text-white/80 text-sm">
                  管理者のみがアクセスできる安全な環境
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-white/60 text-sm">
          © 2024 イベントプラットフォーム - Admin Panel
        </div>
      </div>

      {/* 右側：認証フォーム */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl border-2 border-[#3B82F6]/20">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                管理者ログイン
              </h1>
              <p className="text-gray-600">
                管理者専用ページへアクセス
              </p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in slide-in-from-top duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* メール認証フォーム */}
            <form onSubmit={handleLogin} className="space-y-5">
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
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-shadow"
                    placeholder="admin@example.com"
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
                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-shadow"
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
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3 h-auto disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    認証中...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    管理者としてログイン
                  </>
                )}
              </Button>
            </form>

            {/* 警告メッセージ */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">
                  管理者専用ページ
                </p>
                <p className="text-xs text-amber-700">
                  このページは管理者権限を持つユーザーのみがアクセスできます。不正アクセスは記録されます。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
