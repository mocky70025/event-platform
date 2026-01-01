# イベント出店者・主催者向けプラットフォーム

このリポジトリには3つの独立したNext.jsアプリケーションが含まれています：

## アプリケーション

### 1. Store（出店者用アプリ）
- **ディレクトリ**: `store/`
- **ポート**: 3001
- **Vercel設定**: Root Directory = `store`

### 2. Organizer（主催者用アプリ）
- **ディレクトリ**: `organizer/`
- **ポート**: 3002
- **Vercel設定**: Root Directory = `organizer`

### 3. Admin（管理者用アプリ）
- **ディレクトリ**: `admin/`
- **ポート**: 3000
- **Vercel設定**: Root Directory = `admin`

## Vercelデプロイ設定

各アプリは**独立したVercelプロジェクト**として設定する必要があります：

1. Vercelで新しいプロジェクトを作成
2. このリポジトリを接続
3. **重要**: Project Settings → General → Root Directory を設定
   - Store: `store`
   - Organizer: `organizer`
   - Admin: `admin`
4. Environment Variablesを各プロジェクトに設定（`.env.local`参照）

## ローカル開発

```bash
# 各アプリのディレクトリで実行
cd store  # または organizer, admin
npm install
npm run dev
```

## ビルド

```bash
cd store  # または organizer, admin
npm run build
```

## 環境変数

各アプリのルートディレクトリに`.env.local`を作成してください。
詳細は`完全セットアップガイド.md`を参照。
