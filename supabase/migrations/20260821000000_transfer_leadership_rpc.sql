-- ============================================================================
-- HackIGNISIA — Migration: Transfer Team Leadership RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.transfer_team_leadership(p_team_id uuid, p_new_leader_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verify caller is the current team leader or an admin
  IF NOT (public.is_team_leader(p_team_id) OR public.is_admin()) THEN
    RAISE EXCEPTION 'Only the team leader or an admin can transfer leadership.';
  END IF;

  -- Ensure the new leader is an accepted member of the team
  IF NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND profile_id = p_new_leader_id AND status = 'accepted'
  ) THEN
    RAISE EXCEPTION 'New leader must be an accepted member of the team.';
  END IF;

  -- First, demote the current leader(s) to avoid unique index violation
  UPDATE public.team_members
  SET is_leader = false
  WHERE team_id = p_team_id AND is_leader = true;

  -- Second, promote the new leader
  UPDATE public.team_members
  SET is_leader = true
  WHERE team_id = p_team_id AND profile_id = p_new_leader_id;

END;
$$;

GRANT EXECUTE ON FUNCTION public.transfer_team_leadership(uuid, uuid) TO authenticated;
