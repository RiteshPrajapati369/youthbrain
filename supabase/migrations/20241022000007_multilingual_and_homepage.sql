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
    ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ticker', 'ताजा अपडेट', 'Breaking Updates', '{"limit": 5, "speed": 40}'::jsonb, 1, true),
    ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'hero', 'मुख्य समाचार', 'Lead Stories', '{"layout": "grid", "highlightCount": 3}'::jsonb, 2, true),
    ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'politics', 'राजनीति विशेष', 'Politics Focus', '{"categorySlug": "politics", "itemCount": 4}'::jsonb, 3, true),
    ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'society', 'समाज र सरोकार', 'Society & Community', '{"categorySlug": "society", "itemCount": 4}'::jsonb, 4, true),
    ('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'economy', 'अर्थ र व्यापार', 'Economy & Business', '{"categorySlug": "economy", "itemCount": 4}'::jsonb, 5, true),
    ('50000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'science-tech', 'विज्ञान तथा प्रविधि', 'Science & Technology', '{"categorySlug": "science-tech", "itemCount": 4}'::jsonb, 6, true),
    ('50000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'sports', 'खेलकुद गतिविधि', 'Sports Roundup', '{"categorySlug": "sports", "itemCount": 4}'::jsonb, 7, true),
    ('50000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'interview', 'विशेष अन्तर्वार्ता', 'Exclusive Interview', '{"categorySlug": "interview", "itemCount": 4}'::jsonb, 8, true),
    ('50000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'gallery', 'फोटो फिचर', 'Photo Gallery', '{"layout": "carousel"}'::jsonb, 9, true)
ON CONFLICT (section_key) DO NOTHING;
