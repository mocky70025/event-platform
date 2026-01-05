-- ============================================
-- 主催者アプリ用Supabaseプロジェクト スキーマ
-- ============================================
-- このSQLを主催者アプリ用のSupabaseプロジェクトで実行してください
-- Project URL: https://zcwcqtoraukxfbnfuboj.supabase.co
-- ============================================

-- ============================================
-- 1. 基本テーブルの作成
-- ============================================

-- 1-1. 主催者情報テーブル
CREATE TABLE IF NOT EXISTS organizers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    line_user_id VARCHAR(100),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1-2. 出店者情報テーブル（参照用）
-- 注意: 主催者アプリと出店者アプリで別々のSupabaseプロジェクトを使用する場合、
-- このテーブルは主催者アプリ用のプロジェクトでは使用されません。
-- ただし、event_applicationsテーブルとの整合性のため、作成しておきます。
CREATE TABLE IF NOT EXISTS exhibitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('男', '女', 'それ以外')),
    age INTEGER CHECK (age >= 0 AND age <= 99),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    genre_category VARCHAR(50),
    genre_free_text TEXT,
    business_license_image_url TEXT,
    vehicle_inspection_image_url TEXT,
    automobile_inspection_image_url TEXT,
    pl_insurance_image_url TEXT,
    fire_equipment_layout_image_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    line_user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1-3. イベント情報テーブル
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- 基本情報
    event_name VARCHAR(100) NOT NULL,
    event_name_furigana VARCHAR(100) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    is_shizuoka_vocational_assoc_related BOOLEAN DEFAULT FALSE,
    opt_out_newspaper_publication BOOLEAN DEFAULT FALSE,
    
    -- 開催期間・時間
    event_start_date DATE NOT NULL,
    event_end_date DATE NOT NULL,
    event_display_period VARCHAR(50) NOT NULL,
    event_period_notes VARCHAR(100),
    event_time VARCHAR(50),
    
    -- 申し込み期間
    application_start_date DATE,
    application_end_date DATE,
    application_display_period VARCHAR(50),
    application_notes VARCHAR(250),
    
    -- チケット情報
    ticket_release_start_date DATE,
    ticket_sales_location TEXT,
    
    -- イベント内容
    lead_text VARCHAR(100) NOT NULL,
    event_description VARCHAR(250) NOT NULL,
    event_introduction_text TEXT,
    
    -- 画像情報
    main_image_url TEXT,
    main_image_caption VARCHAR(50),
    additional_image1_url TEXT,
    additional_image1_caption VARCHAR(50),
    additional_image2_url TEXT,
    additional_image2_caption VARCHAR(50),
    additional_image3_url TEXT,
    additional_image3_caption VARCHAR(50),
    additional_image4_url TEXT,
    additional_image4_caption VARCHAR(50),
    
    -- 会場情報
    venue_name VARCHAR(200) NOT NULL,
    venue_postal_code VARCHAR(10),
    venue_city VARCHAR(50),
    venue_town VARCHAR(100),
    venue_address VARCHAR(200),
    venue_latitude DECIMAL(10, 8),
    venue_longitude DECIMAL(11, 8),
    
    -- URL情報
    homepage_url TEXT,
    related_page_url TEXT,
    
    -- 連絡先情報
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255),
    
    -- その他情報
    parking_info TEXT,
    fee_info TEXT,
    organizer_info TEXT,
    
    -- 主催者との関連
    organizer_id UUID REFERENCES organizers(id) ON DELETE CASCADE,
    
    -- システム情報
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1-4. 出店申し込みテーブル
CREATE TABLE IF NOT EXISTS event_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exhibitor_id UUID NOT NULL REFERENCES exhibitors(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    application_status VARCHAR(20) DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exhibitor_id, event_id)
);

-- 1-5. 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('exhibitor', 'organizer')),
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    related_application_id UUID REFERENCES event_applications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1-6. フォームドラフトテーブル
CREATE TABLE IF NOT EXISTS form_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    form_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, form_type)
);

-- ============================================
-- 2. インデックスの作成
-- ============================================

CREATE INDEX IF NOT EXISTS idx_organizers_user_id ON organizers(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizers_user_id_unique ON organizers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizers_line_user_id ON organizers(line_user_id) WHERE line_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exhibitors_user_id ON exhibitors(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exhibitors_line_user_id ON exhibitors(line_user_id) WHERE line_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(event_start_date);
CREATE INDEX IF NOT EXISTS idx_event_applications_exhibitor_id ON event_applications(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_event_applications_event_id ON event_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_drafts_user_id ON form_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_form_drafts_form_type ON form_drafts(form_type);

-- ============================================
-- 3. RLS（Row Level Security）の有効化
-- ============================================

ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_drafts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLSポリシーの作成
-- ============================================

-- 4-1. organizersテーブルのポリシー
DROP POLICY IF EXISTS "Users can manage their own organizer data" ON organizers;
CREATE POLICY "Users can manage their own organizer data" ON organizers
    FOR ALL USING (auth.uid() = user_id);

-- 4-2. exhibitorsテーブルのポリシー（参照用）
DROP POLICY IF EXISTS "Anyone can view exhibitors" ON exhibitors;
CREATE POLICY "Anyone can view exhibitors" ON exhibitors
    FOR SELECT USING (true);

-- 4-3. eventsテーブルのポリシー
DROP POLICY IF EXISTS "Anyone can view events" ON events;
CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers can manage their own events" ON events;
CREATE POLICY "Organizers can manage their own events" ON events
    FOR ALL USING (
        organizer_id IN (
            SELECT id FROM organizers 
            WHERE user_id = auth.uid()
        )
    );

-- 4-4. event_applicationsテーブルのポリシー
DROP POLICY IF EXISTS "Anyone can view applications" ON event_applications;
CREATE POLICY "Anyone can view applications" ON event_applications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizers can manage applications to own events" ON event_applications;
CREATE POLICY "Organizers can manage applications to own events" ON event_applications
    FOR ALL USING (
        event_id IN (
            SELECT id FROM events 
            WHERE organizer_id IN (
                SELECT id FROM organizers 
                WHERE user_id = auth.uid()
            )
        )
    );

-- 4-5. notificationsテーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        user_id = auth.uid()::text OR
        user_id IN (
            SELECT id::text FROM organizers WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
CREATE POLICY "Anyone can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        user_id = auth.uid()::text OR
        user_id IN (
            SELECT id::text FROM organizers WHERE user_id = auth.uid()
        )
    );

-- 4-6. form_draftsテーブルのポリシー
DROP POLICY IF EXISTS "Users can manage their own drafts" ON form_drafts;
CREATE POLICY "Users can manage their own drafts" ON form_drafts
    FOR ALL USING (user_id = auth.uid()::text);

-- ============================================
-- 5. ストレージバケットの作成（オプション）
-- ============================================

-- 画像アップロード用のストレージバケットを作成する場合は、
-- Supabase Dashboard > Storage > Create bucket から手動で作成してください。
-- バケット名: "event-images" (Public)
-- バケット名: "organizer-images" (Public)
-- バケット名: "exhibitor-documents" (Private)

-- ============================================
-- 完了
-- ============================================

-- すべてのテーブルとポリシーが作成されました。
-- 次に、Supabase Dashboardで認証設定を行ってください。

