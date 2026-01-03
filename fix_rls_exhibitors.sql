-- exhibitorsテーブルのRLSポリシー修正用SQL
-- このSQLをSupabaseのSQL Editorで実行してください

-- テーブルのRLSを確実に有効化
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（競合を避けるため）
DROP POLICY IF EXISTS "Users can insert their own exhibitor profile" ON exhibitors;
DROP POLICY IF EXISTS "Users can view their own exhibitor profile" ON exhibitors;
DROP POLICY IF EXISTS "Users can update their own exhibitor profile" ON exhibitors;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON exhibitors;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON exhibitors;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON exhibitors;

-- INSERTポリシー: 認証済みユーザーは自分のuser_idでレコードを作成できる
CREATE POLICY "Users can insert their own exhibitor profile"
ON exhibitors FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- SELECTポリシー: 認証済みユーザーは自分のレコードを参照できる
CREATE POLICY "Users can view their own exhibitor profile"
ON exhibitors FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- UPDATEポリシー: 認証済みユーザーは自分のレコードを更新できる
CREATE POLICY "Users can update their own exhibitor profile"
ON exhibitors FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
