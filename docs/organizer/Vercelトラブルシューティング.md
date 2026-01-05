# Organizerアプリ Vercelトラブルシューティング

## 問題: ページが何も表示されない（ローディングスピナーのみ）

### 確認手順

#### 1. Vercelの環境変数を確認

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. `event-platform-organizer-one` プロジェクトを選択
3. 「Settings」→「Environment Variables」を開く
4. 以下の環境変数が設定されているか確認：

| 環境変数名 | 必須 | 説明 |
|-----------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | SupabaseプロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase匿名キー |

**確認ポイント**:
- 環境変数が存在するか
- 値が正しいか（空でないか）
- 「Production」「Preview」「Development」すべての環境に設定されているか

#### 2. Root Directoryを確認

1. Vercelプロジェクトの「Settings」→「General」を開く
2. 「Root Directory」が `organizer` に設定されているか確認
3. 設定されていない場合、`organizer` に変更して保存

#### 3. デプロイログを確認

1. Vercelプロジェクトの「Deployments」タブを開く
2. 最新のデプロイをクリック
3. 「Build Logs」を確認してエラーがないか確認

**よくあるエラー**:
- `Missing Supabase environment variables`
- `Module not found`
- `Build failed`

#### 4. 再デプロイを実行

環境変数を追加・変更した場合、**必ず再デプロイが必要**です：

1. 「Deployments」タブを開く
2. 最新のデプロイの「⋯」メニューから「Redeploy」を選択
3. または、GitHubにプッシュして自動デプロイをトリガー

### 必要な環境変数の値

`docs/Vercelアカウント変更手順.md` の「2-2. organizerアプリの環境変数」セクションを参照：

```env
NEXT_PUBLIC_SUPABASE_URL=https://zcwcqtoraukxfbnfuboj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjd2NxdG9yYXVreGZibmZ1Ym9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTQ3MDgsImV4cCI6MjA4MzEzMDcwOH0.nRzru1C84eLXOMnbHQmc4IZNRJmY_plwT3HU9T0SQXI
NEXT_PUBLIC_APP_URL=https://event-platform-organizer-one.vercel.app
```

**注意**: `NEXT_PUBLIC_APP_URL` は、実際のデプロイURLに合わせて変更してください。

### ブラウザのコンソールを確認

1. ブラウザで `event-platform-organizer-one.vercel.app` を開く
2. 開発者ツール（F12）を開く
3. 「Console」タブでエラーメッセージを確認

**よくあるエラー**:
- `Missing Supabase environment variables`
- `Failed to fetch`
- `Network error`

### 修正済みのコード

以下の修正を行いました：

1. **環境変数のチェックを改善** (`lib/supabase.ts`)
   - 環境変数が設定されていない場合でもアプリがクラッシュしないように修正
   - 開発環境で警告を表示

2. **エラーメッセージの改善** (`app/page.tsx`)
   - 環境変数が設定されていない場合に明確なエラーメッセージを表示

### 次のステップ

1. ✅ コードの修正をGitHubにプッシュ
2. ✅ Vercelで環境変数を確認・設定
3. ✅ Root Directoryを確認
4. ✅ 再デプロイを実行
5. ✅ ブラウザで動作確認

## 問題: リフレッシュトークンエラー（Invalid Refresh Token）

### エラーメッセージ

```
AuthApiError: Invalid Refresh Token: Refresh Token Not Found
Failed to load resource: the server responded with a status of 400
```

### 原因

このエラーは、Supabaseが自動的にセッションを更新しようとした際に、保存されているリフレッシュトークンが無効または見つからない場合に発生します。

**よくある原因**:
- セッションの有効期限が切れている
- ブラウザのストレージ（localStorage）がクリアされた
- Supabaseプロジェクトの設定が変更された
- 別のデバイス/ブラウザでログアウトされた

### 解決方法

**このエラーは自動的に処理されます**。修正済みのコードでは：

1. ✅ リフレッシュトークンエラーを検出
2. ✅ ストレージを自動的にクリア
3. ✅ ログアウト状態に戻す
4. ✅ ユーザーにエラーメッセージを表示せず、正常にログイン画面を表示

### ユーザー側の対処

エラーが表示されても、**ページをリロード**すれば正常に動作します。自動的にログイン画面が表示されます。

### 開発者側の確認事項

1. **Supabaseプロジェクトの設定を確認**
   - Supabase Dashboard → 「Authentication」→「URL Configuration」
   - 「Redirect URLs」に正しいURLが設定されているか確認

2. **環境変数を確認**
   - `NEXT_PUBLIC_SUPABASE_URL` が正しいか
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しいか

3. **ブラウザのストレージを確認**
   - 開発者ツール → 「Application」→「Local Storage」
   - `supabase.auth.token` が存在するか確認

## 問題: Application error（クライアントサイドエラー）

### エラーメッセージ

```
Application error: a client-side exception has occurred (see the browser console for more information).
```

### 原因

このエラーは、メールリンクやGoogle認証のコールバック処理中にクライアントサイドでエラーが発生した場合に表示されます。

**よくある原因**:
- 認証コールバック処理中のエラー
- 環境変数が設定されていない
- Supabaseクライアントの初期化エラー
- 未処理の例外

### 解決方法

**修正済みのコードでは以下を改善しました**：

1. ✅ **認証コールバック処理の改善** (`app/auth/callback/page.tsx`)
   - エラーハンドリングを強化
   - コンポーネントのアンマウント時の処理を追加
   - エラーメッセージを適切に表示

2. ✅ **グローバルエラーハンドラーの改善** (`app/page.tsx`)
   - リフレッシュトークンエラーのみをキャッチ
   - 認証コールバック処理中のエラーは除外

3. ✅ **ハッシュトークン処理の改善** (`app/page.tsx`)
   - エラーハンドリングを強化
   - エラーメッセージを適切に表示

### 確認手順

1. **ブラウザのコンソールを確認**
   - 開発者ツール（F12）を開く
   - 「Console」タブでエラーメッセージを確認
   - エラーの詳細を確認

2. **環境変数を確認**
   - Vercel Dashboard → プロジェクト → 「Settings」→「Environment Variables」
   - `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されているか確認

3. **Supabase設定を確認**
   - Supabase Dashboard → 「Authentication」→「URL Configuration」
   - 「Redirect URLs」に正しいURLが設定されているか確認

### デバッグ方法

1. **ブラウザのコンソールでエラーを確認**
   ```javascript
   // コンソールで実行して環境変数を確認
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   ```

2. **ネットワークタブでリクエストを確認**
   - 開発者ツール → 「Network」タブ
   - Supabaseへのリクエストが成功しているか確認

3. **ストレージをクリア**
   - 開発者ツール → 「Application」→「Clear storage」
   - すべてのストレージをクリアして再試行

### それでも解決しない場合

1. Vercelのデプロイログの全文を確認
2. ブラウザのコンソールエラーを確認
3. Supabaseプロジェクトがアクティブか確認
4. ネットワーク接続を確認
5. ブラウザのキャッシュとストレージをクリアして再試行
6. 別のブラウザで試行（キャッシュの問題を除外）

