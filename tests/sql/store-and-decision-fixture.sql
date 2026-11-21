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
RESET ROLE;
ALTER TABLE public.sooqak_service_directory ADD COLUMN owner_id uuid, ADD COLUMN status text;
GRANT SELECT ON public.sooqak_service_directory TO authenticated;
INSERT INTO public.sooqak_service_directory VALUES ('20000000-0000-4000-8000-000000000001','approved','00000000-0000-4000-8000-000000000002','active');
\ir ../../migrations/NOT_APPLIED_V73_V74_SERVICE_REVIEWS.sql
SET ROLE authenticated;
SET fixture.uid='00000000-0000-4000-8000-000000000001';
INSERT INTO public.sooqak_service_orders(service_id,provider_id) VALUES ('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002') RETURNING id AS order_ref \gset
INSERT INTO public.sooqak_service_completions(order_id) VALUES (:'order_ref');
DO $$ BEGIN
 BEGIN
  INSERT INTO public.sooqak_service_reviews(order_id,stars) SELECT id,5 FROM public.sooqak_service_orders;
  RAISE EXCEPTION 'Premature review accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SET fixture.uid='00000000-0000-4000-8000-000000000002';
INSERT INTO public.sooqak_service_completions(order_id) VALUES (:'order_ref');
SET fixture.uid='00000000-0000-4000-8000-000000000001';
INSERT INTO public.sooqak_service_reviews(order_id,stars) VALUES (:'order_ref',5);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.sooqak_service_reviews WHERE stars=5)<>1 THEN RAISE EXCEPTION 'Completed service review missing'; END IF;
END $$;
RESET ROLE;
CREATE TABLE public.sooqak_messages(id bigint GENERATED ALWAYS AS IDENTITY, sender_id uuid DEFAULT auth.uid(), body text);
GRANT INSERT(body) ON public.sooqak_messages TO authenticated;
\ir ../../migrations/NOT_APPLIED_V65_MESSAGE_THROTTLE.sql
SET ROLE authenticated;
INSERT INTO public.sooqak_messages(body) SELECT 'fixture' FROM generate_series(1,20);
DO $$ BEGIN
 BEGIN
  INSERT INTO public.sooqak_messages(body) VALUES ('over limit');
  RAISE EXCEPTION 'Unexpected extra send' USING ERRCODE='23514';
 EXCEPTION WHEN SQLSTATE 'P0001' THEN NULL; END;
END $$;
RESET ROLE;
DO $$ BEGIN IF (SELECT count(*) FROM public.sooqak_messages)<>20 THEN RAISE EXCEPTION 'Limit mismatch'; END IF; END $$;
UPDATE public.sooqak_message_windows SET started_at=now()-interval '2 minutes';
SET ROLE authenticated;
INSERT INTO public.sooqak_messages(body) VALUES ('new interval');
