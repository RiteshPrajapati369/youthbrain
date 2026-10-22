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
