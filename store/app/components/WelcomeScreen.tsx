'use client';

import { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth';

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
      // 認証成功後はページがリロードされる
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#333',
        }}>
          出店者向けプラットフォーム
        </h1>

        <div style={{
          display: 'flex',
          marginBottom: '20px',
          borderBottom: '1px solid #e0e0e0',
        }}>
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: isLogin ? '2px solid #5DABA8' : 'none',
              color: isLogin ? '#5DABA8' : '#666',
              fontWeight: isLogin ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ログイン
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: !isLogin ? '2px solid #5DABA8' : 'none',
              color: !isLogin ? '#5DABA8' : '#666',
              fontWeight: !isLogin ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            新規登録
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              color: '#333',
            }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              color: '#333',
            }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#5DABA8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {loading ? '処理中...' : (isLogin ? 'ログイン' : '新規登録')}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          margin: '20px 0',
          color: '#999',
          fontSize: '14px',
        }}>
          または
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'white',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>🔍</span>
          Googleで{isLogin ? 'ログイン' : '登録'}
        </button>

        <button
          onClick={handleLineAuth}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#06C755',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>💬</span>
          LINEで{isLogin ? 'ログイン' : '登録'}
        </button>
      </div>
    </div>
  );
}

