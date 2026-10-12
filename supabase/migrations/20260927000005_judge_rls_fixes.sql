-- ============================================================================
-- HackIGNISIA — Judge RLS Access to Submissions & Files
-- ============================================================================

-- 1. Submissions access
-- Judges can SELECT submissions if they are assigned to the submission's track and status is 'submitted'
CREATE POLICY "submissions_select_judge" ON public.submissions FOR SELECT TO authenticated
USING (
  status = 'submitted' AND EXISTS (
    SELECT 1 FROM public.judge_assignments ja 
    WHERE ja.judge_id = auth.uid() AND ja.track = submissions.track
  )
);

-- 2. Submission Files access
-- Judges can SELECT submission_files for submissions they are assigned to
CREATE POLICY "submission_files_select_judge" ON public.submission_files FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.judge_assignments ja ON ja.track = s.track
    WHERE s.id = submission_files.submission_id 
      AND ja.judge_id = auth.uid()
      AND s.status = 'submitted'
  )
);

-- 3. Storage Bucket access
-- Judges can SELECT from the 'submissions' bucket if they have an assignment matching the submission's track.
-- The object path is team_id/filename. We must match the team_id.
CREATE POLICY "submissions_storage_select_judge" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'submissions' AND EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.judge_assignments ja ON ja.track = s.track
    WHERE s.team_id::text = (string_to_array(name, '/'))[1]
      AND ja.judge_id = auth.uid()
      AND s.status = 'submitted'
  )
);
