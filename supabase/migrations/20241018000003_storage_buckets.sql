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
