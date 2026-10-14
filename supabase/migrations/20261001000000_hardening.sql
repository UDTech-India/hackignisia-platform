-- ============================================================================
-- HackIGNISIA — 20261001000000_hardening.sql
-- Hardening Submissions, Evaluations, Rubrics, Tracks, and RPC Functions
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TRACKS: SINGLE SOURCE OF TRUTH (Item 7)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed initial official tracks matching registration and judging
INSERT INTO public.tracks (name, description)
VALUES 
  ('AI & Machine Learning', 'Artificial intelligence, machine learning, and intelligent automation'),
  ('Web & App Development', 'Full-stack web applications, mobile apps, and developer platforms'),
  ('Social Impact & Innovation', 'Projects targeting social good, healthcare, education, or sustainability'),
  ('Open Innovation', 'Wildcard innovations, novel hardware/software blends, and emerging technologies')
ON CONFLICT (name) DO NOTHING;

-- Grant permissions on tracks
GRANT SELECT ON public.tracks TO anon, authenticated;
GRANT ALL ON public.tracks TO service_role;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tracks_select_all" ON public.tracks;
CREATE POLICY "tracks_select_all" ON public.tracks FOR SELECT TO anon, authenticated
USING (true);

-- Ensure all existing submissions and judge_assignments rows have a matching track before adding FK
INSERT INTO public.tracks (name)
SELECT DISTINCT track FROM public.submissions WHERE track IS NOT NULL
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.tracks (name)
SELECT DISTINCT track FROM public.judge_assignments WHERE track IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Add Foreign Key with ON UPDATE CASCADE
ALTER TABLE public.submissions
  DROP CONSTRAINT IF EXISTS submissions_track_fk;
ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_track_fk
  FOREIGN KEY (track) REFERENCES public.tracks(name) ON UPDATE CASCADE;

ALTER TABLE public.judge_assignments
  DROP CONSTRAINT IF EXISTS judge_assignments_track_fk;
ALTER TABLE public.judge_assignments
  ADD CONSTRAINT judge_assignments_track_fk
  FOREIGN KEY (track) REFERENCES public.tracks(name) ON UPDATE CASCADE;


-- ============================================================================
-- 2. RUBRIC CONFIGURATION & SCORE VALIDATION (Item 3 & Follow-up 1)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.event_rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  criteria jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id)
);

ALTER TABLE public.event_rubrics ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.event_rubrics TO authenticated;
GRANT ALL ON public.event_rubrics TO service_role;

-- RLS Policies for event_rubrics:
-- authenticated may SELECT
DROP POLICY IF EXISTS "event_rubrics_select" ON public.event_rubrics;
CREATE POLICY "event_rubrics_select" ON public.event_rubrics FOR SELECT TO authenticated
USING (true);

-- Only is_admin() may INSERT / UPDATE / DELETE
DROP POLICY IF EXISTS "event_rubrics_insert_admin" ON public.event_rubrics;
CREATE POLICY "event_rubrics_insert_admin" ON public.event_rubrics FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "event_rubrics_update_admin" ON public.event_rubrics;
CREATE POLICY "event_rubrics_update_admin" ON public.event_rubrics FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "event_rubrics_delete_admin" ON public.event_rubrics;
CREATE POLICY "event_rubrics_delete_admin" ON public.event_rubrics FOR DELETE TO authenticated
USING (public.is_admin());

-- Seed default rubric for active event(s)
INSERT INTO public.event_rubrics (event_id, criteria)
SELECT 
  id,
  '{
    "innovation": { "label": "Innovation & Creativity", "max": 25 },
    "technical": { "label": "Technical Complexity", "max": 25 },
    "impact": { "label": "Impact & Viability", "max": 25 },
    "design": { "label": "Design & UX", "max": 25 }
  }'::jsonb
FROM public.events
ON CONFLICT (event_id) DO NOTHING;

