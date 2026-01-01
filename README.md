# 🎪 イベント出店者・主催者向けプラットフォーム

> プロフェッショナルなイベント管理プラットフォーム  
> Next.js 14 + Supabase + Tailwind CSS + shadcn/ui

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E)](https://supabase.com/)

## 📖 概要

このモノレポには、イベントプラットフォームを構成する**3つの独立したNext.jsアプリケーション**が含まれています。

- **出店者アプリ**: イベント検索・応募・書類管理
- **主催者アプリ**: イベント作成・応募者管理・承認フロー
- **管理者アプリ**: プラットフォーム全体の統括・承認管理

## 🚀 アプリケーション一覧

### 1. 🏪 Store（出店者用アプリ）

**ターゲットユーザー**: フードトラック・露店の出店者

| 項目 | 内容 |
|------|------|
| **ディレクトリ** | `store/` |
| **開発ポート** | 3001 |
| **ブランドカラー** | #5DABA8（ティール） |
| **主要機能** | イベント検索、オンライン申し込み、書類管理、プロフィール管理 |
| **Vercel設定** | Root Directory = `store` |

**主要画面**:
- ✨ ウェルカム画面（ログイン・新規登録）
- 📊 ダッシュボード（統計・お知らせ・クイックアクション）
- 🔍 イベント検索（フィルター・ソート・ページネーション）
- 📋 イベント詳細・応募管理
- 👤 プロフィール・書類管理

### 2. 🎯 Organizer（主催者用アプリ）

**ターゲットユーザー**: イベント主催者・企画者

| 項目 | 内容 |
|------|------|
| **ディレクトリ** | `organizer/` |
| **開発ポート** | 3002 |
| **ブランドカラー** | #E58A7B（コーラル） |
| **主要機能** | イベント作成、応募者管理、承認フロー、通知機能 |
| **Vercel設定** | Root Directory = `organizer` |

**主要画面**:
- ✨ ウェルカム画面（ログイン・新規登録）
- 📊 ダッシュボード（開催中イベント・承認待ち・統計）
- ➕ イベント作成（7ステップフォーム）
- 📝 応募者管理・承認
- 🔔 通知センター

### 3. 🛡️ Admin（管理者用アプリ）

**ターゲットユーザー**: プラットフォーム管理者

| 項目 | 内容 |
|------|------|
| **ディレクトリ** | `admin/` |
| **開発ポート** | 3000 |
| **ブランドカラー** | #3B82F6（ブルー） |
| **主要機能** | ユーザー管理、承認フロー、統計情報、システム管理 |
| **Vercel設定** | Root Directory = `admin` |

**主要画面**:
- 🔐 管理者ログイン（セキュア）
- 📊 統計ダッシュボード（リアルタイム）
- 👥 主催者・出店者管理
- ✅ 承認フロー（出店者・イベント）
- 📈 全体統計・レポート

## 🎨 デザインシステム

### カラーパレット

```css
/* 出店者アプリ */
--store-primary: #5DABA8;
--store-hover: #4A9693;

/* 主催者アプリ */
--organizer-primary: #E58A7B;
--organizer-hover: #D4796A;

/* 管理者アプリ */
--admin-primary: #3B82F6;
--admin-hover: #2563EB;
```

### 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript 5.0
- **スタイリング**: Tailwind CSS 3.0
- **UIコンポーネント**: shadcn/ui
- **アイコン**: Lucide React
- **認証**: Supabase Auth (Email, Google, LINE)
- **データベース**: Supabase PostgreSQL
- **ストレージ**: Supabase Storage
- **デプロイ**: Vercel

## 🛠️ セットアップ

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上
- Supabaseアカウント
- Vercelアカウント（デプロイ時）

### 1. リポジトリのクローン

```bash
git clone https://github.com/mocky70025/event-platform.git
cd event-platform
```

### 2. 各アプリの依存関係をインストール

```bash
# 出店者アプリ
cd store
npm install

# 主催者アプリ
cd ../organizer
npm install

# 管理者アプリ
cd ../admin
npm install
```

### 3. 環境変数の設定

各アプリのルートディレクトリに `.env.local` を作成してください。

**詳細は `完全セットアップガイド.md` を参照**

#### Store（出店者）

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=your_line_channel_id
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3001/auth/callback
OPENAI_API_KEY=your_openai_api_key
```

#### Organizer（主催者）

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=your_line_channel_id
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3002/auth/callback
```

#### Admin（管理者）

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

### 4. 開発サーバーの起動

各アプリを個別のターミナルで起動します：

```bash
# ターミナル1: 出店者アプリ
cd store
npm run dev

# ターミナル2: 主催者アプリ
cd organizer
npm run dev

# ターミナル3: 管理者アプリ
cd admin
npm run dev
```

### 5. ブラウザでアクセス

- 出店者: http://localhost:3001
- 主催者: http://localhost:3002
- 管理者: http://localhost:3000

## 🌐 Vercelデプロイ

### 重要: モノレポ構成

各アプリは**独立したVercelプロジェクト**として設定する必要があります。

### デプロイ手順

#### 1. Vercelプロジェクトを作成

各アプリごとに以下を実施：

1. Vercelダッシュボードで「New Project」
2. GitHubリポジトリを接続（`mocky70025/event-platform`）
3. **Project Settings → General → Root Directory** を設定:
   - Store: `store`
   - Organizer: `organizer`
   - Admin: `admin`

#### 2. 環境変数を設定

各Vercelプロジェクトで、対応する環境変数を追加してください。

#### 3. デプロイ

設定を保存すると自動的にデプロイが開始されます。

### トラブルシューティング

#### ❌ Module not found エラー

**原因**: Root Directoryが正しく設定されていない

**解決方法**:
1. Vercel Project Settings → General
2. Root Directory を確認・修正
3. Redeploy

#### ❌ Environment variables not found

**原因**: 環境変数が設定されていない

**解決方法**:
1. Vercel Project Settings → Environment Variables
2. 必要な環境変数を全て追加
3. Redeploy

## 📦 ビルド

各アプリを個別にビルド：

```bash
# 出店者アプリ
cd store
npm run build

# 主催者アプリ
cd organizer
npm run build

# 管理者アプリ
cd admin
npm run build
```

## 🧪 テスト

```bash
# 各アプリで実行
npm run test
```

## 📚 ドキュメント

- **完全セットアップガイド**: `完全セットアップガイド.md`
- **v0デザインプロンプト**: `V0_MASTER_PROMPT.md`
- **デザイン仕様書**: `v0-design-prompts.md`
- **出店者詳細設計**: `store-detailed-design.md`

## 🎯 主要機能

### 出店者アプリ

- ✅ メール・Google・LINE認証
- ✅ イベント検索（フィルター・ソート）
- ✅ オンライン申し込み
- ✅ OCR書類認識（OpenAI Vision API）
- ✅ 応募履歴管理
- ✅ 通知機能
- ✅ プロフィール管理

### 主催者アプリ

- ✅ メール・Google・LINE認証
- ✅ イベント作成（7ステップフォーム）
- ✅ 応募者管理
- ✅ 承認・却下フロー
- ✅ リアルタイム通知
- ✅ 統計ダッシュボード

### 管理者アプリ

- ✅ メール・Google認証
- ✅ 出店者承認管理
- ✅ イベント承認管理
- ✅ ユーザー管理
- ✅ 統計レポート
- ✅ システム監視

## 🏗️ プロジェクト構成

```
event-platform/
├── store/                    # 出店者アプリ
│   ├── app/
│   │   ├── components/       # React コンポーネント
│   │   ├── api/              # API ルート
│   │   └── auth/             # 認証ページ
│   ├── lib/                  # ユーティリティ
│   ├── components/           # 共有コンポーネント
│   │   └── ui/               # shadcn/ui
│   └── public/               # 静的ファイル
├── organizer/                # 主催者アプリ
│   ├── app/
│   ├── lib/
│   └── components/
├── admin/                    # 管理者アプリ
│   ├── app/
│   ├── lib/
│   └── components/
├── 完全セットアップガイド.md   # セットアップ手順
├── V0_MASTER_PROMPT.md       # v0マスタープロンプト
└── README.md                 # このファイル
```

## 🤝 コントリビューション

プルリクエストを歓迎します！

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 👨‍💻 作者

**mocky70025**

- GitHub: [@mocky70025](https://github.com/mocky70025)

## 🙏 謝辞

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

---

**⭐️ このプロジェクトが役に立ったら、スターをお願いします！**
