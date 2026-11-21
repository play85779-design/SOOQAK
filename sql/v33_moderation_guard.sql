-- V33: Separate moderation from owner-hidden listing state. Do not overwrite legacy owner status.
ALTER TABLE public.sooqak_service_directory
 ADD COLUMN IF NOT EXISTS moderation_state text NOT NULL DEFAULT 'approved'
 CHECK (moderation_state IN ('approved','suspended'));
CREATE INDEX IF NOT EXISTS ssd_public_moderated_idx ON public.sooqak_service_directory(kind,city,created_at DESC)
 WHERE status='active' AND moderation_state='approved';
DROP POLICY IF EXISTS ssd_public_read ON public.sooqak_service_directory;
CREATE POLICY ssd_public_read ON public.sooqak_service_directory FOR SELECT TO anon,authenticated
 USING ((status='active' AND moderation_state='approved') OR owner_id=(select auth.uid()));
-- A user cannot update an administratively suspended record.
DROP POLICY IF EXISTS ssd_owner_update ON public.sooqak_service_directory;
CREATE POLICY ssd_owner_update ON public.sooqak_service_directory FOR UPDATE TO authenticated
 USING (owner_id=(select auth.uid()) AND moderation_state='approved')
 WITH CHECK (owner_id=(select auth.uid()) AND moderation_state='approved' AND public.sooqak_verified_email());
CREATE OR REPLACE FUNCTION public.sooqak_directory_moderation_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $guard$
BEGIN
 IF NEW.moderation_state IS DISTINCT FROM OLD.moderation_state AND NOT public.sooqak_is_admin() THEN
   RAISE EXCEPTION 'Only a verified administrator can change moderation state' USING ERRCODE='42501';
 END IF;
 IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
   RAISE EXCEPTION 'Changing service ownership is not allowed' USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END;
$guard$;
DROP TRIGGER IF EXISTS sooqak_directory_moderation_guard_trigger ON public.sooqak_service_directory;
CREATE TRIGGER sooqak_directory_moderation_guard_trigger BEFORE UPDATE ON public.sooqak_service_directory
 FOR EACH ROW EXECUTE FUNCTION public.sooqak_directory_moderation_guard();
-- Prevent anon from seeing suspended rows. Admins have a separate RLS select policy.