-- Rewrite compute_evaluation_score(): FAILS CLOSED if no rubric exists for the submission's event
CREATE OR REPLACE FUNCTION public.compute_evaluation_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_id uuid;
  v_rubric jsonb;
  v_key text;
  v_val text;
  v_numeric_val numeric;
  v_max_val numeric;
  v_sum numeric := 0;
BEGIN
  -- 1. Identify the event_id for this evaluation via submission -> team -> event
  SELECT t.event_id INTO v_event_id
  FROM public.submissions s
  JOIN public.teams t ON t.id = s.team_id
  WHERE s.id = NEW.submission_id;

  IF v_event_id IS NULL THEN
    RAISE EXCEPTION 'Cannot evaluate submission: associated event not found';
  END IF;

  -- 2. Fetch criteria for the event (FAIL CLOSED: reject write if no rubric row exists)
  SELECT criteria INTO v_rubric
  FROM public.event_rubrics
  WHERE event_id = v_event_id;

  IF v_rubric IS NULL THEN
    RAISE EXCEPTION 'No evaluation rubric configured for event % — evaluation write rejected', v_event_id;
  END IF;

  -- 3. If scores is null or empty, total_score is 0
  IF NEW.scores IS NULL OR NEW.scores = '{}'::jsonb THEN
    NEW.total_score := 0;
    RETURN NEW;
  END IF;

  -- 4. Validate each score criterion against the rubric
  FOR v_key IN SELECT jsonb_object_keys(NEW.scores) LOOP
    -- Key must exist in rubric
    IF NOT (v_rubric ? v_key) THEN
      RAISE EXCEPTION 'Unknown score criterion key: %', v_key;
    END IF;

    -- Type must be numeric (reject null, strings, booleans, nested objects)
    IF jsonb_typeof(NEW.scores -> v_key) <> 'number' THEN
      RAISE EXCEPTION 'Score value for criterion % must be a number', v_key;
    END IF;

    -- Criterion must have 'max' defined in the rubric
    IF (v_rubric -> v_key ->> 'max') IS NULL OR jsonb_typeof(v_rubric -> v_key -> 'max') <> 'number' THEN
      RAISE EXCEPTION 'Rubric criterion % has no maximum score configured', v_key;
    END IF;

    v_numeric_val := (NEW.scores ->> v_key)::numeric;
    v_max_val := (v_rubric -> v_key ->> 'max')::numeric;

    -- Range check
    IF v_numeric_val < 0 THEN
      RAISE EXCEPTION 'Score for criterion % cannot be negative: %', v_key, v_numeric_val;
    END IF;

    IF v_numeric_val > v_max_val THEN
      RAISE EXCEPTION 'Score for criterion % exceeds maximum allowed (%) : %', v_key, v_max_val, v_numeric_val;
    END IF;

    v_sum := v_sum + v_numeric_val;
  END LOOP;

  NEW.total_score := v_sum;
  RETURN NEW;
END;
$$;


-- ============================================================================
-- 3. SUBMISSIONS INSERT BYPASS & STATUS LOCK TRIGGER (Item 1)
-- ============================================================================

DROP POLICY IF EXISTS "submissions_insert" ON public.submissions;
CREATE POLICY "submissions_insert" ON public.submissions FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = submissions.team_id AND profile_id = auth.uid() AND status = 'accepted'
  )
  AND status = 'draft'
  AND submitted_at IS NULL
);

