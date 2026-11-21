-- Staging proposal only. Serialize sends per authenticated account across conversations.
BEGIN;
CREATE TABLE public.sooqak_message_windows (
 sender_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 started_at timestamptz NOT NULL,
 sent integer NOT NULL CHECK(sent BETWEEN 1 AND 20)
);
ALTER TABLE public.sooqak_message_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sooqak_message_windows FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.sooqak_limit_message_frequency() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); current_timepoint timestamptz:=clock_timestamp(); accepted integer;
BEGIN
 IF actor IS NULL OR NEW.sender_id IS DISTINCT FROM actor THEN
  RAISE EXCEPTION 'A signed-in sender is required' USING ERRCODE='42501';
 END IF;
 INSERT INTO public.sooqak_message_windows AS w(sender_id,started_at,sent)
 VALUES(actor,current_timepoint,1)
 ON CONFLICT(sender_id) DO UPDATE SET
  started_at=CASE WHEN w.started_at<=current_timepoint-interval '1 minute' THEN current_timepoint ELSE w.started_at END,
  sent=CASE WHEN w.started_at<=current_timepoint-interval '1 minute' THEN 1 ELSE w.sent+1 END
 WHERE w.started_at<=current_timepoint-interval '1 minute' OR w.sent<20
 RETURNING sent INTO accepted;
 IF accepted IS NULL THEN RAISE EXCEPTION 'انتظر قليلًا قبل إرسال رسالة أخرى' USING ERRCODE='P0001'; END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sooqak_limit_message_frequency() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER sooqak_message_frequency AFTER INSERT ON public.sooqak_messages
FOR EACH ROW EXECUTE FUNCTION public.sooqak_limit_message_frequency();
COMMIT;
