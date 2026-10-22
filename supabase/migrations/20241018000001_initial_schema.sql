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
    site_name_ne TEXT DEFAULT 'युथ ब्रेन न्युज' NOT NULL,
    site_name_en TEXT DEFAULT 'YouTh Brain News' NOT NULL,
    tagline_ne TEXT DEFAULT 'सत्य, तथ्य र निष्पक्ष समाचार',
    tagline_en TEXT DEFAULT 'Truth, Facts and Impartial News',
    logo_url TEXT DEFAULT '/logo.jpg',
    og_image_url TEXT DEFAULT '/logo.jpg',
    copyright_ne TEXT DEFAULT '© २०२६ YouTh Brain News. सर्वाधिकार सुरक्षित।',
    copyright_en TEXT DEFAULT '© 2026 YouTh Brain News. All rights reserved.',
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
