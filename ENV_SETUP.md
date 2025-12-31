# 環境変数設定ガイド

このドキュメントでは、イベントプラットフォームアプリケーションの環境変数設定について詳しく説明します。

---

## 目次

1. [Supabase設定](#supabase設定)
2. [LINE Login設定](#line-login設定)
3. [Google認証設定](#google認証設定)
4. [環境変数ファイルの作成](#環境変数ファイルの作成)
5. [設定の確認](#設定の確認)
6. [トラブルシューティング](#トラブルシューティング)

---

## Supabase設定

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセス
2. アカウントを作成（またはログイン）
3. 「New Project」をクリック
4. プロジェクト情報を入力：
   - **Name**: プロジェクト名（例: `event-platform`）
   - **Database Password**: データベースのパスワード（強力なパスワードを設定）
   - **Region**: 最寄りのリージョンを選択（例: `Northeast Asia (Tokyo)`）
   - **Pricing Plan**: Free tierで開始可能

### 2. Supabase URLとAPI Keyの取得

1. プロジェクトダッシュボードに移動
2. 左サイドバーの「Settings」→「API」をクリック
3. 以下の情報をコピー：
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. データベーステーブルの作成

Supabaseダッシュボードの「SQL Editor」で以下のSQLを実行してください。

#### organizers テーブル

```sql
CREATE TABLE organizers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のデータのみ閲覧・更新可能
CREATE POLICY "Users can view own organizer data"
  ON organizers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own organizer data"
  ON organizers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own organizer data"
  ON organizers FOR UPDATE
  USING (auth.uid() = user_id);
```

#### exhibitors テーブル

```sql
CREATE TABLE exhibitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('男', '女', 'それ以外')),
  age INTEGER NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  genre_category TEXT,
  genre_free_text TEXT,
  business_license_image_url TEXT,
  vehicle_inspection_image_url TEXT,
  automobile_inspection_image_url TEXT,
  pl_insurance_image_url TEXT,
  fire_equipment_layout_image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  line_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS を有効化
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can view own exhibitor data"
  ON exhibitors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exhibitor data"
  ON exhibitors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exhibitor data"
  ON exhibitors FOR UPDATE
  USING (auth.uid() = user_id);
```

#### events テーブル

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID REFERENCES organizers(id) ON DELETE CASCADE NOT NULL,
  event_name TEXT NOT NULL,
  event_name_furigana TEXT,
  genre TEXT,
  is_shizuoka_vocational_assoc_related BOOLEAN DEFAULT false,
  opt_out_newspaper_publication BOOLEAN DEFAULT false,
  event_start_date DATE NOT NULL,
  event_end_date DATE NOT NULL,
  event_display_period TEXT,
  event_period_notes TEXT,
  event_time TEXT,
  schedules JSONB,
  application_start_date DATE,
  application_end_date DATE,
  application_display_period TEXT,
  application_notes TEXT,
  ticket_release_start_date DATE,
  ticket_sales_location TEXT,
  lead_text TEXT NOT NULL,
  event_description TEXT NOT NULL,
  event_introduction_text TEXT,
  venue_name TEXT NOT NULL,
  venue_postal_code TEXT,
  venue_city TEXT,
  venue_town TEXT,
  venue_address TEXT,
  venue_latitude TEXT,
  venue_longitude TEXT,
  main_image_url TEXT,
  main_image_caption TEXT,
  approval_status TEXT CHECK (approval_status IN ('approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS を有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ポリシー: 主催者は自分のイベントのみ管理可能、出店者は承認済みイベントを閲覧可能
CREATE POLICY "Organizers can manage own events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organizers
      WHERE organizers.id = events.organizer_id
      AND organizers.user_id = auth.uid()
    )
  );

CREATE POLICY "Exhibitors can view approved events"
  ON events FOR SELECT
  USING (approval_status = 'approved' OR approval_status IS NULL);
```

#### event_applications テーブル

```sql
CREATE TABLE event_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  application_status TEXT NOT NULL DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exhibitor_id, event_id)
);

-- RLS を有効化
ALTER TABLE event_applications ENABLE ROW LEVEL SECURITY;

-- ポリシー: 出店者は自分の申し込みを閲覧可能
CREATE POLICY "Exhibitors can view own applications"
  ON event_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exhibitors
      WHERE exhibitors.id = event_applications.exhibitor_id
      AND exhibitors.user_id = auth.uid()
    )
  );

-- ポリシー: 主催者は自分のイベントへの申し込みを閲覧・更新可能
CREATE POLICY "Organizers can manage applications to own events"
  ON event_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_applications.event_id
      AND EXISTS (
        SELECT 1 FROM organizers
        WHERE organizers.id = events.organizer_id
        AND organizers.user_id = auth.uid()
      )
    )
  );
