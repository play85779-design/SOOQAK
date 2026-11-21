-- NOT_APPLIED: B07 owner's approval log. Review and test in an ISOLATED database only.
-- Does NOT grant an owner, activate payments, alter production or approve execution.
-- Owner membership requires a separate verified operator decision and remains empty.
BEGIN;
CREATE SCHEMA sooqak_owner_private;
REVOKE ALL ON SCHEMA sooqak_owner_private FROM PUBLIC, anon, authenticated;

CREATE TABLE sooqak_owner_private.owners (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  assigned_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON sooqak_owner_private.owners FROM PUBLIC, anon, authenticated;
ALTER TABLE sooqak_owner_private.owners ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.sooqak_is_owner() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL
     AND public.sooqak_verified_email()
     AND EXISTS (
       SELECT 1 FROM sooqak_owner_private.owners o
        WHERE o.user_id=(SELECT auth.uid())
     );
$$;
REVOKE ALL ON FUNCTION public.sooqak_is_owner() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sooqak_is_owner() TO authenticated;

CREATE TABLE public.sooqak_owner_approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  action text NOT NULL CHECK (action IN (
    'billing-change','paid-service','production-deploy','database-migration',
    'privilege-grant','data-delete','security-exception','backup-policy','other-sensitive'
  )),
  reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 10 AND 500),
  estimated_cost_sar numeric(12,2) CHECK (estimated_cost_sar >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_by uuid REFERENCES auth.users(id),
  decision_reason text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (status='pending' AND decided_by IS NULL AND decision_reason IS NULL AND decided_at IS NULL)
    OR
    (status IN ('approved','rejected') AND decided_by IS NOT NULL
      AND char_length(btrim(decision_reason)) BETWEEN 10 AND 500 AND decided_at IS NOT NULL)
  )
);
ALTER TABLE public.sooqak_owner_approval_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sooqak_owner_approval_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT(action,reason,estimated_cost_sar)
 ON public.sooqak_owner_approval_requests TO authenticated;
CREATE POLICY owner_approval_read ON public.sooqak_owner_approval_requests
 FOR SELECT TO authenticated USING (public.sooqak_is_owner());
CREATE POLICY owner_approval_create ON public.sooqak_owner_approval_requests
 FOR INSERT TO authenticated WITH CHECK (
   requested_by=(SELECT auth.uid()) AND public.sooqak_is_owner()
   AND status='pending' AND decided_by IS NULL AND decided_at IS NULL
 );
-- No direct UPDATE or DELETE grant or policy. A client cannot decide or rewrite history.

CREATE TABLE sooqak_owner_private.approval_decisions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.sooqak_owner_approval_requests(id),
  actor_id uuid NOT NULL REFERENCES auth.users(id),
  decision text NOT NULL CHECK (decision IN ('approved','rejected')),
  evidence text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id)
);
REVOKE ALL ON sooqak_owner_private.approval_decisions FROM PUBLIC, anon, authenticated;
ALTER TABLE sooqak_owner_private.approval_decisions ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.sooqak_owner_decide(p_request uuid,p_decision text,p_reason text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid := (SELECT auth.uid());
        row_data public.sooqak_owner_approval_requests%ROWTYPE;
        clean_reason text := btrim(coalesce(p_reason,''));
BEGIN
  IF actor IS NULL OR NOT public.sooqak_is_owner() THEN
    RAISE EXCEPTION 'Owner authorization required' USING ERRCODE='42501';
  END IF;
  IF p_decision IS NULL OR p_decision NOT IN ('approved','rejected') THEN
    RAISE EXCEPTION 'Invalid decision';
  END IF;
  IF char_length(clean_reason) NOT BETWEEN 10 AND 500 THEN
    RAISE EXCEPTION 'Decision reason required (10–500 characters)';
  END IF;
  SELECT * INTO row_data FROM public.sooqak_owner_approval_requests
   WHERE id=p_request FOR UPDATE;
  IF NOT FOUND OR row_data.status<>'pending' THEN
    RAISE EXCEPTION 'Request missing or already decided';
  END IF;
  IF p_decision='approved' AND row_data.estimated_cost_sar IS NULL THEN
    RAISE EXCEPTION 'Unknown cost may not be approved; create a verified request';
  END IF;
  UPDATE public.sooqak_owner_approval_requests
     SET status=p_decision, decided_by=actor, decision_reason=clean_reason, decided_at=now()
   WHERE id=p_request AND status='pending';
  INSERT INTO sooqak_owner_private.approval_decisions(request_id,actor_id,decision,evidence)
   VALUES(p_request,actor,p_decision,clean_reason);
  -- Recording a decision never deploys code, purchases a plan or changes data.
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.sooqak_owner_decide(uuid,text,text)
 FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sooqak_owner_decide(uuid,text,text) TO authenticated;
COMMIT;
