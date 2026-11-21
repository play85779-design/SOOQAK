-- SOOQAK V44 — STAGING ONLY / NOT APPLIED.
-- Applies after verification of an isolated staging database OR explicit approval for a live shared DB migration.
-- Existing user data, category strings and RLS policies must be preserved.
BEGIN;
ALTER TABLE public.sooqak_listings
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS specifications jsonb NOT NULL DEFAULT '{}'::jsonb;
-- Avoid dynamic SQL. Validate size and shape; never store phone numbers, names or private identity here.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='sooqak_listings_subcategory_v44_check') THEN
    ALTER TABLE public.sooqak_listings ADD CONSTRAINT sooqak_listings_subcategory_v44_check
      CHECK (subcategory IS NULL OR length(subcategory) BETWEEN 1 AND 70);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='sooqak_listings_specs_v44_check') THEN
    ALTER TABLE public.sooqak_listings ADD CONSTRAINT sooqak_listings_specs_v44_check
      CHECK (jsonb_typeof(specifications)='object' AND pg_column_size(specifications)<4096);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_sooqak_listing_category_subcategory_v44
  ON public.sooqak_listings(category,subcategory)
  WHERE hidden_at IS NULL AND status IN ('active','reserved');
COMMIT;