```

#### notifications テーブル

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('exhibitor', 'organizer')),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  related_application_id UUID REFERENCES event_applications(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS を有効化
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の通知のみ閲覧・更新可能
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (
    (user_type = 'exhibitor' AND EXISTS (
      SELECT 1 FROM exhibitors
      WHERE exhibitors.user_id::text = notifications.user_id
      AND exhibitors.user_id = auth.uid()
    ))
    OR
    (user_type = 'organizer' AND EXISTS (
      SELECT 1 FROM organizers
      WHERE organizers.user_id::text = notifications.user_id
      AND organizers.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (
    (user_type = 'exhibitor' AND EXISTS (
      SELECT 1 FROM exhibitors
      WHERE exhibitors.user_id::text = notifications.user_id
      AND exhibitors.user_id = auth.uid()
    ))
    OR
    (user_type = 'organizer' AND EXISTS (
      SELECT 1 FROM organizers
      WHERE organizers.user_id::text = notifications.user_id
      AND organizers.user_id = auth.uid()
    ))
  );
```

### 4. Supabase Storageの設定

#### バケットの作成

1. ダッシュボードの「Storage」をクリック
2. 「New bucket」をクリック
3. 以下のバケットを作成：

**documents バケット**（書類画像用）
- Name: `documents`
- Public bucket: **OFF**（プライベート）
- File size limit: 5MB
- Allowed MIME types: `image/*`

**images バケット**（イベント画像用）
- Name: `images`
- Public bucket: **ON**（パブリック）
- File size limit: 10MB
- Allowed MIME types: `image/*`

#### Storage ポリシーの設定

**documents バケット**（プライベート）

```sql
-- ユーザーは自分のファイルのみアップロード可能
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ユーザーは自分のファイルのみ閲覧可能
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

**images バケット**（パブリック）

```sql
-- 認証済みユーザーはアップロード可能
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- すべてのユーザーが閲覧可能（パブリック）
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');
```

---

## LINE Login設定

### 1. LINE Developersアカウントの作成

1. [LINE Developers](https://developers.line.biz/)にアクセス
2. LINEアカウントでログイン
3. 「Create」をクリックしてプロバイダーを作成

### 2. チャネルの作成

1. 「Create」→「LINE Login」を選択
2. チャネル情報を入力：
   - **Channel name**: チャネル名（例: `Event Platform Store`）
   - **Channel description**: 説明
   - **App type**: Web app
   - **Email address**: 連絡先メールアドレス
   - **Privacy Policy URL**: プライバシーポリシーのURL（任意）
   - **Terms of Use URL**: 利用規約のURL（任意）

### 3. チャネルIDとシークレットの取得

1. 作成したチャネルの「Basic settings」タブを開く
2. 以下の情報をコピー：
   - **Channel ID**: `1234567890`
   - **Channel secret**: `abcdefghijklmnopqrstuvwxyz123456`（後で使用）

### 4. コールバックURLの設定

1. 「LINE Login」タブを開く
2. 「Callback URL」に以下を追加：
   - 出店者向け: `http://localhost:3001/auth/callback`
   - 主催者向け: `http://localhost:3002/auth/callback`
   - 本番環境用: `https://yourdomain.com/auth/callback`
3. 「Email address permission」を有効化（メールアドレス取得が必要な場合）
4. 「Save」をクリック

### 5. 環境変数への設定

取得したChannel IDを環境変数に設定します（後述の「環境変数ファイルの作成」を参照）。

**注意**: LINE Loginの完全な実装には、バックエンドAPIでアクセストークンと交換する処理が必要です。現在の実装は簡易版です。

---

## Google認証設定

### 1. Google Cloud Consoleでプロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成（または既存のプロジェクトを選択）

