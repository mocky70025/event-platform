# Vercelアカウント変更手順

Vercelアカウントを変更する際に必要な作業をまとめました。

## 📋 コードの変更

**コードの変更は不要です。** 環境変数と設定のみ変更が必要です。

## 🔄 必要な作業

### 1. 新しいVercelアカウントでプロジェクトを作成

#### 1-1. GitHubリポジトリを連携

1. 新しいVercelアカウントでログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリ `mocky70025/event-platform` を選択（またはインポート）

#### 1-2. 各アプリのプロジェクトを作成

以下の3つのプロジェクトを作成します：

**① store（出店者アプリ）**
- **Project Name**: `event-platform-store`（任意）
- **Root Directory**: `store`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`（自動検出）
- **Output Directory**: `.next`（自動検出）

**② organizer（主催者アプリ）**
- **Project Name**: `event-platform-organizer`（任意）
- **Root Directory**: `organizer`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`（自動検出）
- **Output Directory**: `.next`（自動検出）

**③ admin（管理者アプリ）**
- **Project Name**: `event-platform-admin`（任意）
- **Root Directory**: `admin`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`（自動検出）
- **Output Directory**: `.next`（自動検出）

### 2. 環境変数の設定

各プロジェクトで、以下の環境変数を設定してください。

#### 2-1. storeアプリの環境変数

**Settings** → **Environment Variables** で以下を設定：

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[出店者アプリ用SupabaseプロジェクトのProject URL]` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[出店者アプリ用Supabaseプロジェクトのanon public key]` | Production, Preview, Development |
| `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID` | `[出店者用LINEチャネルID]` | Production, Preview, Development |
| `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI` | `https://[デプロイ後のURL]/auth/callback` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://[デプロイ後のURL]` | Production, Preview, Development |
| `OPENAI_API_KEY` | `[OpenAI API Key]`（オプション） | Production, Preview, Development |

**注意**: `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI` と `NEXT_PUBLIC_APP_URL` は、初回デプロイ後に生成されたURLに更新してください。

#### 2-2. organizerアプリの環境変数

**Settings** → **Environment Variables** で以下を設定：

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zcwcqtoraukxfbnfuboj.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjd2NxdG9yYXVreGZibmZ1Ym9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTQ3MDgsImV4cCI6MjA4MzEzMDcwOH0.nRzru1C84eLXOMnbHQmc4IZNRJmY_plwT3HU9T0SQXI` | Production, Preview, Development |
| `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID` | `[主催者用LINEチャネルID]` | Production, Preview, Development |
| `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI` | `https://[デプロイ後のURL]/auth/callback` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://[デプロイ後のURL]` | Production, Preview, Development |

**注意**: `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI` と `NEXT_PUBLIC_APP_URL` は、初回デプロイ後に生成されたURLに更新してください。

#### 2-3. adminアプリの環境変数

**Settings** → **Environment Variables** で以下を設定：

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[管理者アプリ用SupabaseプロジェクトのProject URL]` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[管理者アプリ用Supabaseプロジェクトのanon public key]` | Production, Preview, Development |
| `NEXT_PUBLIC_ADMIN_EMAILS` | `admin@example.com,admin2@example.com`（カンマ区切り） | Production, Preview, Development |

### 3. 初回デプロイ

1. 各プロジェクトで「Deploy」をクリック
2. デプロイが完了するまで待つ（各プロジェクト2-3分）
3. デプロイ完了後、生成されたURLを確認
   - 例: `https://event-platform-store-xxxxx.vercel.app`
   - 例: `https://event-platform-organizer-xxxxx.vercel.app`
   - 例: `https://event-platform-admin-xxxxx.vercel.app`

### 4. 環境変数の更新（デプロイ後）

初回デプロイ後、生成されたURLに基づいて環境変数を更新：

1. 各プロジェクトの「Settings」→「Environment Variables」を開く
2. 以下の環境変数を更新：
   - `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI`: `https://[生成されたURL]/auth/callback`
   - `NEXT_PUBLIC_APP_URL`: `https://[生成されたURL]`
