-- 既存のデータを完全にリセットして再構築するSQLスクリプト
-- 注意: このスクリプトを実行すると、exhibitors, events, applications, notificationsテーブルの全データが削除されます。

BEGIN;

-- ==========================================
-- 1. クリーンアップ (既存オブジェクトの削除)
-- ==========================================

-- Storage Policies
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1u578k_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1u578k_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1u578k_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1u578k_3" ON storage.objects;

-- Tables (依存関係があるためCASCADEを使用)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.exhibitors CASCADE;

-- ==========================================
-- 2. テーブル作成
-- ==========================================

-- Exhibitors Table (出店者)
CREATE TABLE public.exhibitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    line_user_id TEXT,
    name TEXT NOT NULL,
    gender TEXT,
    age INTEGER,
    phone_number TEXT,
    email TEXT,
    genre_category TEXT,
    genre_free_text TEXT,
    business_license_image_url TEXT,
    vehicle_inspection_image_url TEXT,
    automobile_inspection_image_url TEXT,
    pl_insurance_image_url TEXT,
    fire_equipment_layout_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table (イベント)
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    event_name_furigana TEXT,
    genre TEXT,
    event_start_date DATE,
    event_end_date DATE,
    event_display_period TEXT,
    event_time TEXT,
    lead_text TEXT,
    event_description TEXT,
    venue_name TEXT,
    venue_city TEXT,
    venue_town TEXT,
    venue_address TEXT,
    main_image_url TEXT,
    main_image_caption TEXT,
    homepage_url TEXT,
    approval_status TEXT DEFAULT 'approved',
    application_end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications Table (応募)
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibitor_id UUID REFERENCES public.exhibitors(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table (通知)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    notification_type TEXT,
    title TEXT NOT NULL,
    message TEXT,
    related_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    related_application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. RLSポリシーの設定 (セキュリティ)
-- ==========================================

-- RLS有効化
ALTER TABLE public.exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Exhibitors Policies
-- 自分のデータのみ参照・更新可能。登録は誰でも（認証済みなら）可能。
-- user_idカラムまたはline_user_idカラムが自分のIDと一致する場合に許可
CREATE POLICY "Users can view own exhibitor profile" 
ON public.exhibitors FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR line_user_id = auth.uid()::text); 

CREATE POLICY "Users can insert own exhibitor profile" 
ON public.exhibitors FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR line_user_id = auth.uid()::text);

CREATE POLICY "Users can update own exhibitor profile" 
ON public.exhibitors FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR line_user_id = auth.uid()::text);

-- Events Policies
-- 誰でも閲覧可能
CREATE POLICY "Events are viewable by everyone" 
ON public.events FOR SELECT 
TO public 
USING (true);

-- Applications Policies
-- 自分の応募のみ参照・作成可能
CREATE POLICY "Users can view own applications" 
ON public.applications FOR SELECT 
TO authenticated 
USING (
  exhibitor_id IN (
    SELECT id FROM public.exhibitors 
    WHERE user_id = auth.uid() OR line_user_id = auth.uid()::text
  )
);

CREATE POLICY "Users can create applications" 
ON public.applications FOR INSERT 
TO authenticated 
WITH CHECK (
  exhibitor_id IN (
    SELECT id FROM public.exhibitors 
    WHERE user_id = auth.uid() OR line_user_id = auth.uid()::text
  )
);

-- Notifications Policies
-- 自分の通知のみ参照可能
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- ==========================================
-- 4. Storage設定
-- ==========================================

-- Bucket作成 (存在しない場合のみ作成するロジック)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
-- パス形式: exhibitors/{user_id}/filename

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'exhibitors' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'exhibitors' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'exhibitors' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'exhibitors' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

COMMIT;
