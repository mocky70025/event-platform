# セットアップガイド

このガイドに従って、イベントプラットフォームアプリケーションをセットアップしてください。

## ✅ 完了したステップ

1. ✅ 依存関係のインストール（store/とorganizer/）

## 📝 次のステップ

### 1. 環境変数ファイルの作成

#### store/.env.local を作成

```bash
cd store
touch .env.local
```

以下の内容をコピーして、実際の値に置き換えてください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# LINE Login設定
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=your_line_channel_id_here
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3001/auth/callback

# OpenAI API設定（画像認識機能用）
OPENAI_API_KEY=sk-your_openai_api_key_here
```

#### organizer/.env.local を作成

```bash
cd ../organizer
touch .env.local
```

以下の内容をコピーして、実際の値に置き換えてください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# LINE Login設定
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=your_line_channel_id_here
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3002/auth/callback
```

### 2. 環境変数の取得方法

詳細は [ENV_SETUP.md](./ENV_SETUP.md) を参照してください。

#### Supabase設定

1. [Supabase](https://supabase.com/)にアクセス
2. プロジェクトを作成
3. Settings > API から以下を取得：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### LINE Login設定

1. [LINE Developers](https://developers.line.biz/)にアクセス
2. チャネルを作成
3. Basic settings から以下を取得：
   - Channel ID → `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID`
4. LINE Login タブでコールバックURLを設定

#### OpenAI API設定（オプション）

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. API keys セクションでキーを作成
3. キーをコピー → `OPENAI_API_KEY`

### 3. Supabaseデータベースのセットアップ

[ENV_SETUP.md](./ENV_SETUP.md) の「Supabase設定」セクションを参照して、以下のテーブルを作成してください：

- `organizers`
- `exhibitors`
- `events`
- `event_applications`
- `notifications`

SQLスキーマは [ENV_SETUP.md](./ENV_SETUP.md) に記載されています。

### 4. Supabase Storageのセットアップ

以下のバケットを作成してください：

- `documents` - 書類画像用（プライベート）
- `images` - イベント画像用（パブリック）

詳細は [ENV_SETUP.md](./ENV_SETUP.md) を参照してください。

### 5. アプリの起動

#### 出店者向けアプリ（ポート: 3001）

```bash
cd store
npm run dev
```

ブラウザで http://localhost:3001 にアクセス

#### 主催者向けアプリ（ポート: 3002）

別のターミナルで：

```bash
cd organizer
npm run dev
```

ブラウザで http://localhost:3002 にアクセス

## 🔍 動作確認

### 出店者向けアプリ

1. ログイン/新規登録画面が表示される
2. 認証が正常に動作する
3. 情報登録フォームが表示される
4. 書類アップロードが動作する（OpenAI API設定済みの場合、画像認識も可能）

### 主催者向けアプリ

1. ログイン/新規登録画面が表示される
2. 認証が正常に動作する
3. 情報登録フォームが表示される
4. イベント作成フォームが表示される

## ⚠️ 注意事項

1. **セキュリティ**: `.env.local`ファイルはGitにコミットしないでください（`.gitignore`に含まれています）
2. **Next.jsのバージョン**: セキュリティ警告が出ていますが、開発環境では問題ありません。本番環境では最新版にアップグレードしてください
3. **OpenAI API**: 画像認識機能を使用しない場合は、`OPENAI_API_KEY`の設定は不要です

## 🐛 トラブルシューティング

問題が発生した場合、[ENV_SETUP.md](./ENV_SETUP.md) の「トラブルシューティング」セクションを参照してください。

## 📚 関連ドキュメント

- [環境変数設定ガイド](./ENV_SETUP.md) - 詳細な設定手順
- [OCR実装ガイド](./OCR_IMPLEMENTATION.md) - 画像認識機能の詳細
- [v0 UI生成プロンプト集](./v0-prompts.md) - UIコンポーネント生成用

