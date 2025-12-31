# イベントプラットフォーム - 出店者・主催者両対応

出店者（exhibitor）と主催者（organizer）の両方向けのイベントプラットフォームアプリケーションです。

## プロジェクト構造

```
tomorrow/
├── store/          # 出店者向けアプリ（ポート: 3001）
├── organizer/      # 主催者向けアプリ（ポート: 3002）
└── admin/          # 管理者向けアプリ（ポート: 3003）
```

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **認証・データベース**: Supabase
- **スタイリング**: インラインスタイル（シンプルなデザイン）
- **状態管理**: React Hooks (useState, useEffect)

## クイックスタート

### 自動セットアップ（推奨）

```bash
# セットアップスクリプトを実行
./setup.sh
```

### 手動セットアップ

#### 1. 依存関係のインストール

```bash
# 出店者向けアプリ
cd store
npm install

# 主催者向けアプリ
cd ../organizer
npm install
```

**または、セットアップスクリプトを使用:**

```bash
./setup.sh
```

### 2. 環境変数の設定

**詳細な設定手順は [ENV_SETUP.md](./ENV_SETUP.md) を参照してください。**

各アプリのルートディレクトリに `.env.local` ファイルを作成し、以下の環境変数を設定してください。

#### store/.env.local
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=your_line_channel_id
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3001/auth/callback
```

#### organizer/.env.local
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=your_line_channel_id
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3002/auth/callback
```

### 3. Supabaseデータベースのセットアップ

**詳細なSQLスキーマとRLSポリシーは [ENV_SETUP.md](./ENV_SETUP.md) を参照してください。**

以下のテーブルをSupabaseに作成してください：

- `organizers` - 主催者情報
- `exhibitors` - 出店者情報
- `events` - イベント情報
- `event_applications` - イベント申し込み
- `notifications` - 通知

### 4. Supabase Storageのセットアップ

**詳細な設定手順は [ENV_SETUP.md](./ENV_SETUP.md) を参照してください。**

以下のバケットを作成してください：

- `documents` - 書類画像用（プライベート）
- `images` - イベント画像用（パブリック）

### 5. アプリの起動

```bash
# 出店者向けアプリ（ポート: 3001）
cd store
npm run dev

# 主催者向けアプリ（ポート: 3002）
cd organizer
npm run dev

# 管理者向けアプリ（ポート: 3003）
cd admin
npm run dev
```

## 機能

### 出店者向けアプリ（store/）

- 認証機能（LINE、Google、メール認証）
- 情報登録フォーム（3ステップ）
- 書類画像認識機能（OpenAI API）
  - 営業許可証
  - 車検証
  - 自賠責保険
  - PL保険
- イベント一覧・検索
- イベント申し込み
- 申し込み履歴管理
- プロフィール管理
- 通知機能

### 主催者向けアプリ（organizer/）

- 認証機能（LINE、Google、メール認証）
- 情報登録フォーム
- イベント作成・編集（7ステップ）
- イベント一覧管理
- 申し込み管理（承認・却下）
- プロフィール管理
- 通知機能

### 管理者向けアプリ（admin/）

- 管理者認証（メール認証のみ）
- ダッシュボード（統計情報）
- 主催者管理（承認・却下）
- 出店者管理（一覧・検索）
- イベント管理（承認）
- 承認待ち項目の一覧表示

## 重要な実装ポイント

### セッション管理

セッションが無効な場合、必ず`sessionStorage.clear()`で完全にクリアしてWelcomeScreenを表示します。これにより、セッションが無効でもsessionStorageにデータが残っているとWelcomeScreenが表示されない問題を防ぎます。

### エラーハンドリング

すべてのAPI呼び出しでエラーハンドリングを実装し、ユーザーフレンドリーなエラーメッセージを表示します。特に、`approval_status`カラムが存在しない場合の対応を含みます。

## ドキュメント

### 🚀 セットアップ関連
- **[完全セットアップガイド](./完全セットアップガイド.md)** ⭐ **全機能を完璧に設定する詳細ガイド**
- **[Vercel新規デプロイガイド](./VERCEL_新規デプロイガイド.md)** 🚀 **新規Vercelプロジェクト作成からデプロイまで**
- [Vercel環境変数設定](./VERCEL_環境変数設定.md) - 既存Vercelの環境変数更新
- [セットアップガイド](./SETUP.md) - 基本的なセットアップ手順
- [環境変数設定ガイド](./ENV_SETUP.md) - 環境変数の設定手順

### 📚 機能別ガイド
- [OCR実装ガイド](./OCR_IMPLEMENTATION.md) - 画像認識機能の実装詳細
- [管理者向けセットアップ](./ADMIN_SETUP.md) - 管理者アプリの設定手順
- [v0 UI生成プロンプト集](./v0-prompts.md) - UIコンポーネント生成用

## ライセンス

このプロジェクトは内部使用を目的としています。

