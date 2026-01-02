# Vercel 新規デプロイガイド

GitHubリポジトリから新しいVercelプロジェクトを作成してデプロイします。

## 📋 前提条件

- GitHubリポジトリ: https://github.com/mocky70025/tomorrow-event-platform
- 3つのアプリ（store / organizer / admin）をそれぞれ別プロジェクトとしてデプロイ

---

## 第1章: store アプリのデプロイ

### ステップ1-1: Vercelにアクセス

1. https://vercel.com/ にアクセス
2. 「Sign Up」または「Log In」
3. GitHubアカウントで認証

### ステップ1-2: 新規プロジェクトを作成

1. ダッシュボードで「Add New...」をクリック
2. 「Project」を選択

### ステップ1-3: GitHubリポジトリをインポート

1. 「Import Git Repository」セクションで
2. `mocky70025/tomorrow-event-platform` を検索
3. 「Import」をクリック

### ステップ1-4: プロジェクトを設定

#### Configure Project

- **Project Name**: `tomorrow-event-platform-store`（推奨）
- **Framework Preset**: `Next.js` （自動検出される）
- **Root Directory**: `store` ← **重要！**
  - 「Edit」をクリック
  - `store` を選択
  - 「Continue」をクリック

#### Build and Output Settings

- デフォルトのままでOK
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

#### Environment Variables

後で設定するので、今はスキップ。

### ステップ1-5: デプロイ

1. 「Deploy」をクリック
2. デプロイが開始されます（2-3分）
3. 完了すると、URLが表示されます
   - 例: `https://tomorrow-event-platform-store.vercel.app`

### ステップ1-6: 環境変数を設定

1. デプロイ完了画面で「Continue to Dashboard」をクリック
2. 「Settings」タブをクリック
3. 左メニューの「Environment Variables」をクリック

#### 環境変数を追加（5つ）

**① NEXT_PUBLIC_SUPABASE_URL**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://ybrsltkmllokexwyutik.supabase.co`
- Environments: ✅ Production ✅ Preview ✅ Development
- 「Save」

**② NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnNsdGttbGxva2V4d3l1dGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU5MDMsImV4cCI6MjA4MjcwMTkwM30.s3Y2qgbtCqrG2kuNXZk8hz3cEjCEWmPMC1zNU2mMHZ8`
- Environments: ✅ Production ✅ Preview ✅ Development
- 「Save」

**③ NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID**
- Key: `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID`
- Value: `2008802740`
- Environments: ✅ Production ✅ Preview ✅ Development
- 「Save」

**④ NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI**
- Key: `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI`
- Value: `https://tomorrow-event-platform-store.vercel.app/auth/callback`
  - **注意**: 実際のVercel URLに置き換えてください
- Environments: ✅ Production ✅ Preview ✅ Development
- 「Save」

**⑤ OPENAI_API_KEY**
- Key: `OPENAI_API_KEY`
- Value: `完全セットアップガイドで取得したAPIキー`
- Environments: ✅ Production ✅ Preview ✅ Development
- 「Save」

### ステップ1-7: 再デプロイ

1. 「Deployments」タブをクリック
2. 最新のデプロイの「...」メニューをクリック
3. 「Redeploy」をクリック
4. 「Redeploy」を確認

### ステップ1-8: 動作確認

1. デプロイ完了後、URLにアクセス
2. ✅ ログイン画面が表示されればOK

---

## 第2章: organizer アプリのデプロイ

### ステップ2-1: 新規プロジェクトを作成

1. Vercelダッシュボードに戻る
2. 「Add New...」→「Project」
3. 同じリポジトリ `mocky70025/tomorrow-event-platform` を選択
4. 「Import」をクリック

### ステップ2-2: プロジェクトを設定

- **Project Name**: `tomorrow-event-platform-organizer`
- **Framework Preset**: `Next.js`
- **Root Directory**: `organizer` ← **重要！**
  - 「Edit」をクリック
  - `organizer` を選択
  - 「Continue」をクリック

### ステップ2-3: デプロイ

1. 「Deploy」をクリック
2. デプロイ完了を待つ
3. URLをメモ
   - 例: `https://tomorrow-event-platform-organizer.vercel.app`

### ステップ2-4: 環境変数を設定

「Settings」→「Environment Variables」で以下を追加：

**① NEXT_PUBLIC_SUPABASE_URL**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://ybrsltkmllokexwyutik.supabase.co`
- 「Save」

**② NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnNsdGttbGxva2V4d3l1dGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU5MDMsImV4cCI6MjA4MjcwMTkwM30.s3Y2qgbtCqrG2kuNXZk8hz3cEjCEWmPMC1zNU2mMHZ8`
- 「Save」

**③ NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID**
- Key: `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID`
- Value: `2008802751` （主催者用のChannel ID）
- 「Save」

**④ NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI**
- Key: `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI`
- Value: `https://tomorrow-event-platform-organizer.vercel.app/auth/callback`
  - **注意**: 実際のVercel URLに置き換えてください
- 「Save」

### ステップ2-5: 再デプロイ

1. 「Deployments」→最新のデプロイ→「Redeploy」
2. デプロイ完了を待つ
3. URLにアクセスして動作確認

---

## 第3章: admin アプリのデプロイ

### ステップ3-1: 新規プロジェクトを作成

1. Vercelダッシュボードに戻る
2. 「Add New...」→「Project」
3. 同じリポジトリ `mocky70025/tomorrow-event-platform` を選択
4. 「Import」をクリック

### ステップ3-2: プロジェクトを設定

- **Project Name**: `tomorrow-event-platform-admin`
- **Framework Preset**: `Next.js`
- **Root Directory**: `admin` ← **重要！**
  - 「Edit」をクリック
  - `admin` を選択
  - 「Continue」をクリック

