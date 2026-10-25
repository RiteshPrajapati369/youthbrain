-- 20241018000001_initial_schema.sql
-- Initial schema for YouTh Brain News Portal

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (Owner identity and portal branding)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    headline TEXT,
    bio TEXT,
    about_description TEXT,
    avatar_url TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    location TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMPTZ
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name_ne TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_ne TEXT,
    description_en TEXT,
    color TEXT DEFAULT '#235DBC',
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 3. Articles Table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary_ne TEXT,
    summary_en TEXT,
    content_ne TEXT NOT NULL,
    content_en TEXT NOT NULL,
    cover_image_url TEXT,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft' NOT NULL,
    is_breaking BOOLEAN DEFAULT false NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    published_at TIMESTAMPTZ,
    view_count BIGINT DEFAULT 0 NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 4. Article Images Table
CREATE TABLE IF NOT EXISTS public.article_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    caption_ne TEXT,
    caption_en TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Media Library Table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_ne TEXT,
    alt_en TEXT,
    type TEXT DEFAULT 'image' NOT NULL,
    folder TEXT DEFAULT 'general' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 6. Social Links Table
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    label TEXT NOT NULL,
    icon_name TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT CHECK (status IN ('new', 'read', 'replied', 'archived')) DEFAULT 'new' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 8. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    site_name_ne TEXT DEFAULT 'à¤¯à¥à¤¥ à¤¬à¥à¤°à¥‡à¤¨ à¤¨à¥à¤¯à¥à¤œ' NOT NULL,
    site_name_en TEXT DEFAULT 'YouTh Brain News' NOT NULL,
    tagline_ne TEXT DEFAULT 'à¤¸à¤¤à¥à¤¯, à¤¤à¤¥à¥à¤¯ à¤° à¤¨à¤¿à¤·à¥à¤ªà¤•à¥à¤· à¤¸à¤®à¤¾à¤šà¤¾à¤°',
    tagline_en TEXT DEFAULT 'Truth, Facts and Impartial News',
    logo_url TEXT DEFAULT '/logo.jpg',
    og_image_url TEXT DEFAULT '/logo.jpg',
    copyright_ne TEXT DEFAULT 'Â© à¥¨à¥¦à¥¨à¥¬ YouTh Brain News. à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤',
    copyright_en TEXT DEFAULT 'Â© 2026 YouTh Brain News. All rights reserved.',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_articles_modtime BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_media_modtime BEFORE UPDATE ON public.media FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_social_links_modtime BEFORE UPDATE ON public.social_links FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_contact_messages_modtime BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER update_site_settings_modtime BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
-- 20241018000002_login_lockout_and_mfa.sql
-- Login attempts tracking for 10-minute lockout & TOTP MFA Factors

CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    attempt_time TIMESTAMPTZ DEFAULT now() NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
ON public.login_attempts(email, attempt_time DESC);

CREATE TABLE IF NOT EXISTS public.mfa_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    secret TEXT NOT NULL,
    issuer TEXT DEFAULT 'YouTh Brain News' NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mfa_factors_user_id 
ON public.mfa_factors(user_id);

-- Helper function to check if an account is locked out (3 consecutive failures within 10 minutes)
CREATE OR REPLACE FUNCTION public.check_account_lockout(p_email TEXT)
RETURNS TABLE (
    is_locked BOOLEAN,
    consecutive_failures INT,
    lockout_remaining_seconds INT
) AS $$
DECLARE
    v_last_success TIMESTAMPTZ;
    v_fail_count INT := 0;
    v_latest_failure TIMESTAMPTZ;
    v_lockout_window_seconds INT := 600; -- 10 minutes (600 seconds)
    v_elapsed_seconds INT;
