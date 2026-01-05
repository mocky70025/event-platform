# 別々のSupabaseプロジェクト設定手順

主催者アプリと出店者アプリで別々のSupabaseプロジェクトを使用する設定手順です。

## 前提条件

- 既にSupabaseアカウントを持っていること
- 出店者アプリ用のSupabaseプロジェクトが既に存在すること

## ステップ1: 主催者アプリ用のSupabaseプロジェクトを作成

### 1-1. 新しいプロジェクトを作成

1. [Supabase Dashboard](https://app.supabase.com/) にアクセス
2. 「New Project」をクリック
3. 以下の情報を入力：
   - **Name**: `event-platform-organizer`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: 最寄りのリージョンを選択（例: `Northeast Asia (Tokyo)`）
   - **Pricing Plan**: Free tier で問題ありません
4. 「Create new project」をクリック
5. プロジェクトの作成完了を待つ（2-3分かかります）

### 1-2. プロジェクト情報を取得

1. プロジェクトが作成されたら、左サイドバーの「Settings」→「API」をクリック
2. 以下の情報をコピー（後で使用します）：
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ステップ2: データベーススキーマの移行

主催者アプリ用のSupabaseプロジェクトに、出店者アプリ用のSupabaseプロジェクトと同じデータベーススキーマを設定する必要があります。

### 2-1. SQL Editorでスキーマを実行

1. 主催者アプリ用のSupabaseプロジェクトにアクセス
   - Project URL: `https://zcwcqtoraukxfbnfuboj.supabase.co`
2. 左サイドバーの「SQL Editor」をクリック
3. 「New query」をクリック
4. 以下のSQLファイルの内容をコピーして実行：
   - `/docs/organizer_supabase_schema.sql`
5. 「Run」ボタンをクリックしてSQLを実行
6. エラーがないことを確認

**重要**: このSQLファイルには、主催者アプリに必要なすべてのテーブル、インデックス、RLSポリシーが含まれています。

### 2-2. 必要なテーブル（参考）

以下のテーブルが必要です：
- `events` - イベント情報
- `organizers` - 主催者情報
- `exhibitors` - 出店者情報
- `applications` - 申し込み情報
- `notifications` - 通知情報

**注意**: 主催者アプリと出店者アプリで別々のSupabaseプロジェクトを使用する場合、データは共有されません。イベント情報や申し込み情報は、それぞれのプロジェクトで独立して管理されます。

## ステップ3: 認証設定

### 3-1. Email認証の設定

1. 主催者アプリ用のSupabaseプロジェクトで、「Authentication」→「Providers」をクリック
2. 「Email」プロバイダーを有効化
3. 「Authentication」→「URL Configuration」をクリック
4. 以下の設定を行う：
   - **Site URL**: 主催者アプリのURL（例: `http://localhost:3002` または本番URL）
   - **Redirect URLs**: 以下を追加：
     ```
     http://localhost:3002/**
     http://localhost:3002/auth/callback
     https://your-organizer-domain.vercel.app/**
     https://your-organizer-domain.vercel.app/auth/callback
     ```

### 3-2. Google認証の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 既存のプロジェクトを選択（または新規作成）
3. 「APIとサービス」→「認証情報」をクリック
4. 既存のOAuth 2.0クライアントIDを選択（または新規作成）
5. 「承認済みのリダイレクトURI」に以下を追加：
   ```
   https://[主催者アプリ用SupabaseプロジェクトのProject URL]/auth/v1/callback
   ```
   例: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`
6. 主催者アプリ用のSupabaseプロジェクトで、「Authentication」→「Providers」をクリック
7. 「Google」プロバイダーを有効化
8. Google Cloud Consoleで取得した「クライアントID」と「クライアントシークレット」を入力
9. 「Save」をクリック

### 3-3. LINE認証の設定

LINE認証は、Supabaseの標準プロバイダーではないため、カスタム実装を使用します。
既存の実装（`/api/auth/line-login`）を使用するため、追加の設定は不要です。

## ステップ4: 環境変数の設定

### 4-1. ローカル開発環境

#### organizer/.env.local

```env
# 主催者アプリ用Supabase設定（新規プロジェクト）
NEXT_PUBLIC_SUPABASE_URL=https://[主催者アプリ用SupabaseプロジェクトのProject URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[主催者アプリ用Supabaseプロジェクトのanon public key]

# LINE Login設定
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=[主催者用LINEチャネルID]
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3002/auth/callback

# ローカル開発用
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

#### store/.env.local（変更なし）

```env
# 出店者アプリ用Supabase設定（既存プロジェクト）
NEXT_PUBLIC_SUPABASE_URL=https://[出店者アプリ用SupabaseプロジェクトのProject URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[出店者アプリ用Supabaseプロジェクトのanon public key]

# LINE Login設定
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=[出店者用LINEチャネルID]
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3001/auth/callback

# ローカル開発用
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 4-2. Vercel（本番環境）

#### organizerアプリの環境変数

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. `tomorrow-event-platform-organizer` プロジェクトを選択
3. 「Settings」→「Environment Variables」をクリック
4. 以下の環境変数を設定：

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[主催者アプリ用SupabaseプロジェクトのProject URL]` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[主催者アプリ用Supabaseプロジェクトのanon public key]` | Production, Preview, Development |
| `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID` | `[主催者用LINEチャネルID]` | Production, Preview, Development |
| `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI` | `https://your-organizer-domain.vercel.app/auth/callback` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-organizer-domain.vercel.app` | Production, Preview, Development |

#### storeアプリの環境変数（変更なし）

既存の環境変数をそのまま使用します。

## ステップ5: コードの確認

コードの変更は不要です。環境変数で自動的に切り替わります。

ただし、以下の点を確認してください：

1. `organizer/lib/supabase.ts` が `process.env.NEXT_PUBLIC_SUPABASE_URL` を使用していること
2. `store/lib/supabase.ts` が `process.env.NEXT_PUBLIC_SUPABASE_URL` を使用していること

これらは既に正しく設定されているため、変更は不要です。

## ステップ6: 動作確認

### 6-1. ローカル環境での確認

1. 主催者アプリを起動：
   ```bash
   cd organizer
   npm run dev
   ```
2. ブラウザで `http://localhost:3002` にアクセス
3. 新規登録を試す（メール認証、Google認証、LINE認証）
4. メールリンクが正しく主催者アプリにリダイレクトされることを確認

### 6-2. 本番環境での確認

1. Vercelで再デプロイを実行
2. 主催者アプリのURLにアクセス
3. 新規登録を試す
4. メールリンクが正しく主催者アプリにリダイレクトされることを確認

## 注意事項

### データの分離

主催者アプリと出店者アプリで別々のSupabaseプロジェクトを使用する場合、データは完全に分離されます：

- **主催者アプリ**: 主催者アプリ用のSupabaseプロジェクトに接続
- **出店者アプリ**: 出店者アプリ用のSupabaseプロジェクトに接続

### イベント情報の共有

別々のSupabaseプロジェクトを使用する場合、イベント情報は共有されません。主催者アプリで作成したイベントは、出店者アプリでは表示されません。

**解決策**: 
- イベント情報を共有する必要がある場合は、同じSupabaseプロジェクトを使用する必要があります
- または、外部APIを経由してデータを同期する必要があります

### 認証の分離

主催者アプリと出店者アプリで別々のSupabaseプロジェクトを使用する場合、認証も完全に分離されます：

- 主催者アプリで登録したユーザーは、出店者アプリではログインできません
- 出店者アプリで登録したユーザーは、主催者アプリではログインできません

これは、主催者と出店者を完全に分離したい場合には適切な設計です。

## トラブルシューティング

### メールリンクが正しくリダイレクトされない

1. Supabase Dashboardで「Authentication」→「URL Configuration」を確認
2. 「Redirect URLs」に主催者アプリのURLが正しく追加されているか確認
3. 環境変数 `NEXT_PUBLIC_SUPABASE_URL` が正しく設定されているか確認

### Google認証が動作しない

1. Google Cloud Consoleで「承認済みのリダイレクトURI」に主催者アプリ用のSupabaseプロジェクトのコールバックURLが追加されているか確認
2. Supabase Dashboardで「Authentication」→「Providers」→「Google」の設定を確認

### LINE認証が動作しない

1. LINE Developers ConsoleでコールバックURLが正しく設定されているか確認
2. 環境変数 `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID` と `NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI` が正しく設定されているか確認

