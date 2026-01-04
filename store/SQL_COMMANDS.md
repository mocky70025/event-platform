# Supabase Storage RLS Policy Setup

画像のアップロードエラー（`new row violates row-level security policy`）を解決するために、SupabaseのSQLエディタで以下のコマンドを実行してください。

このコマンドは、`documents` バケットへのアクセス権限（ポリシー）を設定し、認証済みユーザーが自分の画像をアップロードできるようにします。

```sql
-- 1. documentsバケットをPublicに設定（もし公開URLでアクセスする場合）
UPDATE storage.buckets
SET public = true
WHERE id = 'documents';

-- 2. 認証済みユーザーが自分のフォルダ（exhibitors/ユーザーID/）に画像をアップロードできるようにする
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'exhibitors' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 3. 認証済みユーザーが自分の画像を閲覧できるようにする
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'exhibitors' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 4. 認証済みユーザーが自分の画像を更新できるようにする
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'exhibitors' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 5. 認証済みユーザーが自分の画像を削除できるようにする
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'exhibitors' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 6. （オプション）すべてのユーザー（未認証含む）に画像の閲覧を許可する場合
-- documentsバケットがPublic設定されていれば、通常はSELECTポリシーなしでもgetPublicUrlでアクセス可能ですが、
-- 明示的に許可する場合に使用します。
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING ( bucket_id = 'documents' );
```

## 実行手順

1. [Supabase Dashboard](https://supabase.com/dashboard) にログインします。
2. 左サイドバーの **SQL Editor** を開きます。
3. **New Query** をクリックします。
4. 上記のSQLをコピーして貼り付けます。
5. **Run** ボタンをクリックして実行します。
6. `Success` と表示されたら、再度画像のアップロードを試してください。
