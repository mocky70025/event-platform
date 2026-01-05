import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 環境変数が設定されていない場合の警告（開発環境のみ）
if (typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✓' : '✗',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '✓' : '✗',
  });
}

// 環境変数が設定されていない場合でも、空のクライアントを作成してエラーを防ぐ
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // リフレッシュトークンエラーを適切に処理
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
    },
    global: {
      // リフレッシュトークンエラーをコンソールに表示しない（自動的に処理される）
      headers: {
        'x-client-info': 'organizer-app',
      },
    },
    db: {
      schema: 'public',
    },
  }
);


