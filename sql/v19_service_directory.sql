-- SOOQAK V19-V22 service directory; no invented entries are seeded.
CREATE TABLE IF NOT EXISTS public.sooqak_service_directory (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK (kind IN ('workshop','plumbing','delivery')),
 name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 3 AND 100),
 city text NOT NULL CHECK (char_length(btrim(city)) BETWEEN 2 AND 70),
 district text NOT NULL DEFAULT '' CHECK (char_length(district)<=70),
 specialty text NOT NULL DEFAULT '' CHECK (char_length(specialty)<=140),
 description text NOT NULL DEFAULT '' CHECK (char_length(description)<=1500),
 phone_e164 text CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
 phone_public boolean NOT NULL DEFAULT false,
 address_text text NOT NULL DEFAULT '' CHECK (char_length(address_text)<=160),
 hours_text text NOT NULL DEFAULT '' CHECK (char_length(hours_text)<=140),
 status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT ssd_phone_requires_consent CHECK (phone_public = true OR phone_e164 IS NULL)
);
ALTER TABLE public.sooqak_service_directory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ssd_public_read ON public.sooqak_service_directory;
CREATE POLICY ssd_public_read ON public.sooqak_service_directory FOR SELECT TO anon,authenticated USING (status='active' OR owner_id=(select auth.uid()));
DROP POLICY IF EXISTS ssd_owner_insert ON public.sooqak_service_directory;
CREATE POLICY ssd_owner_insert ON public.sooqak_service_directory FOR INSERT TO authenticated WITH CHECK (owner_id=(select auth.uid()) AND public.sooqak_verified_email());
DROP POLICY IF EXISTS ssd_owner_update ON public.sooqak_service_directory;
CREATE POLICY ssd_owner_update ON public.sooqak_service_directory FOR UPDATE TO authenticated USING (owner_id=(select auth.uid())) WITH CHECK (owner_id=(select auth.uid()) AND public.sooqak_verified_email());
DROP POLICY IF EXISTS ssd_owner_delete ON public.sooqak_service_directory;
CREATE POLICY ssd_owner_delete ON public.sooqak_service_directory FOR DELETE TO authenticated USING (owner_id=(select auth.uid()));
CREATE INDEX IF NOT EXISTS ssd_kind_city_active_idx ON public.sooqak_service_directory(kind,city,created_at DESC) WHERE status='active';
CREATE INDEX IF NOT EXISTS ssd_owner_idx ON public.sooqak_service_directory(owner_id,created_at DESC);
REVOKE ALL ON public.sooqak_service_directory FROM anon;
GRANT SELECT ON public.sooqak_service_directory TO anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.sooqak_service_directory TO authenticated;