BEGIN
    -- Find timestamp of most recent success
    SELECT attempt_time INTO v_last_success
    FROM public.login_attempts
    WHERE lower(email) = lower(p_email) AND success = true
    ORDER BY attempt_time DESC
    LIMIT 1;

    -- Count consecutive failures since that success (or all time if no success)
    SELECT count(*), max(attempt_time) INTO v_fail_count, v_latest_failure
    FROM public.login_attempts
    WHERE lower(email) = lower(p_email) 
      AND success = false
      AND (v_last_success IS NULL OR attempt_time > v_last_success);

    IF v_fail_count >= 3 AND v_latest_failure IS NOT NULL THEN
        v_elapsed_seconds := EXTRACT(EPOCH FROM (now() - v_latest_failure))::INT;
        IF v_elapsed_seconds < v_lockout_window_seconds THEN
            RETURN QUERY SELECT true, v_fail_count, (v_lockout_window_seconds - v_elapsed_seconds);
            RETURN;
        END IF;
    END IF;

    RETURN QUERY SELECT false, v_fail_count, 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 20241018000003_storage_buckets.sql
-- Storage buckets for YouTh Brain News

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('covers', 'covers', true),
    ('articles', 'articles', true),
    ('media', 'media', true),
    ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public read for all 5 buckets
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('avatars', 'covers', 'articles', 'media', 'gallery'));

-- Storage RLS: Owner-only write/update/delete
CREATE POLICY "Owner Storage Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id IN ('avatars', 'covers', 'articles', 'media', 'gallery')
    AND (auth.jwt() ->> 'email') = 'panditritesh005@gmail.com'
);

CREATE POLICY "Owner Storage Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id IN ('avatars', 'covers', 'articles', 'media', 'gallery')
    AND (auth.jwt() ->> 'email') = 'panditritesh005@gmail.com'
);

CREATE POLICY "Owner Storage Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id IN ('avatars', 'covers', 'articles', 'media', 'gallery')
    AND (auth.jwt() ->> 'email') = 'panditritesh005@gmail.com'
);
-- 20241018000004_rls_and_security.sql
-- Comprehensive Row Level Security (RLS) for YouTh Brain News

-- Enable RLS on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_factors ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email') = 'panditritesh005@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES RLS
CREATE POLICY "Public Read Profiles"
ON public.profiles FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Owner All Profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- 2. CATEGORIES RLS
CREATE POLICY "Public Read Active Categories"
ON public.categories FOR SELECT
USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Owner All Categories"
ON public.categories FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- 3. ARTICLES RLS
CREATE POLICY "Public Read Published Articles"
ON public.articles FOR SELECT
USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Owner All Articles"
ON public.articles FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- 4. ARTICLE_IMAGES RLS
CREATE POLICY "Public Read Article Images"
ON public.article_images FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.articles a 
    WHERE a.id = article_images.article_id 
      AND a.status = 'published' 
      AND a.deleted_at IS NULL
));

CREATE POLICY "Owner All Article Images"
ON public.article_images FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- 5. MEDIA RLS
CREATE POLICY "Public Read Media"
ON public.media FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Owner All Media"
ON public.media FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- 6. SOCIAL LINKS RLS
CREATE POLICY "Public Read Social Links"
ON public.social_links FOR SELECT
USING (is_active = true);

CREATE POLICY "Owner All Social Links"
ON public.social_links FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- 7. CONTACT MESSAGES RLS
CREATE POLICY "Public Insert Contact Messages"
ON public.contact_messages FOR INSERT
WITH CHECK (status = 'new');

CREATE POLICY "Owner Read Contact Messages"
ON public.contact_messages FOR SELECT
TO authenticated
USING (public.is_owner());

CREATE POLICY "Owner Update Contact Messages"
ON public.contact_messages FOR UPDATE
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

CREATE POLICY "Owner Delete Contact Messages"
ON public.contact_messages FOR DELETE
TO authenticated
USING (public.is_owner());

-- 8. SITE SETTINGS RLS
CREATE POLICY "Public Read Site Settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Owner All Site Settings"
ON public.site_settings FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- 9. LOGIN ATTEMPTS RLS
CREATE POLICY "Public Insert Login Attempts"
ON public.login_attempts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owner Read Login Attempts"
ON public.login_attempts FOR SELECT
TO authenticated
USING (public.is_owner());

-- 10. MFA FACTORS RLS
CREATE POLICY "Owner Read/Manage MFA Factors"
ON public.mfa_factors FOR ALL
TO authenticated
USING (auth.uid() = user_id OR public.is_owner())
WITH CHECK (auth.uid() = user_id OR public.is_owner());
-- 20241018000005_seed_data.sql
-- Initial seed data for YouTh Brain News Portal

