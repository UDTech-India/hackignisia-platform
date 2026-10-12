-- ============================================================================
-- HackIGNISIA — Fix submission_files RLS
-- ============================================================================

-- Drop the previous policies
DROP POLICY IF EXISTS "submission_files_insert" ON public.submission_files;
DROP POLICY IF EXISTS "submission_files_delete" ON public.submission_files;

-- Recreate INSERT policy: must be team member AND submission status must be 'draft'
CREATE POLICY "submission_files_insert" ON public.submission_files FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.team_members tm ON tm.team_id = s.team_id
    WHERE s.id = submission_files.submission_id 
      AND tm.profile_id = auth.uid() 
      AND tm.status = 'accepted'
      AND s.status = 'draft'
  )
);

-- Recreate DELETE policy: must be team member AND submission status must be 'draft', OR be admin
CREATE POLICY "submission_files_delete" ON public.submission_files FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.team_members tm ON tm.team_id = s.team_id
    WHERE s.id = submission_files.submission_id 
      AND tm.profile_id = auth.uid() 
      AND tm.status = 'accepted'
      AND s.status = 'draft'
  ) OR public.is_admin()
);
