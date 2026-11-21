-- SOOQAK V17 private profile. Apply to an authorized Supabase project once.
CREATE TABLE IF NOT EXISTS public.sooqak_private_profiles (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 city text NOT NULL DEFAULT '',
 district text NOT NULL DEFAULT '',
 birth_year smallint,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT spp_city_len CHECK (char_length(city)<=70),
 CONSTRAINT spp_district_len CHECK (char_length(district)<=70),
 CONSTRAINT spp_birth CHECK (birth_year IS NULL OR birth_year BETWEEN 1900 AND 2100)
);
ALTER TABLE public.sooqak_private_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS spp_select_own ON public.sooqak_private_profiles;
CREATE POLICY spp_select_own ON public.sooqak_private_profiles FOR SELECT TO authenticated USING (user_id=(select auth.uid()));
DROP POLICY IF EXISTS spp_insert_own ON public.sooqak_private_profiles;
CREATE POLICY spp_insert_own ON public.sooqak_private_profiles FOR INSERT TO authenticated WITH CHECK (user_id=(select auth.uid()));
DROP POLICY IF EXISTS spp_update_own ON public.sooqak_private_profiles;
CREATE POLICY spp_update_own ON public.sooqak_private_profiles FOR UPDATE TO authenticated USING (user_id=(select auth.uid())) WITH CHECK (user_id=(select auth.uid()));
REVOKE ALL ON public.sooqak_private_profiles FROM anon;
GRANT SELECT,INSERT,UPDATE ON public.sooqak_private_profiles TO authenticated;
