-- ============================================================================
-- HackIGNISIA — Migration 3: Enforce pending-only self-join
--
-- Closes a gap: the original team_members INSERT policy only checked
-- profile_id = auth.uid(), so a user could insert themselves directly with
-- status = 'accepted', bypassing the leader-approval workflow entirely.
--
-- Does not affect the add_team_creator_as_leader trigger — that runs as
-- SECURITY DEFINER, which bypasses RLS, so the creator-becomes-leader path
-- is unchanged.
-- ============================================================================

DROP POLICY IF EXISTS "team_members_insert_self" ON public.team_members;

CREATE POLICY "team_members_insert_self" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (
  profile_id = auth.uid()
  AND status = 'pending'
);
