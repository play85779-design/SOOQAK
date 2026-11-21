-- Stage independently of production. Decisions are recorded inside the original transaction.
BEGIN;
CREATE TABLE public.sooqak_moderation_decisions (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 source_table text NOT NULL,
 source_id uuid NOT NULL,
 previous_state text NOT NULL,
 next_state text NOT NULL,
 actor_id uuid NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sooqak_moderation_decisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sooqak_moderation_decisions FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.sooqak_moderation_decisions TO authenticated;
CREATE POLICY moderation_decisions_admin_read ON public.sooqak_moderation_decisions FOR SELECT TO authenticated USING (public.sooqak_is_admin());
CREATE FUNCTION public.sooqak_record_moderation_decision() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE before_state text; after_state text;
BEGIN
 before_state:=to_jsonb(OLD)->>TG_ARGV[0];
 after_state:=to_jsonb(NEW)->>TG_ARGV[0];
 IF before_state IS DISTINCT FROM after_state AND auth.uid() IS NOT NULL AND public.sooqak_is_admin() THEN
  INSERT INTO public.sooqak_moderation_decisions(source_table,source_id,previous_state,next_state,actor_id)
  VALUES(TG_TABLE_NAME,NEW.id,before_state,after_state,auth.uid());
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sooqak_record_moderation_decision() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER sooqak_audit_service_decision AFTER UPDATE OF moderation_state ON public.sooqak_service_directory
FOR EACH ROW EXECUTE FUNCTION public.sooqak_record_moderation_decision('moderation_state');
CREATE TRIGGER sooqak_audit_report_decision AFTER UPDATE OF status ON public.sooqak_service_reports
FOR EACH ROW EXECUTE FUNCTION public.sooqak_record_moderation_decision('status');
CREATE TRIGGER sooqak_audit_store_decision AFTER UPDATE OF status ON public.sooqak_store_verification_requests
FOR EACH ROW EXECUTE FUNCTION public.sooqak_record_moderation_decision('status');
COMMIT;