### 2. OAuth同意画面の設定

1. 「APIs & Services」→「OAuth consent screen」を開く
2. ユーザータイプを選択（通常は「External」）
3. アプリ情報を入力：
   - **App name**: アプリ名（例: `Event Platform`）
   - **User support email**: サポートメールアドレス
   - **Developer contact information**: 開発者連絡先
4. 「Save and Continue」をクリック
5. スコープはデフォルトのまま「Save and Continue」
6. テストユーザーを追加（必要に応じて）

### 3. OAuth 2.0 クライアントIDの作成

1. 「APIs & Services」→「Credentials」を開く
2. 「Create Credentials」→「OAuth client ID」を選択
3. アプリケーションの種類を選択：
   - **Application type**: Web application
   - **Name**: クライアント名（例: `Event Platform Web`）
4. 承認済みのリダイレクトURIを追加：
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - （SupabaseのプロジェクトURLを使用）
5. 「Create」をクリック
6. **Client ID**と**Client secret**をコピー

### 4. SupabaseでGoogle認証を有効化

1. Supabaseダッシュボードの「Authentication」→「Providers」を開く
2. 「Google」を有効化
3. 取得したClient IDとClient secretを入力
4. 「Save」をクリック

**注意**: SupabaseのGoogle認証は、Supabase側で設定するため、アプリ側の環境変数は不要です。

---

## OpenAI API設定（画像認識機能用）

### 1. OpenAI API Keyの取得

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. アカウントを作成（またはログイン）
3. 「API keys」セクションを開く
4. 「Create new secret key」をクリック
5. キー名を入力（例: `event-platform-ocr`）
6. **API Keyをコピー**（この画面でしか表示されません）

### 2. 使用するモデル

画像認識には以下のモデルを使用します：
- **gpt-4o**（推奨）: 最新のマルチモーダルモデル、高精度
- **gpt-4-vision-preview**: 旧バージョン（互換性のため）

### 3. 料金について

- **gpt-4o**: 入力 $2.50 / 1M tokens、出力 $10.00 / 1M tokens
- 画像認識は1回あたり約1,000-2,000 tokens程度
- 無料枠はありませんが、Pay-as-you-goで使用可能

### 4. セキュリティ注意事項

- API Keyは**サーバーサイドでのみ使用**（環境変数に設定）
- クライアントサイドにAPI Keyを公開しない
- 定期的にAPI Keyをローテーション

## 環境変数ファイルの作成

### 1. 出店者向けアプリ（store/）

プロジェクトルートの`store/`ディレクトリに`.env.local`ファイルを作成：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# LINE Login設定
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=1234567890
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3001/auth/callback

# OpenAI API設定（画像認識機能用）
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 主催者向けアプリ（organizer/）

プロジェクトルートの`organizer/`ディレクトリに`.env.local`ファイルを作成：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# LINE Login設定
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=1234567890
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=http://localhost:3002/auth/callback
```

### 3. 管理者向けアプリ（admin/）

プロジェクトルートの`admin/`ディレクトリに`.env.local`ファイルを作成：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 管理者メールアドレス（カンマ区切り）
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

**重要**: `NEXT_PUBLIC_ADMIN_EMAILS`には、管理者としてログイン可能なメールアドレスをカンマ区切りで指定します。

### 4. 本番環境用の設定

本番環境では、以下のように設定します：

**store/.env.production**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=1234567890
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=https://store.yourdomain.com/auth/callback
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**organizer/.env.production**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID=1234567890
NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI=https://organizer.yourdomain.com/auth/callback
```

### 4. .gitignoreの確認

`.env.local`ファイルがGitにコミットされないように、`.gitignore`に以下が含まれていることを確認：

```
.env*.local
.env
```

---

## 設定の確認

### 1. 環境変数の読み込み確認

各アプリで環境変数が正しく読み込まれているか確認：