-- Default Owner Profile
INSERT INTO public.profiles (
    id,
    full_name,
    headline,
    bio,
    about_description,
    avatar_url,
    email,
    phone,
    location,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ritesh Prajapati',
    'Editor-in-Chief & Founder, YouTh Brain News',
    'Journalist, technologist, and digital media innovator covering Nepal and the world.',
    'YouTh Brain News is a premier independent digital news portal committed to impartial, verified, and timely news reporting across politics, youth innovation, technology, education, and culture in Nepal.',
    '/logo.jpg',
    'panditritesh005@gmail.com',
    '+977-9800000000',
    'Hetauda, Nepal',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Default Categories
INSERT INTO public.categories (id, profile_id, name_ne, name_en, slug, description_ne, description_en, color, sort_order, is_active)
VALUES 
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'à¤°à¤¾à¤œà¤¨à¥€à¤¤à¤¿', 'Politics', 'politics', 'à¤¸à¤®à¤¸à¤¾à¤®à¤¯à¤¿à¤• à¤°à¤¾à¤œà¤¨à¥€à¤¤à¤¿à¤• à¤˜à¤Ÿà¤¨à¤¾à¤•à¥à¤°à¤® à¤° à¤¨à¥€à¤¤à¤¿à¤—à¤¤ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£', 'Contemporary political events and policy analysis', '#235DBC', 1, true),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'à¤¸à¤®à¤¾à¤œ', 'Society', 'society', 'à¤¸à¤¾à¤®à¤¾à¤œà¤¿à¤• à¤¸à¤°à¥‹à¤•à¤¾à¤°, à¤¨à¥à¤¯à¤¾à¤¯, à¤œà¤¨à¤œà¥€à¤µà¤¨ à¤° à¤°à¥‚à¤ªà¤¾à¤¨à¥à¤¤à¤°à¤£', 'Social issues, justice, grassroots and community development', '#06B6D4', 2, true),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'à¤…à¤°à¥à¤¥', 'Economy', 'economy', 'à¤…à¤°à¥à¤¥à¤¤à¤¨à¥à¤¤à¥à¤°, à¤µà¥à¤¯à¤¾à¤ªà¤¾à¤°, à¤µà¤¿à¤¤à¥à¤¤ à¤° à¤¬à¤œà¤¾à¤° à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£', 'Economy, business, finance and market insights', '#10B981', 3, true),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'à¤µà¤¿à¤œà¥à¤žà¤¾à¤¨ à¤¤à¤¥à¤¾ à¤ªà¥à¤°à¤µà¤¿à¤§à¤¿', 'Science & Technology', 'science-tech', 'à¤†à¤°à¥à¤Ÿà¤¿à¤«à¤¿à¤¸à¤¿à¤¯à¤² à¤‡à¤¨à¥à¤Ÿà¥‡à¤²à¤¿à¤œà¥‡à¤¨à¥à¤¸, à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤†à¤µà¤¿à¤·à¥à¤•à¤¾à¤° à¤° à¤µà¥ˆà¤œà¥à¤žà¤¾à¤¨à¤¿à¤• à¤–à¥‹à¤œ', 'AI, digital innovation and scientific breakthroughs', '#EA4C89', 4, true),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'à¤–à¥‡à¤²à¤•à¥à¤¦', 'Sports', 'sports', 'à¤•à¥à¤°à¤¿à¤•à¥‡à¤Ÿ, à¤«à¥à¤Ÿà¤¬à¤² à¤° à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤¿à¤¯ à¤¤à¤¥à¤¾ à¤…à¤¨à¥à¤¤à¤°à¥à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤¿à¤¯ à¤–à¥‡à¤²', 'Cricket, football and sporting highlights', '#8B5CF6', 5, true),
    ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'à¤…à¤¨à¥à¤¤à¤°à¥à¤µà¤¾à¤°à¥à¤¤à¤¾', 'Interview', 'interview', 'à¤°à¤¾à¤œà¤¨à¥€à¤¤à¤¿à¤• à¤¨à¥‡à¤¤à¥ƒà¤¤à¥à¤µ, à¤µà¤¿à¤œà¥à¤ž à¤° à¤ªà¥à¤°à¥‡à¤°à¤• à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤¤à¥à¤µà¤¹à¤°à¥‚à¤¸à¤à¤— à¤µà¤¿à¤¶à¥‡à¤· à¤¸à¤‚à¤µà¤¾à¤¦', 'Exclusive dialogues with policymakers, thinkers and leaders', '#F59E0B', 6, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Articles
