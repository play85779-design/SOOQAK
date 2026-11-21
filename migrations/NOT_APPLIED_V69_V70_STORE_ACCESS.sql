-- Proposed for isolated staging only. Existing marketplace write policies remain authoritative.
BEGIN;
CREATE TABLE public.sooqak_store_staff (
 account_id uuid NOT NULL REFERENCES public.sooqak_accounts(id),
 member_id uuid NOT NULL REFERENCES auth.users(id),
 PRIMARY KEY (account_id,member_id)
);
ALTER TABLE public.sooqak_store_staff ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sooqak_store_staff FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,DELETE ON public.sooqak_store_staff TO authenticated;
CREATE POLICY staff_owner ON public.sooqak_store_staff FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.sooqak_accounts a WHERE a.id=account_id AND a.kind='business' AND a.owner_id=(SELECT auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.sooqak_accounts a WHERE a.id=account_id AND a.kind='business' AND a.owner_id=(SELECT auth.uid())));
CREATE POLICY staff_self ON public.sooqak_store_staff FOR SELECT TO authenticated USING (member_id=(SELECT auth.uid()));

CREATE TABLE public.sooqak_store_verification_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 account_id uuid NOT NULL REFERENCES public.sooqak_accounts(id),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','declined')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX sooqak_one_active_store_request ON public.sooqak_store_verification_requests(account_id) WHERE status IN ('pending','approved');
ALTER TABLE public.sooqak_store_verification_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sooqak_store_verification_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT(account_id),UPDATE(status) ON public.sooqak_store_verification_requests TO authenticated;
CREATE POLICY verification_owner_request ON public.sooqak_store_verification_requests FOR INSERT TO authenticated
 WITH CHECK (status='pending' AND EXISTS (SELECT 1 FROM public.sooqak_accounts a WHERE a.id=account_id AND a.kind='business' AND a.owner_id=(SELECT auth.uid())));
CREATE POLICY verification_read ON public.sooqak_store_verification_requests FOR SELECT TO authenticated
 USING (public.sooqak_is_admin() OR EXISTS (SELECT 1 FROM public.sooqak_accounts a WHERE a.id=account_id AND a.kind='business' AND a.owner_id=(SELECT auth.uid())));
CREATE POLICY verification_review ON public.sooqak_store_verification_requests FOR UPDATE TO authenticated
 USING (status='pending' AND public.sooqak_is_admin()) WITH CHECK (status IN ('approved','declined') AND public.sooqak_is_admin());
COMMIT;
