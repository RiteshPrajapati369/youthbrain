-- 20241019000006_fix_permissions.sql
-- Table grants and role permissions

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.login_attempts TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
