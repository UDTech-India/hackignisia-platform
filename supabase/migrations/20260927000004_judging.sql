-- ============================================================================
-- HackIGNISIA — Judging Schema & Logic (Steps 1-2)
-- ============================================================================

-- 1. Create public.judge_assignments
CREATE TABLE public.judge_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  track text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (judge_id, track)
);

ALTER TABLE public.judge_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "judge_assignments_select" ON public.judge_assignments FOR SELECT TO authenticated
USING (judge_id = auth.uid() OR public.is_admin());

CREATE POLICY "judge_assignments_admin_all" ON public.judge_assignments FOR ALL TO authenticated
USING (public.is_admin());


-- 2. Create public.evaluations
CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scores jsonb NOT NULL DEFAULT '{}',
  total_score numeric,
  comments text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (submission_id, judge_id)
);

-- Trigger to compute total_score BEFORE INSERT OR UPDATE
CREATE OR REPLACE FUNCTION public.compute_evaluation_score()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  k text;
  v text;
  sum numeric := 0;
BEGIN
  FOR k, v IN SELECT key, value FROM jsonb_each_text(NEW.scores) LOOP
    BEGIN
      sum := sum + v::numeric;
    EXCEPTION WHEN invalid_text_representation THEN
      NULL; -- Ignore non-numeric values
    END;
  END LOOP;
  NEW.total_score := sum;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_compute_evaluation_score
BEFORE INSERT OR UPDATE ON public.evaluations
FOR EACH ROW
EXECUTE FUNCTION public.compute_evaluation_score();


-- 3. RLS for evaluations
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- evaluations SELECT: blind scoring
CREATE POLICY "evaluations_select" ON public.evaluations FOR SELECT TO authenticated
USING (
  judge_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.judge_assignments ja ON ja.track = s.track
    WHERE s.id = evaluations.submission_id AND ja.judge_id = auth.uid()
  ) OR public.is_admin()
);

-- evaluations INSERT
CREATE POLICY "evaluations_insert" ON public.evaluations FOR INSERT TO authenticated
WITH CHECK (
  judge_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.judge_assignments ja ON ja.track = s.track
    WHERE s.id = evaluations.submission_id AND ja.judge_id = auth.uid()
  )
);

-- evaluations UPDATE
CREATE POLICY "evaluations_update" ON public.evaluations FOR UPDATE TO authenticated
USING (
  judge_id = auth.uid() AND status = 'draft' AND EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.judge_assignments ja ON ja.track = s.track
    WHERE s.id = evaluations.submission_id AND ja.judge_id = auth.uid()
  ) OR public.is_admin()
);

CREATE POLICY "evaluations_admin_all" ON public.evaluations FOR ALL TO authenticated
USING (public.is_admin());


-- 4. Status protection trigger
CREATE OR REPLACE FUNCTION public.protect_evaluation_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (NEW.status IS NOT DISTINCT FROM OLD.status) THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_admin() AND current_setting('app.evaluating_via_rpc', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Cannot modify evaluation status directly — use the finalize endpoint';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_protect_evaluation_status
BEFORE UPDATE ON public.evaluations
FOR EACH ROW
EXECUTE FUNCTION public.protect_evaluation_status();


-- 5. RPC finalize_evaluation
CREATE OR REPLACE FUNCTION public.finalize_evaluation(p_evaluation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_judge_id uuid;
  v_submission_id uuid;
  v_judging_ends_at timestamptz;
BEGIN
  -- Get evaluation details
  SELECT judge_id, submission_id INTO v_judge_id, v_submission_id
  FROM public.evaluations WHERE id = p_evaluation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Evaluation not found';
  END IF;

  -- Verify ownership
  IF v_judge_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'You do not have permission to finalize this evaluation';
  END IF;

  -- Get judging deadline
  SELECT e.judging_ends_at INTO v_judging_ends_at
  FROM public.submissions s
  JOIN public.teams t ON t.id = s.team_id
  JOIN public.events e ON e.id = t.event_id
  WHERE s.id = v_submission_id;

  IF v_judging_ends_at IS NOT NULL AND now() > v_judging_ends_at THEN
    RAISE EXCEPTION 'Judging window has closed';
  END IF;

  PERFORM set_config('app.evaluating_via_rpc', 'true', true);

  UPDATE public.evaluations
  SET status = 'final', updated_at = now()
  WHERE id = p_evaluation_id;
END;
$$;