### ステップ3-3: デプロイ

1. 「Deploy」をクリック
2. デプロイ完了を待つ
3. URLをメモ
   - 例: `https://tomorrow-event-platform-admin.vercel.app`

### ステップ3-4: 環境変数を設定

「Settings」→「Environment Variables」で以下を追加：

**① NEXT_PUBLIC_SUPABASE_URL**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://ybrsltkmllokexwyutik.supabase.co`
- 「Save」

**② NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicnNsdGttbGxva2V4d3l1dGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU5MDMsImV4cCI6MjA4MjcwMTkwM30.s3Y2qgbtCqrG2kuNXZk8hz3cEjCEWmPMC1zNU2mMHZ8`
- 「Save」

**③ NEXT_PUBLIC_ADMIN_EMAILS**
- Key: `NEXT_PUBLIC_ADMIN_EMAILS`
- Value: `admin@example.com,youremail@gmail.com`
  - **注意**: 実際に使用するメールアドレスに置き換えてください
  - カンマ区切りで複数指定可能
- 「Save」

### ステップ3-5: 再デプロイ

1. 「Deployments」→最新のデプロイ→「Redeploy」
2. デプロイ完了を待つ
3. URLにアクセスして動作確認

---

## 第4章: LINE Login Callback URL の設定

本番環境のURLが確定したので、LINE Loginの設定を更新します。

### ステップ4-1: 出店者向けチャネル (store)

1. https://developers.line.biz/console/ にアクセス
2. 出店者向けチャネル（Channel ID: 2008802740）を選択
3. 「LINE Login」タブをクリック
4. 「Callback URL」に**追加**:
   ```
   https://tomorrow-event-platform-store.vercel.app/auth/callback
   ```
   - **注意**: 実際のVercel URLに置き換えてください
   - ローカル開発用のURLも残しておく
5. 「Update」をクリック

### ステップ4-2: 主催者向けチャネル (organizer)

1. 主催者向けチャネル（Channel ID: 2008802751）を選択
2. 「LINE Login」タブをクリック
3. 「Callback URL」に**追加**:
   ```
   https://tomorrow-event-platform-organizer.vercel.app/auth/callback
   ```
   - **注意**: 実際のVercel URLに置き換えてください
4. 「Update」をクリック

---

## 第5章: 動作確認

### 5-1. store アプリ

URL: `https://tomorrow-event-platform-store.vercel.app`

- ✅ ログイン画面が表示される
- ✅ LINE Loginボタンをクリックして認証
- ✅ Google認証をテスト
- ✅ メール認証をテスト
- ✅ 登録フォームが表示される
- ✅ 画像アップロードが動作する

### 5-2. organizer アプリ

URL: `https://tomorrow-event-platform-organizer.vercel.app`

- ✅ ログイン画面が表示される
- ✅ LINE Loginボタンをクリックして認証
- ✅ Google認証をテスト
- ✅ 登録フォームが表示される
- ✅ イベント作成フォームが動作する

### 5-3. admin アプリ

URL: `https://tomorrow-event-platform-admin.vercel.app`

- ✅ 管理者ログイン画面が表示される
- ✅ 管理者メールアドレスでログイン
- ✅ ダッシュボードが表示される
- ✅ 統計情報が表示される

---

## 📝 デプロイ完了チェックリスト

### store アプリ
- [ ] Vercelプロジェクト作成
- [ ] Root Directory: `store` に設定
- [ ] 環境変数設定（5つ）
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID
  - [ ] NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI
  - [ ] OPENAI_API_KEY
- [ ] 再デプロイ
- [ ] LINE Login Callback URL設定
- [ ] 動作確認

### organizer アプリ
- [ ] Vercelプロジェクト作成
- [ ] Root Directory: `organizer` に設定
- [ ] 環境変数設定（4つ）
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID
  - [ ] NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI
- [ ] 再デプロイ
- [ ] LINE Login Callback URL設定
- [ ] 動作確認

### admin アプリ
- [ ] Vercelプロジェクト作成
- [ ] Root Directory: `admin` に設定
- [ ] 環境変数設定（3つ）
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] NEXT_PUBLIC_ADMIN_EMAILS
- [ ] 再デプロイ
- [ ] 動作確認

---

## 🎉 デプロイ完了！

すべてのアプリが本番環境で動作します！

### 📱 本番環境URL

- **出店者向けアプリ**: https://tomorrow-event-platform-store.vercel.app
- **主催者向けアプリ**: https://tomorrow-event-platform-organizer.vercel.app
- **管理者向けアプリ**: https://tomorrow-event-platform-admin.vercel.app

### 🔄 自動デプロイ

GitHubの`main`ブランチにプッシュすると、自動的に3つのアプリがデプロイされます。

---

## 🆘 トラブルシューティング

### エラー: "Root Directory not found"

→ Root Directoryの設定を確認
→ `store`、`organizer`、`admin` を正しく選択

### エラー: "Missing environment variables"

→ 環境変数が正しく設定されているか確認
→ 再デプロイを実行

### LINE Loginが動作しない

→ Callback URLが正しいか確認
→ Channel IDが正しいか確認
→ 本番環境URLとローカル環境URL両方を設定

### 画像がアップロードできない

→ SupabaseのStorageバケットが作成されているか確認
→ ブラウザのコンソールでエラーを確認

---

## 📚 関連ドキュメント

- [完全セットアップガイド](./完全セットアップガイド.md) - ローカル開発環境
- [VERCEL_環境変数設定](./VERCEL_環境変数設定.md) - 環境変数の詳細
- [README](./README.md) - プロジェクト概要

おめでとうございます！本番環境でアプリが使えるようになりました！