CREATE OR REPLACE FUNCTION public.protect_submission_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- INSERT handling
  IF TG_OP = 'INSERT' THEN
    IF (NEW.status <> 'draft' OR NEW.submitted_at IS NOT NULL) THEN
      IF NOT public.is_admin() AND current_setting('app.submitting_via_rpc', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'New submissions must start as draft with null submitted_at';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE handling
  IF (NEW.status IS NOT DISTINCT FROM OLD.status) AND (NEW.submitted_at IS NOT DISTINCT FROM OLD.submitted_at) THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_admin() AND current_setting('app.submitting_via_rpc', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Cannot modify submission status directly — use the submit endpoint';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_submission_status ON public.submissions;
CREATE TRIGGER tr_protect_submission_status
BEFORE INSERT OR UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.protect_submission_status();


-- ============================================================================
-- 4. EVALUATIONS INSERT BYPASS & STATUS LOCK TRIGGER (Item 2)
-- ============================================================================

DROP POLICY IF EXISTS "evaluations_insert" ON public.evaluations;
CREATE POLICY "evaluations_insert" ON public.evaluations FOR INSERT TO authenticated
WITH CHECK (
  judge_id = auth.uid()
  AND status = 'draft'
  AND EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.judge_assignments ja ON ja.track = s.track
    WHERE s.id = evaluations.submission_id AND ja.judge_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.protect_evaluation_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- INSERT handling
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'draft' THEN
      IF NOT public.is_admin() AND current_setting('app.evaluating_via_rpc', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'New evaluations must start as draft';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE handling
  IF (NEW.status IS NOT DISTINCT FROM OLD.status) THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_admin() AND current_setting('app.evaluating_via_rpc', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Cannot modify evaluation status directly — use the finalize endpoint';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_evaluation_status ON public.evaluations;
CREATE TRIGGER tr_protect_evaluation_status
BEFORE INSERT OR UPDATE ON public.evaluations
FOR EACH ROW
EXECUTE FUNCTION public.protect_evaluation_status();


-- ============================================================================
-- 5. RPC HARDENING: submit_project & finalize_evaluation (Item 4 & Follow-ups)
-- ============================================================================

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

  -- 6. Check event deadlines and window start
  SELECT 
    e.submission_deadline_at,
    COALESCE(e.registration_opens_at, e.created_at)
  INTO 
    v_deadline,
    v_submission_window_start
  FROM public.teams t
  JOIN public.events e ON t.event_id = e.id
  WHERE t.id = v_submission.team_id;

  IF v_submission_window_start IS NOT NULL AND now() < v_submission_window_start THEN
    RAISE EXCEPTION 'Submission window has not opened yet';
  END IF;

  IF v_deadline IS NOT NULL AND now() > v_deadline THEN
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


CREATE OR REPLACE FUNCTION public.finalize_evaluation(p_evaluation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_eval record;
  v_sub_status text;
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

  -- 4. Require submission to be in 'submitted' status
  SELECT s.status, t.event_id INTO v_sub_status, v_event_id
  FROM public.submissions s
  JOIN public.teams t ON t.id = s.team_id
  WHERE s.id = v_eval.submission_id;

  IF v_sub_status IS DISTINCT FROM 'submitted' THEN
    RAISE EXCEPTION 'Cannot finalize evaluation for submission that is not in submitted status';
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

  -- 6. Get judging window timestamps
  SELECT e.judging_starts_at, e.judging_ends_at
  INTO v_judging_starts_at, v_judging_ends_at
  FROM public.events e
  WHERE e.id = v_event_id;

  -- Enforce judging_starts_at if specified
  IF v_judging_starts_at IS NOT NULL AND now() < v_judging_starts_at THEN
    RAISE EXCEPTION 'Judging period has not started yet';
  END IF;

  -- Enforce judging_ends_at if specified
  IF v_judging_ends_at IS NOT NULL AND now() > v_judging_ends_at THEN
    RAISE EXCEPTION 'Judging window has closed';
  END IF;

  -- 7. Bypass status lock and finalize
  PERFORM set_config('app.evaluating_via_rpc', 'true', true);

  UPDATE public.evaluations
  SET status = 'final', updated_at = now()
  WHERE id = p_evaluation_id;
END;
$$;

-- Revoke execute from public/anon and grant to authenticated
REVOKE EXECUTE ON FUNCTION public.submit_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_project(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.finalize_evaluation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finalize_evaluation(uuid) TO authenticated;

COMMIT;
