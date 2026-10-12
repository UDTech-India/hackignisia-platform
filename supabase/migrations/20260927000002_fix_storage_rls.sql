-- ============================================================================
-- HackIGNISIA — Fix Storage RLS to enforce status='draft'
-- ============================================================================

DROP POLICY IF EXISTS "submissions_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "submissions_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "submissions_storage_delete" ON storage.objects;

-- INSERT policy
CREATE POLICY "submissions_storage_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'submissions' AND EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.submissions s ON s.team_id = tm.team_id
    WHERE tm.profile_id = auth.uid() 
      AND tm.status = 'accepted'
      AND tm.team_id::text = (string_to_array(name, '/'))[1]
      AND s.status = 'draft'
  )
);

-- UPDATE policy
CREATE POLICY "submissions_storage_update" ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'submissions' AND EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.submissions s ON s.team_id = tm.team_id
    WHERE tm.profile_id = auth.uid() 
      AND tm.status = 'accepted'
      AND tm.team_id::text = (string_to_array(name, '/'))[1]
      AND s.status = 'draft'
  )
);

-- DELETE policy (Admin bypass included)
CREATE POLICY "submissions_storage_delete" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'submissions' AND (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.submissions s ON s.team_id = tm.team_id
      WHERE tm.profile_id = auth.uid() 
        AND tm.status = 'accepted'
        AND tm.team_id::text = (string_to_array(name, '/'))[1]
        AND s.status = 'draft'
    ) OR public.is_admin()
  )
);
