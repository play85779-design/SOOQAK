-- Isolated staging proposal. An order becomes reviewable after the two parties independently confirm completion.
BEGIN;
CREATE TABLE public.sooqak_service_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 service_id uuid NOT NULL REFERENCES public.sooqak_service_directory(id),
 customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
 provider_id uuid NOT NULL REFERENCES auth.users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (customer_id<>provider_id)
);
CREATE TABLE public.sooqak_service_completions (
 order_id uuid NOT NULL REFERENCES public.sooqak_service_orders(id),
 signer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
 PRIMARY KEY(order_id,signer_id)
);
CREATE TABLE public.sooqak_service_reviews (
 order_id uuid PRIMARY KEY REFERENCES public.sooqak_service_orders(id),
 stars smallint NOT NULL CHECK(stars BETWEEN 1 AND 5),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sooqak_service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sooqak_service_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sooqak_service_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sooqak_service_orders, public.sooqak_service_completions, public.sooqak_service_reviews FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT(service_id,provider_id) ON public.sooqak_service_orders TO authenticated;
GRANT SELECT,INSERT(order_id) ON public.sooqak_service_completions TO authenticated;
GRANT SELECT,INSERT(order_id,stars) ON public.sooqak_service_reviews TO authenticated;
CREATE POLICY service_order_create ON public.sooqak_service_orders FOR INSERT TO authenticated WITH CHECK (
 customer_id=(SELECT auth.uid()) AND EXISTS (SELECT 1 FROM public.sooqak_service_directory d WHERE d.id=service_id AND d.owner_id=provider_id AND d.status='active' AND d.moderation_state='approved')
);
CREATE POLICY service_order_participants ON public.sooqak_service_orders FOR SELECT TO authenticated USING ((SELECT auth.uid()) IN (customer_id,provider_id));
CREATE POLICY service_completion_sign ON public.sooqak_service_completions FOR INSERT TO authenticated WITH CHECK (
 signer_id=(SELECT auth.uid()) AND EXISTS (SELECT 1 FROM public.sooqak_service_orders o WHERE o.id=order_id)
);
CREATE POLICY service_completion_read ON public.sooqak_service_completions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.sooqak_service_orders o WHERE o.id=order_id));
CREATE POLICY service_review_create ON public.sooqak_service_reviews FOR INSERT TO authenticated WITH CHECK (
 EXISTS (SELECT 1 FROM public.sooqak_service_orders o WHERE o.id=order_id AND o.customer_id=(SELECT auth.uid()))
 AND (SELECT count(*) FROM public.sooqak_service_completions c WHERE c.order_id=sooqak_service_reviews.order_id)=2
);
CREATE POLICY service_review_participants ON public.sooqak_service_reviews FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.sooqak_service_orders o WHERE o.id=order_id));
COMMIT;