3. 「Save」をクリック
4. **再デプロイを実行**（重要）

### 5. 外部サービスの設定更新

#### 5-1. LINE Login設定

1. [LINE Developers Console](https://developers.line.biz/) にアクセス
2. 各チャネル（出店者用・主催者用）を選択
3. 「LINE Login」タブをクリック
4. 「Callback URL」に新しいURLを追加：
   - 出店者用: `https://[storeアプリのURL]/auth/callback`
   - 主催者用: `https://[organizerアプリのURL]/auth/callback`
5. 「Update」をクリック

#### 5-2. Google認証設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「認証情報」をクリック
4. OAuth 2.0クライアントIDを選択
5. 「承認済みのリダイレクトURI」に以下を追加：
   - 出店者用: `https://[出店者アプリ用SupabaseプロジェクトのProject URL]/auth/v1/callback`
   - 主催者用: `https://zcwcqtoraukxfbnfuboj.supabase.co/auth/v1/callback`
6. 「保存」をクリック

#### 5-3. Supabase設定

**出店者アプリ用Supabaseプロジェクト**:
1. Supabase Dashboard → 「Authentication」→「URL Configuration」
2. 「Redirect URLs」に以下を追加：
   ```
   https://[storeアプリのURL]/**
   https://[storeアプリのURL]/auth/callback
   ```

**主催者アプリ用Supabaseプロジェクト**:
1. Supabase Dashboard → 「Authentication」→「URL Configuration」
2. 「Site URL」を `https://[organizerアプリのURL]` に設定
3. 「Redirect URLs」に以下を追加：
   ```
   https://[organizerアプリのURL]/**
   https://[organizerアプリのURL]/auth/callback
   ```

### 6. 動作確認

1. 各アプリのURLにアクセス
2. ログイン画面が表示されることを確認
3. メール認証、Google認証、LINE認証が動作することを確認
4. メールリンクが正しいアプリにリダイレクトされることを確認

## ⚠️ 重要な注意事項

### データの移行

- Vercelアカウントを変更しても、Supabaseのデータは影響を受けません
- ただし、Vercelの環境変数は新しいアカウントで再設定する必要があります

### ドメイン設定

- カスタムドメインを使用している場合、新しいVercelアカウントで再設定が必要です
- DNS設定も更新が必要な場合があります

### 古いプロジェクトの削除

- 古いVercelアカウントのプロジェクトは、必要に応じて削除してください
- 削除する前に、環境変数の値をメモしておくことを推奨します

## 📝 チェックリスト

- [ ] 新しいVercelアカウントでログイン
- [ ] storeアプリのプロジェクトを作成
- [ ] organizerアプリのプロジェクトを作成
- [ ] adminアプリのプロジェクトを作成
- [ ] 各プロジェクトの環境変数を設定
- [ ] 初回デプロイを実行
- [ ] デプロイ後のURLを確認
- [ ] 環境変数をデプロイ後のURLに更新
- [ ] 再デプロイを実行
- [ ] LINE Login設定を更新
- [ ] Google認証設定を更新
- [ ] Supabase設定を更新
- [ ] 動作確認

## 🆘 トラブルシューティング

### デプロイが失敗する

1. 環境変数が正しく設定されているか確認
2. Root Directoryが正しく設定されているか確認（`store`、`organizer`、`admin`）
3. ビルドログを確認してエラーを特定

### 認証が動作しない

1. 環境変数 `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しいか確認
2. Supabase Dashboardで「Authentication」→「URL Configuration」を確認
3. LINE LoginとGoogle認証のコールバックURLが正しく設定されているか確認

### メールリンクが正しくリダイレクトされない

1. Supabase Dashboardで「Authentication」→「URL Configuration」を確認
2. 「Redirect URLs」に正しいURLが追加されているか確認
3. 環境変数 `NEXT_PUBLIC_APP_URL` が正しく設定されているか確認

