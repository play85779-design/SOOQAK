-- V28: add owner-provided map link and guarded moderation access.
ALTER TABLE public.sooqak_service_directory
 ADD COLUMN IF NOT EXISTS map_url text NOT NULL DEFAULT '';
ALTER TABLE public.sooqak_service_directory
 ADD CONSTRAINT ssd_map_url_safe CHECK (
    char_length(map_url)<=550 AND (
      map_url='' OR map_url ~ '^https://(www[.])?google[.](com|com[.]sa)/maps/'
      OR map_url ~ '^https://maps[.]google[.](com|com[.]sa)/'
      OR map_url ~ '^https://maps[.]app[.]goo[.]gl/'
      OR map_url ~ '^https://goo[.]gl/maps/'
    )
 );
DROP POLICY IF EXISTS ssr_admin_review_select ON public.sooqak_service_reports;
CREATE POLICY ssr_admin_review_select ON public.sooqak_service_reports
 FOR SELECT TO authenticated USING ((select public.sooqak_is_admin()));
DROP POLICY IF EXISTS ssr_admin_review_update ON public.sooqak_service_reports;
CREATE POLICY ssr_admin_review_update ON public.sooqak_service_reports
 FOR UPDATE TO authenticated USING ((select public.sooqak_is_admin()))
 WITH CHECK ((select public.sooqak_is_admin()));
GRANT UPDATE(status) ON public.sooqak_service_reports TO authenticated;
DROP POLICY IF EXISTS ssd_admin_moderate ON public.sooqak_service_directory;
CREATE POLICY ssd_admin_moderate ON public.sooqak_service_directory
 FOR UPDATE TO authenticated USING ((select public.sooqak_is_admin()))
 WITH CHECK ((select public.sooqak_is_admin()));

DROP POLICY IF EXISTS ssd_admin_read ON public.sooqak_service_directory;
CREATE POLICY ssd_admin_read ON public.sooqak_service_directory
 FOR SELECT TO authenticated USING ((select public.sooqak_is_admin()));
CREATE UNIQUE INDEX IF NOT EXISTS ssr_one_pending_per_reporter ON public.sooqak_service_reports(service_id,reporter_id) WHERE status='pending';