INSERT INTO public.articles (
    id,
    profile_id,
    category_id,
    title_ne,
    title_en,
    slug,
    summary_ne,
    summary_en,
    content_ne,
    content_en,
    cover_image_url,
    status,
    is_breaking,
    is_featured,
    published_at,
    view_count,
    seo_title,
    seo_description
) VALUES 
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'à¤¨à¥‡à¤ªà¤¾à¤²à¤®à¤¾ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤°à¥‚à¤ªà¤¾à¤¨à¥à¤¤à¤°à¤£ à¤° à¤¯à¥à¤µà¤¾ à¤†à¤ˆà¤Ÿà¥€ à¤ªà¥à¤°à¤¤à¤¿à¤­à¤¾à¤¹à¤°à¥‚à¤•à¥‹ à¤¯à¥‹à¤—à¤¦à¤¾à¤¨',
    'Digital Transformation in Nepal: How Youth IT Talent Is Reshaping the Economy',
    'digital-transformation-nepal-youth-tech',
    'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤¯à¥à¤µà¤¾ à¤¸à¤«à¥à¤Ÿà¤µà¥‡à¤¯à¤° à¤‡à¤¨à¥à¤œà¤¿à¤¨à¤¿à¤¯à¤°à¤¹à¤°à¥‚ à¤° à¤ªà¥à¤°à¤¾à¤µà¤¿à¤§à¤¿à¤• à¤‰à¤¦à¥à¤¯à¤®à¥€à¤¹à¤°à¥‚à¤²à¥‡ à¤µà¤¿à¤¶à¥à¤µà¤µà¥à¤¯à¤¾à¤ªà¥€ à¤¬à¤œà¤¾à¤°à¤®à¤¾ à¤¨à¤¯à¤¾à¤ à¤ªà¤¹à¤¿à¤šà¤¾à¤¨ à¤¬à¤¨à¤¾à¤‰à¤à¤¦à¥ˆà¤›à¤¨à¥à¥¤',
    'Nepali youth software engineers and tech entrepreneurs are setting new benchmarks in the global IT ecosystem.',
    '# à¤¨à¥‡à¤ªà¤¾à¤²à¤®à¤¾ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤°à¥‚à¤ªà¤¾à¤¨à¥à¤¤à¤°à¤£ à¤° à¤¯à¥à¤µà¤¾ à¤†à¤ˆà¤Ÿà¥€ à¤ªà¥à¤°à¤¤à¤¿à¤­à¤¾à¤¹à¤°à¥‚à¤•à¥‹ à¤¯à¥‹à¤—à¤¦à¤¾à¤¨\n\nà¤•à¤¾à¤ à¤®à¤¾à¤¡à¥Œà¤ â€” à¤ªà¤›à¤¿à¤²à¥à¤²à¤¾ à¤•à¥‡à¤¹à¥€ à¤µà¤°à¥à¤·à¤¹à¤°à¥‚à¤®à¤¾ à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¥‹ à¤¸à¥‚à¤šà¤¨à¤¾ à¤ªà¥à¤°à¤µà¤¿à¤§à¤¿ (IT) à¤•à¥à¤·à¥‡à¤¤à¥à¤°à¤®à¤¾ à¤…à¤¸à¤¾à¤§à¤¾à¤°à¤£ à¤µà¥ƒà¤¦à¥à¤§à¤¿ à¤¦à¥‡à¤–à¤¿à¤à¤•à¥‹ à¤›à¥¤ à¤¹à¤œà¤¾à¤°à¥Œà¤ à¤¯à¥à¤µà¤¾ à¤ªà¥à¤°à¥‹à¤—à¥à¤°à¤¾à¤®à¤°, à¤¡à¥‡à¤Ÿà¤¾ à¤¸à¤¾à¤‡à¤¨à¥à¤Ÿà¤¿à¤¸à¥à¤Ÿ, à¤° à¤•à¥à¤²à¤¾à¤‰à¤¡ à¤†à¤°à¥à¤•à¤¿à¤Ÿà¥‡à¤•à¥à¤Ÿà¤¹à¤°à¥‚à¤²à¥‡ à¤…à¤¨à¥à¤¤à¤°à¥à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤¿à¤¯ à¤¸à¥à¤¤à¤°à¤•à¤¾ à¤ªà¤°à¤¿à¤¯à¥‹à¤œà¤¨à¤¾à¤¹à¤°à¥‚ à¤¸à¥à¤µà¤¦à¥‡à¤¶à¤®à¥ˆ à¤¬à¤¸à¥‡à¤° à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤¸à¤®à¥à¤ªà¤¨à¥à¤¨ à¤—à¤°à¤¿à¤°à¤¹à¥‡à¤•à¤¾ à¤›à¤¨à¥à¥¤\n\n## à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤à¤®à¤¾ à¤†à¤§à¤¾à¤°à¤¿à¤¤ à¤¸à¥‡à¤µà¤¾à¤•à¥‹ à¤µà¤¿à¤¸à¥à¤¤à¤¾à¤°\n\nà¤¨à¥‡à¤ªà¤¾à¤² à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤¬à¥ˆà¤‚à¤•à¤•à¥‹ à¤ªà¤›à¤¿à¤²à¥à¤²à¥‹ à¤ªà¥à¤°à¤¤à¤¿à¤µà¥‡à¤¦à¤¨ à¤…à¤¨à¥à¤¸à¤¾à¤° à¤¸à¥‚à¤šà¤¨à¤¾ à¤ªà¥à¤°à¤µà¤¿à¤§à¤¿ à¤¸à¥‡à¤µà¤¾ à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤¨à¥‡à¤ªà¤¾à¤²à¤•à¥‹ à¤µà¥ˆà¤¦à¥‡à¤¶à¤¿à¤• à¤®à¥à¤¦à¥à¤°à¤¾ à¤†à¤°à¥à¤œà¤¨à¤•à¥‹ à¤®à¥à¤–à¥à¤¯ à¤¸à¥à¤°à¥‹à¤¤à¤•à¥‹ à¤°à¥‚à¤ªà¤®à¤¾ à¤‰à¤¦à¤¾à¤‡à¤°à¤¹à¥‡à¤•à¥‹ à¤›à¥¤ à¤°à¤¿à¤®à¥‹à¤Ÿ à¤µà¤°à¥à¤• à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¤¿ à¤° à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤ªà¥à¤²à¥‡à¤Ÿà¤«à¤°à¥à¤®à¤¹à¤°à¥‚à¤²à¥‡ à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤ªà¥à¤°à¤¤à¤¿à¤­à¤¾à¤²à¤¾à¤ˆ à¤­à¥Œà¤—à¥‹à¤²à¤¿à¤• à¤¸à¥€à¤®à¤¾à¤¹à¤°à¥‚ à¤ªà¤¾à¤° à¤—à¤°à¥‡à¤° à¤•à¤¾à¤® à¤—à¤°à¥à¤¨ à¤¸à¤•à¥à¤·à¤® à¤¬à¤¨à¤¾à¤à¤•à¤¾ à¤›à¤¨à¥à¥¤\n\n### à¤¸à¤°à¤•à¤¾à¤° à¤° à¤¨à¤¿à¤œà¥€ à¤•à¥à¤·à¥‡à¤¤à¥à¤°à¤•à¥‹ à¤¸à¤¹à¤•à¤¾à¤°à¥à¤¯\n\nà¤ªà¥à¤°à¤¾à¤µà¤¿à¤§à¤¿à¤• à¤¶à¤¿à¤•à¥à¤·à¤¾à¤®à¤¾ à¤²à¤—à¤¾à¤¨à¥€, à¤‰à¤šà¥à¤š à¤—à¤¤à¤¿à¤•à¥‹ à¤¬à¥à¤°à¥‹à¤¡à¤¬à¥à¤¯à¤¾à¤¨à¥à¤¡ à¤µà¤¿à¤¸à¥à¤¤à¤¾à¤°, à¤° à¤¨à¤¯à¤¾à¤ à¤¸à¥à¤Ÿà¤¾à¤°à¥à¤Ÿà¤…à¤ª à¤®à¥ˆà¤¤à¥à¤°à¥€ à¤¨à¥€à¤¤à¤¿à¤¹à¤°à¥‚à¤•à¥‹ à¤¨à¤¿à¤°à¥à¤®à¤¾à¤£à¤²à¥‡ à¤¯à¤¸ à¤•à¥à¤·à¥‡à¤¤à¥à¤°à¤²à¤¾à¤ˆ à¤¥à¤ª à¤Šà¤°à¥à¤œà¤¾ à¤¦à¤¿à¤à¤•à¥‹ à¤›à¥¤',
    '# Digital Transformation in Nepal: How Youth IT Talent Is Reshaping the Economy\n\nKathmandu â€” In recent years, Nepal''s Information Technology (IT) sector has experienced exponential growth. Thousands of young software engineers, data scientists, and cloud architects are delivering international projects directly from Kathmandu and beyond.\n\n## Growth of IT Service Exports\n\nAccording to recent economic data, IT service exports have emerged as a significant source of foreign currency earnings for Nepal. The rise of remote work culture and modern digital collaboration platforms has allowed Nepali engineers to integrate seamlessly into global engineering teams.\n\n### Public-Private Partnerships\n\nInvestments in STEM education, expansion of high-speed fiber infrastructure, and supportive policies for tech startups have catalyzed nationwide digital innovation.',
    '/logo.jpg',
    'published',
    true,
    true,
    now() - interval '2 hours',
    1420,
    'Nepal Digital Transformation & Youth IT Talent',
    'How Nepali young software professionals are leading digital transformation and IT export services.'
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000005',
    'à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤¿à¤¯ à¤•à¥à¤°à¤¿à¤•à¥‡à¤Ÿ à¤Ÿà¥‹à¤²à¥€à¤•à¥‹ à¤‰à¤¤à¥à¤•à¥ƒà¤·à¥à¤Ÿ à¤ªà¥à¤°à¤¦à¤°à¥à¤¶à¤¨: à¤¯à¥à¤µà¤¾ à¤–à¥‡à¤²à¤¾à¤¡à¥€à¤¹à¤°à¥‚à¤•à¥‹ à¤šà¤®à¥à¤•à¤¿à¤²à¥‹ à¤‰à¤¦à¤¯',
    'National Cricket Team Shines: The Rise of Promising Young Players',
    'national-cricket-team-performance-youth-stars',
    'à¤µà¤¿à¤¶à¥à¤µà¤•à¤ª à¤›à¤¨à¥‹à¤Ÿ à¤° à¤…à¤¨à¥à¤¤à¤°à¥à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤¿à¤¯ à¤¸à¤¿à¤°à¤¿à¤œà¤¹à¤°à¥‚à¤®à¤¾ à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤¯à¥à¤µà¤¾ à¤–à¥‡à¤²à¤¾à¤¡à¥€à¤¹à¤°à¥‚à¤•à¥‹ à¤‰à¤šà¥à¤š à¤®à¤¨à¥‹à¤¬à¤² à¤° à¤à¤¤à¤¿à¤¹à¤¾à¤¸à¤¿à¤• à¤œà¤¿à¤¤à¥¤',
    'Outstanding bowling and batting performances from new talent propel Nepali cricket forward on the international stage.',
    '# à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤¿à¤¯ à¤•à¥à¤°à¤¿à¤•à¥‡à¤Ÿ à¤Ÿà¥‹à¤²à¥€à¤•à¥‹ à¤‰à¤¤à¥à¤•à¥ƒà¤·à¥à¤Ÿ à¤ªà¥à¤°à¤¦à¤°à¥à¤¶à¤¨\n\nà¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤•à¥à¤°à¤¿à¤•à¥‡à¤Ÿà¤²à¥‡ à¤…à¤¨à¥à¤¤à¤°à¥à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤¿à¤¯ à¤®à¤žà¥à¤šà¤®à¤¾ à¤¨à¤¿à¤°à¤¨à¥à¤¤à¤° à¤¸à¤«à¤²à¤¤à¤¾à¤•à¥‹ à¤¨à¤¯à¤¾à¤ à¤‰à¤šà¤¾à¤‡ à¤šà¥à¤®à¤¿à¤°à¤¹à¥‡à¤•à¥‹ à¤›à¥¤ à¤•à¥€à¤°à¥à¤¤à¤¿à¤ªà¥à¤°à¤¸à¥à¤¥à¤¿à¤¤ à¤¤à¥à¤°à¤¿à¤µà¤¿ à¤…à¤¨à¥à¤¤à¤°à¥à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¤¿à¤¯ à¤®à¥ˆà¤¦à¤¾à¤¨à¤®à¤¾ à¤¹à¤œà¤¾à¤°à¥Œà¤ à¤¸à¤®à¤°à¥à¤¥à¤•à¤¹à¤°à¥‚à¤•à¥‹ à¤‰à¤¤à¥à¤¸à¤¾à¤¹à¤¬à¥€à¤š à¤¯à¥à¤µà¤¾ à¤–à¥‡à¤²à¤¾à¤¡à¥€à¤¹à¤°à¥‚à¤²à¥‡ à¤‰à¤¤à¥à¤•à¥ƒà¤·à¥à¤Ÿ à¤–à¥‡à¤² à¤•à¥Œà¤¶à¤² à¤ªà¥à¤°à¤¦à¤°à¥à¤¶à¤¨ à¤—à¤°à¥‡à¤•à¤¾ à¤›à¤¨à¥à¥¤\n\n## à¤°à¤£à¤¨à¥€à¤¤à¤¿à¤• à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨ à¤° à¤…à¤¨à¥à¤¶à¤¾à¤¸à¤¨\n\nà¤¨à¤¯à¤¾à¤ à¤ªà¥à¤°à¤¶à¤¿à¤•à¥à¤·à¤£ à¤ªà¤¦à¥à¤§à¤¤à¤¿ à¤° à¤Ÿà¥‹à¤²à¥€ à¤­à¤¿à¤¤à¥à¤°à¤•à¥‹ à¤†à¤ªà¤¸à¥€ à¤¸à¤®à¤¨à¥à¤µà¤¯à¤²à¥‡ à¤–à¥‡à¤²à¤¾à¤¡à¥€à¤¹à¤°à¥‚à¤•à¥‹ à¤†à¤¤à¥à¤®à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸ à¤‰à¤²à¥à¤²à¥‡à¤–à¤¨à¥€à¤¯ à¤°à¥‚à¤ªà¤®à¤¾ à¤¬à¤¢à¤¾à¤à¤•à¥‹ à¤›à¥¤',
    '# National Cricket Team Shines: The Rise of Promising Young Players\n\nNepal''s national cricket team continues to inspire millions of fans across the country and the diaspora with spirited international performances.\n\n## Strategic Disciplined Approach\n\nModern training methodologies, domestic league competitiveness, and a clear vision from coaching staff have given the younger squad an assertive edge.',
    '/logo.jpg',
    'published',
    false,
    true,
    now() - interval '5 hours',
    890,
    'Nepal National Cricket Team Youth Stars',
    'Historic performances by Nepal''s emerging cricket squad in international competitions.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Social Links
