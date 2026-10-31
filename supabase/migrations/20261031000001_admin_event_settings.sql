-- ============================================================================
-- HackIGNISIA — 20261031000001_admin_event_settings.sql
-- Admin Event Settings, Audit Logging, and Event Schedule Management RPC
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ADMIN AUDIT LOG TABLE & SECURITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Administrators only
DROP POLICY IF EXISTS "admin_audit_log_select_admin" ON public.admin_audit_log;
CREATE POLICY "admin_audit_log_select_admin" ON public.admin_audit_log
FOR SELECT TO authenticated
USING (public.is_admin());

-- No INSERT, UPDATE, or DELETE policies exist for any role.
-- Explicitly revoke all privileges from PUBLIC, anon, authenticated, then grant SELECT only to authenticated.
REVOKE ALL ON public.admin_audit_log FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;


-- ============================================================================
-- 2. PUBLIC.EVENTS ROW LEVEL SECURITY & POLICIES
-- ============================================================================

-- Ensure RLS is active on public.events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop every existing policy on public.events regardless of prior naming
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'events' LOOP
    EXECUTE format('DROP POLICY %I ON public.events', r.policyname);
  END LOOP;
END $$;

-- 1. Everyone (including anon) must be able to read active events for landing page,
--    countdown timer, timeline, and dashboard.
CREATE POLICY "events_select_all" ON public.events
FOR SELECT TO anon, authenticated
USING (true);

-- 2. Ensure client INSERT is restricted strictly to administrators
CREATE POLICY "events_admin_insert" ON public.events
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

-- 3. Ensure client UPDATE is restricted strictly to administrators
CREATE POLICY "events_admin_update" ON public.events
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Ensure client DELETE is restricted strictly to administrators
CREATE POLICY "events_admin_delete" ON public.events
FOR DELETE TO authenticated
USING (public.is_admin());

-- Table privileges: anon only needs SELECT; authenticated modifies via admin policies / RPC
REVOKE ALL ON public.events FROM anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;


-- ============================================================================
-- 3. ADMIN_UPDATE_EVENT_DATES RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_update_event_dates(
  p_event_id uuid,
  p_submission_opens_at timestamptz,
  p_submission_deadline_at timestamptz,
  p_judging_starts_at timestamptz,
  p_judging_ends_at timestamptz,
  p_results_at timestamptz DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_event record;
BEGIN
  -- 0. Authentication & Authorization checks
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  -- 1. Verify target event exists
  SELECT * INTO v_old_event
  FROM public.events
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  -- 2. Validate required timestamps are NOT NULL
  IF p_submission_opens_at IS NULL THEN
    RAISE EXCEPTION 'Submission window opens date is required';
  END IF;

  IF p_submission_deadline_at IS NULL THEN
    RAISE EXCEPTION 'Submission deadline is required';
  END IF;

  IF p_judging_starts_at IS NULL THEN
    RAISE EXCEPTION 'Judging start date is required';
  END IF;

  IF p_judging_ends_at IS NULL THEN
    RAISE EXCEPTION 'Judging end date is required';
  END IF;

  -- 3. Validate chronological ordering with exact field-specific error messages
  --    showing formatted timestamps in IST (Asia/Kolkata):
  --    opens < deadline <= judging_starts < judging_ends, and results_at >= judging_ends when set

  -- (a) submission_opens_at < submission_deadline_at
  IF p_submission_deadline_at <= p_submission_opens_at THEN
    RAISE EXCEPTION 'Submission deadline (%) must be after submission opens (%). Change submission deadline or submission opens.',
      to_char(p_submission_deadline_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') || ' IST',
      to_char(p_submission_opens_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') || ' IST';
  END IF;

  -- (b) submission_deadline_at <= judging_starts_at
  IF p_judging_starts_at < p_submission_deadline_at THEN
    RAISE EXCEPTION 'Judging start (%) cannot be before submission deadline (%). Change judging start or submission deadline.',
      to_char(p_judging_starts_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') || ' IST',
      to_char(p_submission_deadline_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') || ' IST';
  END IF;

  -- (c) judging_starts_at < judging_ends_at
  IF p_judging_ends_at <= p_judging_starts_at THEN
    RAISE EXCEPTION 'Judging end (%) must be after judging start (%). Change judging end or judging start.',
      to_char(p_judging_ends_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') || ' IST',
      to_char(p_judging_starts_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') || ' IST';
  END IF;

  -- (d) results_at >= judging_ends_at (when results_at is provided)
  IF p_results_at IS NOT NULL AND p_results_at < p_judging_ends_at THEN
    RAISE EXCEPTION 'Results announcement (%) cannot be before judging end (%). Change results date or judging end.',
      to_char(p_results_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') || ' IST',
      to_char(p_judging_ends_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') || ' IST';
  END IF;

  -- 4. Update the event record (leave registration_opens_at / registration_closes_at untouched,
  --    and do not assign updated_at since public.events has no such column)
  UPDATE public.events
  SET
    submission_opens_at = p_submission_opens_at,
    submission_deadline_at = p_submission_deadline_at,
    judging_starts_at = p_judging_starts_at,
    judging_ends_at = p_judging_ends_at,
    results_at = p_results_at
  WHERE id = p_event_id;

  -- 5. Record the administrative change in public.admin_audit_log
  INSERT INTO public.admin_audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    details
  ) VALUES (
    auth.uid(),
    'event_dates_updated',
    'events',
    p_event_id::text,
    jsonb_build_object(
      'submission_opens_at', jsonb_build_object('old', v_old_event.submission_opens_at, 'new', p_submission_opens_at),
      'submission_deadline_at', jsonb_build_object('old', v_old_event.submission_deadline_at, 'new', p_submission_deadline_at),
      'judging_starts_at', jsonb_build_object('old', v_old_event.judging_starts_at, 'new', p_judging_starts_at),
      'judging_ends_at', jsonb_build_object('old', v_old_event.judging_ends_at, 'new', p_judging_ends_at),
      'results_at', jsonb_build_object('old', v_old_event.results_at, 'new', p_results_at)
    )
  );
END;
$$;

-- 4. Maintain strict execution permissions
REVOKE EXECUTE ON FUNCTION public.admin_update_event_dates(uuid, timestamptz, timestamptz, timestamptz, timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_event_dates(uuid, timestamptz, timestamptz, timestamptz, timestamptz, timestamptz) TO authenticated;

COMMIT;
