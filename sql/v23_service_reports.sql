CREATE TABLE IF NOT EXISTS public.sooqak_service_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.sooqak_service_directory(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('معلومات غير صحيحة','احتيال محتمل','محتوى غير مناسب','سبب آخر')),
  details text NOT NULL DEFAULT '' CHECK (char_length(details)<=500),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sooqak_service_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ssr_insert_own ON public.sooqak_service_reports;
CREATE POLICY ssr_insert_own ON public.sooqak_service_reports FOR INSERT TO authenticated WITH CHECK (reporter_id=(select auth.uid()));
DROP POLICY IF EXISTS ssr_read_own ON public.sooqak_service_reports;
CREATE POLICY ssr_read_own ON public.sooqak_service_reports FOR SELECT TO authenticated USING (reporter_id=(select auth.uid()));
REVOKE ALL ON public.sooqak_service_reports FROM anon;
GRANT SELECT,INSERT ON public.sooqak_service_reports TO authenticated;
