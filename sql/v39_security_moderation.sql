-- SOOQAK V39 — security and closed-beta service review.
-- Compatibility: existing V38 client account inserts only owner_id, kind, display_name.
-- Keep the existing project/data, no DELETE/TRUNCATE/DROP TABLE.

-- 1) An end user can never self-assert a verified business on account creation.
REVOKE INSERT ON TABLE public.sooqak_accounts FROM authenticated;
GRANT INSERT (owner_id, kind, display_name) ON TABLE public.sooqak_accounts TO authenticated;

-- 2) Remove unneeded maintenance powers that bypass row-level security.
REVOKE TRUNCATE, TRIGGER, REFERENCES, MAINTAIN
  ON TABLE public.sooqak_private_profiles,
           public.sooqak_service_directory,
           public.sooqak_service_reports
  FROM authenticated;

-- 3) Newly submitted directory entries must wait for moderator approval.
ALTER TABLE public.sooqak_service_directory
  DROP CONSTRAINT IF EXISTS sooqak_service_directory_moderation_state_check;
ALTER TABLE public.sooqak_service_directory
  ADD CONSTRAINT sooqak_service_directory_moderation_state_check
  CHECK (moderation_state IN ('pending', 'approved', 'suspended'));
ALTER TABLE public.sooqak_service_directory
  ALTER COLUMN moderation_state SET DEFAULT 'pending';

-- A public client cannot submit 'approved' directly, even by hand-crafted API calls.
DROP POLICY IF EXISTS ssd_owner_insert ON public.sooqak_service_directory;
CREATE POLICY ssd_owner_insert ON public.sooqak_service_directory
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = (select auth.uid()) AND public.sooqak_verified_email()
    AND moderation_state = 'pending'
  );

-- Pending edits stay editable by the owner; suspended entries stay locked.
DROP POLICY IF EXISTS ssd_owner_update ON public.sooqak_service_directory;
CREATE POLICY ssd_owner_update ON public.sooqak_service_directory
  FOR UPDATE TO authenticated
  USING (owner_id = (select auth.uid()) AND moderation_state IN ('pending','approved'))
  WITH CHECK (
    owner_id = (select auth.uid())
    AND moderation_state IN ('pending','approved')
    AND public.sooqak_verified_email()
  );

-- Owner content edits are re-queued for approval; toggling visibility alone is not.
-- Only a verified administrator can approve, suspend, or unsuspend.
CREATE OR REPLACE FUNCTION public.sooqak_directory_moderation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $guard$
BEGIN
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    RAISE EXCEPTION 'Changing service ownership is not allowed' USING ERRCODE='42501';
  END IF;
  IF NOT public.sooqak_is_admin() THEN
    IF NEW.moderation_state IS DISTINCT FROM OLD.moderation_state THEN
      RAISE EXCEPTION 'Only a verified administrator can change moderation state' USING ERRCODE='42501';
    END IF;
    IF ROW(NEW.kind,NEW.name,NEW.city,NEW.district,NEW.specialty,
           NEW.description,NEW.phone_e164,NEW.phone_public,
           NEW.address_text,NEW.hours_text,NEW.map_url)
       IS DISTINCT FROM
       ROW(OLD.kind,OLD.name,OLD.city,OLD.district,OLD.specialty,
           OLD.description,OLD.phone_e164,OLD.phone_public,
           OLD.address_text,OLD.hours_text,OLD.map_url) THEN
      NEW.moderation_state := 'pending';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$guard$;

-- Restrict newly created service fields: initial moderation and status rely on server defaults.
REVOKE INSERT ON TABLE public.sooqak_service_directory FROM authenticated;
GRANT INSERT (owner_id,kind,name,city,district,specialty,description,
              phone_e164,phone_public,address_text,hours_text,map_url,updated_at)
  ON TABLE public.sooqak_service_directory TO authenticated;

-- The service directory's existing 'ssd_public_read' policy already shows
-- only (active AND approved) rows to visitors, and own rows to owners.
-- The existing 'ssd_admin_moderate'/'ssd_admin_read' policies grant the verified
-- admin approval/rejection UI access; do not relax them.
