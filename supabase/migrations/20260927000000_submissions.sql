-- ============================================================================
-- HackIGNISIA — Submissions Schema & Logic (Steps 1-4)
-- ============================================================================

-- 1. Create public.submissions
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title text,
  tagline text,
  problem_statement text,
  target_users text,
  solution text,
  innovation text,
  tech_stack text,
  github_url text CHECK (github_url IS NULL OR github_url ~ '^https?://'),
  demo_url text CHECK (demo_url IS NULL OR demo_url ~ '^https?://'),
  video_url text CHECK (video_url IS NULL OR video_url ~ '^https?://'),
  track text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted')),
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id)
);

-- 2. Create public.submission_files
CREATE TABLE public.submission_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_type text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Storage bucket and policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Must be team member and path must start with team_id/
CREATE POLICY "submissions_storage_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'submissions' AND EXISTS (
  SELECT 1 FROM public.team_members
  WHERE profile_id = auth.uid() AND status = 'accepted'
  AND team_id::text = (string_to_array(name, '/'))[1]
));

CREATE POLICY "submissions_storage_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'submissions' AND EXISTS (
  SELECT 1 FROM public.team_members
  WHERE profile_id = auth.uid() AND status = 'accepted'
  AND team_id::text = (string_to_array(name, '/'))[1]
));

CREATE POLICY "submissions_storage_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'submissions' AND EXISTS (
  SELECT 1 FROM public.team_members
  WHERE profile_id = auth.uid() AND status = 'accepted'
  AND team_id::text = (string_to_array(name, '/'))[1]
));

-- 4. RLS and Deadline Logic
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;

-- Submissions Select
CREATE POLICY "submissions_select" ON public.submissions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = submissions.team_id AND profile_id = auth.uid() AND status = 'accepted'
  ) OR public.is_admin()
);

-- Submissions Insert
CREATE POLICY "submissions_insert" ON public.submissions FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = submissions.team_id AND profile_id = auth.uid() AND status = 'accepted'
  )
);

-- Submissions Update: Team members can update drafts. Admins can update anything.
CREATE POLICY "submissions_update" ON public.submissions FOR UPDATE TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = submissions.team_id AND profile_id = auth.uid() AND status = 'accepted'
  ) AND status = 'draft') OR public.is_admin()
);

-- Admin bypass policies for full control
CREATE POLICY "submissions_admin_all" ON public.submissions FOR ALL TO authenticated
USING (public.is_admin());

-- Submission Files RLS (similar logic)
CREATE POLICY "submission_files_select" ON public.submission_files FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.team_members tm ON tm.team_id = s.team_id
    WHERE s.id = submission_files.submission_id AND tm.profile_id = auth.uid() AND tm.status = 'accepted'
  ) OR public.is_admin()
);

CREATE POLICY "submission_files_insert" ON public.submission_files FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.team_members tm ON tm.team_id = s.team_id
    WHERE s.id = submission_files.submission_id AND tm.profile_id = auth.uid() AND tm.status = 'accepted'
  )
);

CREATE POLICY "submission_files_delete" ON public.submission_files FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.team_members tm ON tm.team_id = s.team_id
    WHERE s.id = submission_files.submission_id AND tm.profile_id = auth.uid() AND tm.status = 'accepted'
  ) OR public.is_admin()
);


-- TRIGGER: Prevent non-RPC direct status modification
CREATE OR REPLACE FUNCTION public.protect_submission_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If content was modified but status/submitted_at were unchanged, allow it.
  IF (NEW.status IS NOT DISTINCT FROM OLD.status) AND (NEW.submitted_at IS NOT DISTINCT FROM OLD.submitted_at) THEN
    RETURN NEW;
  END IF;

  -- If status or submitted_at IS changing, check authorization
  IF NOT public.is_admin() AND current_setting('app.submitting_via_rpc', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Cannot modify submission status directly — use the submit endpoint';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_submission_status ON public.submissions;
CREATE TRIGGER tr_protect_submission_status
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.protect_submission_status();


-- RPC: Submit Project
CREATE OR REPLACE FUNCTION public.submit_project(p_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_team_id uuid;
  v_event_id uuid;
  v_deadline timestamptz;
BEGIN
  -- 1. Get team_id for the submission
  SELECT team_id INTO v_team_id
  FROM public.submissions WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- 2. Validate team leadership
  IF NOT public.is_team_leader(v_team_id) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only the team leader can submit the project';
  END IF;

  -- 3. Check submission deadline
  SELECT e.submission_deadline_at INTO v_deadline
  FROM public.teams t
  JOIN public.events e ON t.event_id = e.id
  WHERE t.id = v_team_id;

  IF v_deadline IS NOT NULL AND now() > v_deadline THEN
    RAISE EXCEPTION 'Submission deadline has passed';
  END IF;

  -- 4. Flag current session to bypass the protection trigger
  PERFORM set_config('app.submitting_via_rpc', 'true', true);

  -- 5. Execute the status update
  UPDATE public.submissions
  SET status = 'submitted', submitted_at = now()
  WHERE id = p_submission_id;
END;
$$;
