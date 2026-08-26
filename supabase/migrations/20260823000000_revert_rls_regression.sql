-- ============================================================================
-- HackIGNISIA — Migration 5: Revert security regression from an unauthorized
-- migration (20260822000000_fix_all_rls.sql)
--
-- That migration reintroduced the exact team_members self-accept bypass
-- Migration 3 closed, and made every team (including team_code) readable by
-- every authenticated user, defeating the purpose of codes as a join secret.
-- ============================================================================

-- 1. Restore pending-only self-join.
DROP POLICY IF EXISTS "team_members_insert_self" ON public.team_members;
CREATE POLICY "team_members_insert_self" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (
  profile_id = auth.uid()
  AND status = 'pending'
);

-- 2. Remove the "every team visible to everyone" policy — this exposed
-- every team's team_code to every user, not just team names.
DROP POLICY IF EXISTS "teams_select_all_authenticated" ON public.teams;

-- 3. The actual correct way to support "join by code": a narrow function
-- that returns only the ONE team matching a code the caller already knows,
-- without exposing the rest of the table.
CREATE OR REPLACE FUNCTION public.get_team_by_code(p_team_code text)
RETURNS TABLE (id uuid, name text, event_id uuid, max_members integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.id, t.name, t.event_id, t.max_members
  FROM public.teams t
  WHERE t.team_code = p_team_code;
$$;

REVOKE EXECUTE ON FUNCTION public.get_team_by_code(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_team_by_code(text) TO authenticated;

-- Note: team_members_select_own (letting a user see their own pending
-- requests) was a legitimate addition from that migration — left as is,
-- no change needed.
