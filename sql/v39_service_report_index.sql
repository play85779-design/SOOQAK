-- SOOQAK V39: complete the missing foreign-key lookup index.
-- Applied on 2026-11-21 to Supabase project zwbtiyqgrgjybwaguuyn.
CREATE INDEX IF NOT EXISTS sooqak_service_reports_reporter_id_idx
  ON public.sooqak_service_reports(reporter_id);
