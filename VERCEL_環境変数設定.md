# Vercel 環境変数設定ガイド

GitHubにプッシュ完了後、Vercelで環境変数を設定します。

## 前提条件

- GitHubリポジトリ: https://github.com/mocky70025/tomorrow-event-platform
- すでにVercelにデプロイ済み

## 設定が必要な環境変数

### 共通（store / organizer / admin 全て）

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### store のみ

```
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID (出店者用)
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI
OPENAI_API_KEY
```

### organizer のみ

```
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID (主催者用)
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI
```

### admin のみ

```
NEXT_PUBLIC_ADMIN_EMAILS
```

---

## 手順1: Vercelダッシュボードにアクセス

1. https://vercel.com/ にアクセス
2. ログイン
3. `tomorrow-event-platform` プロジェクトを選択

---

## 手順2: store アプリの環境変数設定

### 2-1. storeアプリを選択

- プロジェクト一覧から `tomorrow-event-platform-store` を選択
- または、該当するstoreのデプロイを選択

### 2-2. Settings > Environment Variables

1. 左サイドバーの「Settings」をクリック
2. 「Environment Variables」をクリック

### 2-3. 環境変数を追加

以下の環境変数を**1つずつ**追加します：

#### ① NEXT_PUBLIC_SUPABASE_URL

- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://ybrsltkmllokexwyutik.supabase.co`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

#### ② NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnNsdGttbGxva2V4d3l1dGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU5MDMsImV4cCI6MjA4MjcwMTkwM30.s3Y2qgbtCqrG2kuNXZk8hz3cEjCEWmPMC1zNU2mMHZ8`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

#### ③ NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID

- **Key**: `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID`
- **Value**: `2008802740`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

#### ④ NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI

- **Key**: `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI`
- **Value**: `https://your-store-app-url.vercel.app/auth/callback`
  - **注意**: `your-store-app-url` を実際のVercel URLに置き換えてください
  - 例: `https://tomorrow-event-platform-store.vercel.app/auth/callback`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

#### ⑤ OPENAI_API_KEY

- **Key**: `OPENAI_API_KEY`
- **Value**: `your_openai_api_key_here` （完全セットアップガイドで取得したAPIキーを使用）
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

---

## 手順3: organizer アプリの環境変数設定

### 3-1. organizerアプリを選択

- プロジェクト一覧から `tomorrow-event-platform-organizer` を選択

### 3-2. Settings > Environment Variables

#### ① NEXT_PUBLIC_SUPABASE_URL

- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://ybrsltkmllokexwyutik.supabase.co`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

#### ② NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnNsdGttbGxva2V4d3l1dGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU5MDMsImV4cCI6MjA4MjcwMTkwM30.s3Y2qgbtCqrG2kuNXZk8hz3cEjCEWmPMC1zNU2mMHZ8`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

#### ③ NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID

- **Key**: `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID`
- **Value**: `2008802751` （主催者用のChannel ID）
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

#### ④ NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI

- **Key**: `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI`
- **Value**: `https://your-organizer-app-url.vercel.app/auth/callback`
  - **注意**: `your-organizer-app-url` を実際のVercel URLに置き換えてください
  - 例: `https://tomorrow-event-platform-organizer.vercel.app/auth/callback`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

---

## 手順4: admin アプリの環境変数設定

### 4-1. adminアプリを選択

- プロジェクト一覧から `tomorrow-event-platform-admin` を選択

### 4-2. Settings > Environment Variables

#### ① NEXT_PUBLIC_SUPABASE_URL

- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://ybrsltkmllokexwyutik.supabase.co`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

#### ② NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnNsdGttbGxva2V4d3l1dGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU5MDMsImV4cCI6MjA4MjcwMTkwM30.s3Y2qgbtCqrG2kuNXZk8hz3cEjCEWmPMC1zNU2mMHZ8`
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

#### ③ NEXT_PUBLIC_ADMIN_EMAILS

- **Key**: `NEXT_PUBLIC_ADMIN_EMAILS`
- **Value**: `admin@example.com,youremail@gmail.com`
  - **注意**: カンマ区切りで複数指定可能
  - 実際に使用するメールアドレスを設定してください
- **Environments**: ✅ Production ✅ Preview ✅ Development
- 「Save」をクリック

---

## 手順5: LINE Loginの本番環境Callback URL設定

### 5-1. 出店者向けチャネル (store)

1. LINE Developersコンソールにアクセス: https://developers.line.biz/console/
2. 出店者向けチャネル（Channel ID: 2008802740）を選択
3. 「LINE Login」タブをクリック
4. 「Callback URL」に以下を追加:
   ```
   https://tomorrow-event-platform-store.vercel.app/auth/callback
   ```
5. 「Update」をクリック

