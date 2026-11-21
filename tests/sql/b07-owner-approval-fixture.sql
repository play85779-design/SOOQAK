-- B07: synthetic permissions test, disposable PostgreSQL cluster only.
DO $roles$BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'CREATE ROLE anon'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'CREATE ROLE authenticated'; END IF;
END $roles$;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT nullif(current_setting('fixture.uid',true),'')::uuid;
$$;
CREATE FUNCTION public.sooqak_verified_email() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM auth.users u WHERE u.id=(SELECT auth.uid())
                    AND u.email_confirmed_at IS NOT NULL);
$$;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
INSERT INTO auth.users VALUES
 ('00000000-0000-4000-8000-000000000001',now()),
 ('00000000-0000-4000-8000-000000000002',now()),
 ('00000000-0000-4000-8000-000000000003',NULL);
\ir ../../migrations/NOT_APPLIED_B07_OWNER_APPROVAL_AUDIT.sql
DO $$BEGIN
 IF has_schema_privilege('authenticated','sooqak_owner_private','USAGE')
 OR has_table_privilege('authenticated','public.sooqak_owner_approval_requests','UPDATE')
 OR has_table_privilege('anon','public.sooqak_owner_approval_requests','SELECT')
 OR has_function_privilege('anon','public.sooqak_owner_decide(uuid,text,text)','EXECUTE')
 THEN RAISE EXCEPTION 'Unsafe direct permissions'; END IF;
END $$;

SET ROLE authenticated;
SET fixture.uid='00000000-0000-4000-8000-000000000002';
DO $$DECLARE denied boolean:=false; BEGIN
  BEGIN
    INSERT INTO public.sooqak_owner_approval_requests(action,reason,estimated_cost_sar)
      VALUES('billing-change','Non-owner must be denied',300);
  EXCEPTION WHEN insufficient_privilege THEN denied:=true;
  END;
  IF NOT denied THEN RAISE EXCEPTION 'Unapproved user could request'; END IF;
  IF public.sooqak_is_owner() THEN RAISE EXCEPTION 'Non-owner granted'; END IF;
END $$;
RESET ROLE;
-- Simulate a separate trusted operator assignment. This is not part of the migration.
INSERT INTO sooqak_owner_private.owners(user_id)
 VALUES('00000000-0000-4000-8000-000000000001');
INSERT INTO sooqak_owner_private.owners(user_id)
 VALUES('00000000-0000-4000-8000-000000000003');

SET ROLE authenticated;
SET fixture.uid='00000000-0000-4000-8000-000000000003';
DO $$BEGIN
 IF public.sooqak_is_owner() THEN RAISE EXCEPTION 'Unverified email was accepted as owner'; END IF;
END $$;
SET fixture.uid='00000000-0000-4000-8000-000000000001';
DO $$BEGIN
 IF NOT public.sooqak_is_owner() THEN RAISE EXCEPTION 'Verified owner was blocked'; END IF;
END $$;
INSERT INTO public.sooqak_owner_approval_requests(action,reason,estimated_cost_sar)
 VALUES('billing-change','Owner request with verified cost',500);
INSERT INTO public.sooqak_owner_approval_requests(action,reason,estimated_cost_sar)
 VALUES('paid-service','Request whose price is not verified',NULL);
DO $$DECLARE req uuid; caught boolean:=false; BEGIN
 SELECT id INTO req FROM public.sooqak_owner_approval_requests WHERE estimated_cost_sar IS NULL;
 BEGIN PERFORM public.sooqak_owner_decide(req,'approved','Approve even with unverified cost');
 EXCEPTION WHEN raise_exception THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Unknown cost approved'; END IF;
END $$;
DO $$DECLARE req uuid; caught boolean:=false; BEGIN
 SELECT id INTO req FROM public.sooqak_owner_approval_requests WHERE estimated_cost_sar=500;
 PERFORM public.sooqak_owner_decide(req,'approved','Owner verified and approved request');
 BEGIN PERFORM public.sooqak_owner_decide(req,'approved','Attempt duplicate owner decision');
 EXCEPTION WHEN raise_exception THEN caught:=true; END;
 IF NOT caught THEN RAISE EXCEPTION 'Duplicate decision approved'; END IF;
END $$;
DO $$BEGIN
 IF (SELECT count(*) FROM public.sooqak_owner_approval_requests WHERE status='approved')<>1 THEN
  RAISE EXCEPTION 'Owner decision was not recorded exactly once'; END IF;
END $$;
SET fixture.uid='00000000-0000-4000-8000-000000000002';
DO $$DECLARE denied boolean:=false; BEGIN
 IF EXISTS(SELECT 1 FROM public.sooqak_owner_approval_requests) THEN
  RAISE EXCEPTION 'Non-owner could read approval history'; END IF;
 BEGIN
  PERFORM public.sooqak_owner_decide(
    (SELECT id FROM public.sooqak_owner_approval_requests LIMIT 1),'approved','Unauthorized decision');
 EXCEPTION WHEN insufficient_privilege THEN denied:=true;
 END;
 IF NOT denied THEN RAISE EXCEPTION 'Non-owner decision accepted'; END IF;
END $$;
RESET ROLE;
DO $$BEGIN
 IF (SELECT count(*) FROM sooqak_owner_private.approval_decisions)<>1
 OR (SELECT count(*) FROM public.sooqak_owner_approval_requests)<>2 THEN
  RAISE EXCEPTION 'Decision audit and request counts mismatch'; END IF;
END $$;