```typescript
// store/lib/supabase.ts または organizer/lib/supabase.ts
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

### 2. Supabase接続確認

1. アプリを起動: `npm run dev`
2. ブラウザのコンソールでエラーがないか確認
3. 認証機能をテスト

### 3. LINE Login動作確認

1. LINE Loginボタンをクリック
2. LINE認証画面にリダイレクトされることを確認
3. 認証後、コールバックURLに戻ることを確認

### 4. Google認証動作確認

1. Googleログインボタンをクリック
2. Google認証画面にリダイレクトされることを確認
3. 認証後、アプリに戻ることを確認

---

## トラブルシューティング

### 問題1: 環境変数が読み込まれない

**原因**: Next.jsでは、環境変数名が`NEXT_PUBLIC_`で始まる必要があります。

**解決策**:
- 環境変数名を確認
- アプリを再起動（`npm run dev`を停止して再起動）
- `.env.local`ファイルの場所を確認（プロジェクトルートの`store/`または`organizer/`ディレクトリ）

### 問題2: Supabase接続エラー

**原因**: URLまたはAPI Keyが間違っている可能性があります。

**解決策**:
- SupabaseダッシュボードでURLとKeyを再確認
- 環境変数ファイルの値が正しいか確認
- ネットワーク接続を確認

### 問題3: RLS（Row Level Security）エラー

**原因**: データベースのRLSポリシーが正しく設定されていない可能性があります。

**解決策**:
- Supabaseダッシュボードの「Authentication」→「Policies」でポリシーを確認
- 上記のSQLを再実行
- テスト用に一時的にRLSを無効化して動作確認（本番環境では推奨しません）

### 問題4: Storageアップロードエラー

**原因**: Storageバケットのポリシーが正しく設定されていない可能性があります。

**解決策**:
- Storageバケットが作成されているか確認
- Storageポリシーが正しく設定されているか確認
- ファイルサイズ制限を確認（documents: 5MB、images: 10MB）

### 問題5: LINE Loginが動作しない

**原因**: 
- コールバックURLが正しく設定されていない
- Channel IDが間違っている
- バックエンドAPIが実装されていない（現在の実装は簡易版）

**解決策**:
- LINE DevelopersコンソールでコールバックURLを確認
- 環境変数のChannel IDを確認
- 本番環境では、バックエンドAPIでアクセストークンと交換する処理を実装

### 問題6: Google認証が動作しない

**原因**: 
- SupabaseでGoogle認証が有効化されていない
- OAuth同意画面が設定されていない
- リダイレクトURIが正しく設定されていない

**解決策**:
- SupabaseダッシュボードでGoogle認証が有効化されているか確認
- Google Cloud ConsoleでOAuth同意画面を設定
- リダイレクトURIがSupabaseのURLになっているか確認

### 問題7: OpenAI API画像認識が動作しない

**原因**: 
- API Keyが設定されていない
- API Keyが無効
- 画像URLがアクセス可能でない
- クォータ超過

**解決策**:
- 環境変数`OPENAI_API_KEY`が正しく設定されているか確認
- OpenAI PlatformでAPI Keyの有効性を確認
- 画像がSupabase Storageから正しく取得できるか確認
- OpenAI Platformで使用量とクォータを確認
- エラーログを確認（サーバーサイドのコンソール）

---

## セキュリティのベストプラクティス

1. **環境変数の管理**
   - `.env.local`はGitにコミットしない
   - 本番環境では環境変数を安全に管理（Vercel、Netlifyなどの環境変数設定を使用）
   - 定期的にAPI Keyをローテーション

2. **Supabase RLS**
   - すべてのテーブルでRLSを有効化
   - 最小権限の原則に従ってポリシーを設定
   - テスト環境でもRLSを有効にしておく

3. **Storageセキュリティ**
   - 機密情報（書類画像）はプライベートバケットに保存
   - パブリックバケットには公開可能な画像のみ保存
   - ファイルサイズ制限を設定

4. **認証情報の保護**
   - Client SecretやChannel Secretはサーバーサイドでのみ使用
   - フロントエンドには公開可能な情報のみ設定

---

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [LINE Login公式ドキュメント](https://developers.line.biz/ja/docs/line-login/)
- [Google OAuth 2.0公式ドキュメント](https://developers.google.com/identity/protocols/oauth2)
- [Next.js環境変数ドキュメント](https://nextjs.org/docs/basic-features/environment-variables)

---

## サポート

設定で問題が発生した場合：
1. 上記のトラブルシューティングを確認
2. 各サービスの公式ドキュメントを参照
3. エラーメッセージを確認して原因を特定