### 5-2. 主催者向けチャネル (organizer)

1. 主催者向けチャネル（Channel ID: 2008802751）を選択
2. 「LINE Login」タブをクリック
3. 「Callback URL」に以下を追加:
   ```
   https://tomorrow-event-platform-organizer.vercel.app/auth/callback
   ```
4. 「Update」をクリック

---

## 手順6: Google認証の本番環境Callback URL設定

1. Google Cloud Console にアクセス: https://console.cloud.google.com/
2. プロジェクトを選択
3. 「APIとサービス」→「認証情報」
4. 作成したOAuthクライアントIDをクリック
5. 「承認済みのリダイレクトURI」に以下を追加:
   ```
   https://ybrsltkmllokexwyutik.supabase.co/auth/v1/callback
   ```
   （これはSupabaseのCallback URLなので変更不要）
6. 「保存」をクリック

---

## 手順7: Vercelで再デプロイ

環境変数を設定した後、再デプロイが必要です。

### 7-1. 自動デプロイ

- GitHubにプッシュすると自動的にデプロイされます
- 既にプッシュ済みなので、待つだけでOK

### 7-2. 手動デプロイ（オプション）

各アプリのVercelダッシュボードで:

1. 「Deployments」タブをクリック
2. 最新のデプロイの「...」メニューをクリック
3. 「Redeploy」をクリック
4. 「Redeploy」を確認

---

## 手順8: 動作確認

### 8-1. store アプリ

- URL: https://tomorrow-event-platform-store.vercel.app
- ✅ ログイン画面が表示される
- ✅ LINE Loginボタンが動作する
- ✅ Google認証が動作する
- ✅ メール認証が動作する

### 8-2. organizer アプリ

- URL: https://tomorrow-event-platform-organizer.vercel.app
- ✅ ログイン画面が表示される
- ✅ LINE Loginボタンが動作する
- ✅ Google認証が動作する
- ✅ メール認証が動作する

### 8-3. admin アプリ

- URL: https://tomorrow-event-platform-admin.vercel.app
- ✅ 管理者ログイン画面が表示される
- ✅ 管理者メールアドレスでログインできる
- ✅ ダッシュボードが表示される

---

## トラブルシューティング

### エラー: "Missing environment variables"

→ Vercelで環境変数が正しく設定されているか確認
→ 再デプロイしてみる

### LINE Loginが動作しない

→ Callback URLが正しく設定されているか確認
→ ローカル環境用のCallback URLも残しておく
→ Channel IDが正しいか確認

### Google認証が動作しない

→ Google Cloud ConsoleでCallback URLが正しいか確認
→ Client IDとSecretが正しいか確認

### 管理者ログインができない

→ `NEXT_PUBLIC_ADMIN_EMAILS`にメールアドレスが含まれているか確認
→ Supabaseでユーザーが作成されているか確認

---

## 環境変数一覧（コピペ用）

### store アプリ

```
NEXT_PUBLIC_SUPABASE_URL=https://ybrsltkmllokexwyutik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnNsdGttbGxva2V4d3l1dGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU5MDMsImV4cCI6MjA4MjcwMTkwM30.s3Y2qgbtCqrG2kuNXZk8hz3cEjCEWmPMC1zNU2mMHZ8
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=2008802740
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=https://tomorrow-event-platform-store.vercel.app/auth/callback
OPENAI_API_KEY=your_openai_api_key_here
```

### organizer アプリ

```
NEXT_PUBLIC_SUPABASE_URL=https://ybrsltkmllokexwyutik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnNsdGttbGxva2V4d3l1dGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU5MDMsImV4cCI6MjA4MjcwMTkwM30.s3Y2qgbtCqrG2kuNXZk8hz3cEjCEWmPMC1zNU2mMHZ8
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=2008802751
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=https://tomorrow-event-platform-organizer.vercel.app/auth/callback
```

### admin アプリ

```
NEXT_PUBLIC_SUPABASE_URL=https://ybrsltkmllokexwyutik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnNsdGttbGxva2V4d3l1dGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU5MDMsImV4cCI6MjA4MjcwMTkwM30.s3Y2qgbtCqrG2kuNXZk8hz3cEjCEWmPMC1zNU2mMHZ8
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,youremail@gmail.com
```

---

## 完了チェックリスト

- [ ] storeアプリの環境変数設定（5つ）
- [ ] organizerアプリの環境変数設定（4つ）
- [ ] adminアプリの環境変数設定（3つ）
- [ ] LINE Login Callback URL設定（2つ）
- [ ] Google認証Callback URL確認
- [ ] Vercelで再デプロイ
- [ ] storeアプリの動作確認
- [ ] organizerアプリの動作確認
- [ ] adminアプリの動作確認

すべて完了したら、本番環境で使用できます！