INSERT INTO public.social_links (id, profile_id, platform, url, label, icon_name, is_active, sort_order)
VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'facebook', 'https://facebook.com/youthbrainnews', 'Facebook', 'Facebook', true, 1),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'twitter', 'https://twitter.com/youthbrainnews', 'X (Twitter)', 'Twitter', true, 2),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'youtube', 'https://youtube.com/@youthbrainnews', 'YouTube', 'Youtube', true, 3),
    ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'linkedin', 'https://linkedin.com/company/youthbrainnews', 'LinkedIn', 'Linkedin', true, 4)
ON CONFLICT (id) DO NOTHING;

-- Seed Site Settings
INSERT INTO public.site_settings (
    id,
    profile_id,
    site_name_ne,
    site_name_en,
    tagline_ne,
    tagline_en,
    logo_url,
    og_image_url,
    copyright_ne,
    copyright_en
) VALUES (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'à¤¯à¥à¤¥ à¤¬à¥à¤°à¥‡à¤¨ à¤¨à¥à¤¯à¥à¤œ',
    'YouTh Brain News',
    'à¤¸à¤¤à¥à¤¯, à¤¤à¤¥à¥à¤¯ à¤° à¤¨à¤¿à¤·à¥à¤ªà¤•à¥à¤· à¤¸à¤®à¤¾à¤šà¤¾à¤°à¤•à¥‹ à¤µà¤¿à¤¶à¥à¤µà¤¸à¤¨à¥€à¤¯ à¤¸à¥à¤°à¥‹à¤¤',
    'Your Trusted Source for Truth, Facts and Impartial News',
    '/logo.jpg',
    '/logo.jpg',
    'Â© à¥¨à¥¦à¥¨à¥¬ YouTh Brain News. à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤',
    'Â© 2026 YouTh Brain News. All rights reserved.'
) ON CONFLICT (id) DO NOTHING;
-- 20241019000006_fix_permissions.sql
-- Table grants and role permissions

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.login_attempts TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
-- 20241022000007_multilingual_and_homepage.sql
-- Homepage sections and configuration

CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    section_key TEXT NOT NULL UNIQUE,
    title_ne TEXT NOT NULL,
    title_en TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS for homepage_sections
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Active Homepage Sections"
ON public.homepage_sections FOR SELECT
USING (is_active = true);

CREATE POLICY "Owner All Homepage Sections"
ON public.homepage_sections FOR ALL
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

CREATE TRIGGER update_homepage_sections_modtime 
BEFORE UPDATE ON public.homepage_sections 
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Default Seed for homepage sections
INSERT INTO public.homepage_sections (id, profile_id, section_key, title_ne, title_en, config, sort_order, is_active)
VALUES
    ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ticker', 'à¤¤à¤¾à¤œà¤¾ à¤…à¤ªà¤¡à¥‡à¤Ÿ', 'Breaking Updates', '{"limit": 5, "speed": 40}'::jsonb, 1, true),
    ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'hero', 'à¤®à¥à¤–à¥à¤¯ à¤¸à¤®à¤¾à¤šà¤¾à¤°', 'Lead Stories', '{"layout": "grid", "highlightCount": 3}'::jsonb, 2, true),
    ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'politics', 'à¤°à¤¾à¤œà¤¨à¥€à¤¤à¤¿ à¤µà¤¿à¤¶à¥‡à¤·', 'Politics Focus', '{"categorySlug": "politics", "itemCount": 4}'::jsonb, 3, true),
    ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'society', 'à¤¸à¤®à¤¾à¤œ à¤° à¤¸à¤°à¥‹à¤•à¤¾à¤°', 'Society & Community', '{"categorySlug": "society", "itemCount": 4}'::jsonb, 4, true),
    ('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'economy', 'à¤…à¤°à¥à¤¥ à¤° à¤µà¥à¤¯à¤¾à¤ªà¤¾à¤°', 'Economy & Business', '{"categorySlug": "economy", "itemCount": 4}'::jsonb, 5, true),
    ('50000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'science-tech', 'à¤µà¤¿à¤œà¥à¤žà¤¾à¤¨ à¤¤à¤¥à¤¾ à¤ªà¥à¤°à¤µà¤¿à¤§à¤¿', 'Science & Technology', '{"categorySlug": "science-tech", "itemCount": 4}'::jsonb, 6, true),
    ('50000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'sports', 'à¤–à¥‡à¤²à¤•à¥à¤¦ à¤—à¤¤à¤¿à¤µà¤¿à¤§à¤¿', 'Sports Roundup', '{"categorySlug": "sports", "itemCount": 4}'::jsonb, 7, true),
    ('50000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'interview', 'à¤µà¤¿à¤¶à¥‡à¤· à¤…à¤¨à¥à¤¤à¤°à¥à¤µà¤¾à¤°à¥à¤¤à¤¾', 'Exclusive Interview', '{"categorySlug": "interview", "itemCount": 4}'::jsonb, 8, true),
    ('50000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'gallery', 'à¤«à¥‹à¤Ÿà¥‹ à¤«à¤¿à¤šà¤°', 'Photo Gallery', '{"layout": "carousel"}'::jsonb, 9, true)
ON CONFLICT (section_key) DO NOTHING;
