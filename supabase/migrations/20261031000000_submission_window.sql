-- ============================================================================
-- HackIGNISIA — 20261031000000_submission_window.sql
-- Submission and Judging Windows Hardening, Bucket Limit Update
-- ============================================================================

BEGIN;

-- 1. Add submission_opens_at column to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS submission_opens_at timestamptz;

-- 2. Update storage bucket file_size_limit to 5 MB (5 * 1024 * 1024 = 5242880 bytes)
UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'submissions';

-- 3. Recreate submit_project(uuid) with strict window configuration
CREATE OR REPLACE FUNCTION public.submit_project(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_submission record;
  v_deadline timestamptz;
  v_submission_window_start timestamptz;
  v_files_count integer;
BEGIN
  -- 0. Authentication check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Fetch submission record
  SELECT * INTO v_submission
  FROM public.submissions
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- 2. Reject re-submission (must currently be in 'draft' status)
  IF v_submission.status <> 'draft' THEN
    RAISE EXCEPTION 'Submission has already been submitted and cannot be resubmitted';
  END IF;

  -- 3. Validate leadership
  IF NOT public.is_team_leader(v_submission.team_id) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only the team leader can submit the project';
  END IF;

  -- 4. Check required content fields
  IF v_submission.title IS NULL OR trim(v_submission.title) = '' THEN
    RAISE EXCEPTION 'Project title is required for submission';
  END IF;

  IF v_submission.problem_statement IS NULL OR trim(v_submission.problem_statement) = '' THEN
    RAISE EXCEPTION 'Problem statement is required for submission';
  END IF;

  IF v_submission.solution IS NULL OR trim(v_submission.solution) = '' THEN
    RAISE EXCEPTION 'Solution description is required for submission';
  END IF;

  -- Require track IS NOT NULL and non-empty
  IF v_submission.track IS NULL OR trim(v_submission.track) = '' THEN
    RAISE EXCEPTION 'Project track is required for submission';
  END IF;

  -- 5. Require at least one submission_files row
  SELECT count(*) INTO v_files_count
  FROM public.submission_files
  WHERE submission_id = p_submission_id;

  IF v_files_count = 0 THEN
    RAISE EXCEPTION 'At least one project presentation file is required before submitting';
  END IF;

  -- 6. Check event submission window configuration and timing
  SELECT 
    e.submission_opens_at,
    e.submission_deadline_at
  INTO 
    v_submission_window_start,
    v_deadline
  FROM public.teams t
  JOIN public.events e ON t.event_id = e.id
  WHERE t.id = v_submission.team_id;

  IF v_submission_window_start IS NULL OR v_deadline IS NULL THEN
    RAISE EXCEPTION 'Submission window is not configured';
  END IF;

  IF now() < v_submission_window_start THEN
    RAISE EXCEPTION 'Submission window has not opened yet';
  END IF;

  IF now() > v_deadline THEN
    RAISE EXCEPTION 'Submission deadline has passed';
  END IF;

  -- 7. Flag current session to bypass protection trigger
  PERFORM set_config('app.submitting_via_rpc', 'true', true);

  -- 8. Finalize status
  UPDATE public.submissions
  SET status = 'submitted', submitted_at = now()
  WHERE id = p_submission_id;
END;
$$;

-- 4. Recreate finalize_evaluation(uuid) with strict judging window and track assignment check
CREATE OR REPLACE FUNCTION public.finalize_evaluation(p_evaluation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_eval record;
  v_sub_status text;
  v_sub_track text;
  v_event_id uuid;
  v_rubric jsonb;
  v_key text;
  v_judging_starts_at timestamptz;
  v_judging_ends_at timestamptz;
BEGIN
  -- 0. Authentication check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Fetch evaluation details
  SELECT * INTO v_eval
  FROM public.evaluations
  WHERE id = p_evaluation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Evaluation not found';
  END IF;

  -- 2. Verify ownership (fail-safe for NULL auth.uid() via IS DISTINCT FROM)
  IF v_eval.judge_id IS DISTINCT FROM auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'You do not have permission to finalize this evaluation';
  END IF;

  -- 3. Require current evaluation status to be 'draft'
  IF v_eval.status <> 'draft' THEN
    RAISE EXCEPTION 'Evaluation has already been finalized';
  END IF;

  -- 4. Require submission to be in 'submitted' status and fetch track & event_id
  SELECT s.status, s.track, t.event_id INTO v_sub_status, v_sub_track, v_event_id
  FROM public.submissions s
  JOIN public.teams t ON t.id = s.team_id
  WHERE s.id = v_eval.submission_id;

  IF v_sub_status IS DISTINCT FROM 'submitted' THEN
    RAISE EXCEPTION 'Cannot finalize evaluation for submission that is not in submitted status';
  END IF;

  -- Unless admin, verify judge is assigned to the submission's track
  IF NOT public.is_admin() THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.judge_assignments ja
      WHERE ja.judge_id = auth.uid()
        AND ja.track = v_sub_track
    ) THEN
      RAISE EXCEPTION 'You are not assigned to this track';
    END IF;
  END IF;

  -- 5. Require all rubric criteria to be scored with a numeric value
  SELECT criteria INTO v_rubric
  FROM public.event_rubrics
  WHERE event_id = v_event_id;

  IF v_rubric IS NULL THEN
    RAISE EXCEPTION 'No evaluation rubric configured for event %', v_event_id;
  END IF;

  FOR v_key IN SELECT jsonb_object_keys(v_rubric) LOOP
    IF NOT (v_eval.scores ? v_key) OR jsonb_typeof(v_eval.scores -> v_key) <> 'number' THEN
      RAISE EXCEPTION 'All criteria must be scored before finalizing';
    END IF;
  END LOOP;

  -- 6. Get judging window timestamps and enforce required window
  SELECT e.judging_starts_at, e.judging_ends_at
  INTO v_judging_starts_at, v_judging_ends_at
  FROM public.events e
  WHERE e.id = v_event_id;

  IF v_judging_starts_at IS NULL OR v_judging_ends_at IS NULL THEN
    RAISE EXCEPTION 'Judging window is not configured';
  END IF;

  IF now() < v_judging_starts_at THEN
    RAISE EXCEPTION 'Judging period has not started yet';
  END IF;

  IF now() > v_judging_ends_at THEN
    RAISE EXCEPTION 'Judging window has closed';
  END IF;

  -- 7. Bypass status lock and finalize
  PERFORM set_config('app.evaluating_via_rpc', 'true', true);

  UPDATE public.evaluations
  SET status = 'final', updated_at = now()
  WHERE id = p_evaluation_id;
END;
$$;

-- 5. Maintain explicit grants and revokes
REVOKE EXECUTE ON FUNCTION public.submit_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_project(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.finalize_evaluation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finalize_evaluation(uuid) TO authenticated;

COMMIT;

