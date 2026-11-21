-- Staging only. An operator provisions grants and reconciled snapshots separately.
BEGIN;
CREATE SCHEMA sooqak_finance;
REVOKE ALL ON SCHEMA sooqak_finance FROM PUBLIC, anon, authenticated;
CREATE TABLE sooqak_finance.readers (
 user_id uuid NOT NULL REFERENCES auth.users(id),
 scope text NOT NULL CHECK (scope IN ('finance','growth','risk')),
 PRIMARY KEY(user_id,scope)
);
CREATE TABLE sooqak_finance.metrics (
 scope text NOT NULL CHECK (scope IN ('finance','growth','risk')),
 metric text NOT NULL,
 value numeric NOT NULL,
 source text NOT NULL CHECK (length(trim(source)) BETWEEN 1 AND 160),
 observed_at timestamptz NOT NULL,
 PRIMARY KEY(scope,metric)
);
CREATE TABLE sooqak_finance.access_history (
 user_id uuid NOT NULL, read_day date NOT NULL,
 PRIMARY KEY(user_id,read_day)
);
CREATE TABLE sooqak_finance.change_history (
 changed_at timestamptz NOT NULL DEFAULT now(), actor text NOT NULL,
 relation_name text NOT NULL, operation text NOT NULL, previous_row jsonb, next_row jsonb
);
CREATE FUNCTION sooqak_finance.record_change() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 INSERT INTO sooqak_finance.change_history(actor,relation_name,operation,previous_row,next_row)
 VALUES(coalesce(auth.uid()::text,session_user),TG_TABLE_NAME,TG_OP,to_jsonb(OLD),to_jsonb(NEW));
 RETURN NULL;
END $$;
CREATE TRIGGER audit_readers AFTER INSERT OR UPDATE OR DELETE ON sooqak_finance.readers
 FOR EACH ROW EXECUTE FUNCTION sooqak_finance.record_change();
CREATE TRIGGER audit_metrics AFTER INSERT OR UPDATE OR DELETE ON sooqak_finance.metrics
 FOR EACH ROW EXECUTE FUNCTION sooqak_finance.record_change();
CREATE FUNCTION public.sooqak_owner_command_snapshot() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE viewer uuid:=auth.uid(); scopes text[];
BEGIN
 SELECT array_agg(scope) INTO scopes FROM sooqak_finance.readers WHERE user_id=viewer;
 IF scopes IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 INSERT INTO sooqak_finance.access_history VALUES(viewer,(now() AT TIME ZONE 'Asia/Riyadh')::date) ON CONFLICT DO NOTHING;
 RETURN jsonb_build_object('scopes',scopes,'metrics',coalesce((
  SELECT jsonb_agg(to_jsonb(m)) FROM sooqak_finance.metrics m WHERE m.scope=ANY(scopes)
 ),'[]'::jsonb));
END $$;
REVOKE ALL ON FUNCTION public.sooqak_owner_command_snapshot() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sooqak_owner_command_snapshot() TO authenticated;
COMMIT;
