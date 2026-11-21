-- Synthetic Supabase interfaces for an empty, disposable PostgreSQL database only.
CREATE ROLE anon; CREATE ROLE authenticated;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT current_setting('fixture.uid',true)::uuid $$;
CREATE FUNCTION public.sooqak_is_admin() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT auth.uid()='00000000-0000-4000-8000-000000000003'::uuid $$;
CREATE TABLE public.sooqak_accounts(id uuid PRIMARY KEY, kind text, owner_id uuid);
CREATE TABLE public.sooqak_service_directory(id uuid PRIMARY KEY, moderation_state text);
CREATE TABLE public.sooqak_service_reports(id uuid PRIMARY KEY, status text);
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON public.sooqak_accounts TO authenticated;
INSERT INTO auth.users VALUES ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002'),('00000000-0000-4000-8000-000000000003');
INSERT INTO public.sooqak_accounts VALUES ('10000000-0000-4000-8000-000000000001','business','00000000-0000-4000-8000-000000000001');
\ir ../../migrations/NOT_APPLIED_V69_V70_STORE_ACCESS.sql
\ir ../../migrations/NOT_APPLIED_V79_DECISION_LOG.sql
SET ROLE authenticated;
SET fixture.uid='00000000-0000-4000-8000-000000000001';
INSERT INTO public.sooqak_store_staff VALUES ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002');
INSERT INTO public.sooqak_store_verification_requests(account_id) VALUES ('10000000-0000-4000-8000-000000000001');
SET fixture.uid='00000000-0000-4000-8000-000000000002';
DO $$ BEGIN
 IF (SELECT count(*) FROM public.sooqak_store_staff)<>1 OR EXISTS(SELECT FROM public.sooqak_store_verification_requests) THEN RAISE EXCEPTION 'Member visibility mismatch'; END IF;
END $$;
SET fixture.uid='00000000-0000-4000-8000-000000000003';
UPDATE public.sooqak_store_verification_requests SET status='approved';
DO $$ BEGIN
 IF (SELECT count(*) FROM public.sooqak_moderation_decisions WHERE next_state='approved' AND previous_state='pending' AND actor_id=auth.uid())<>1 THEN RAISE EXCEPTION 'Decision history mismatch'; END IF;
END $$;
SET fixture.uid='00000000-0000-4000-8000-000000000001';
DO $$ BEGIN
 IF EXISTS(SELECT FROM public.sooqak_moderation_decisions) THEN RAISE EXCEPTION 'Audit visibility mismatch'; END IF;
END $$;
