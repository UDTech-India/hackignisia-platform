-- ============================================================================
-- HackIGNISIA — Migration 6: Table-level GRANT statements
--
-- RLS policies only take effect after Postgres's base table-level privilege
-- check passes. These GRANTs existed in an earlier draft but were left out
-- of Migration 2 on the (incorrect) assumption that Supabase's default
-- "authenticated" role already had them — confirmed missing by a live
-- "permission denied for table teams" error (Postgres code 42501).
-- ============================================================================

GRANT SELECT, INSERT, UPDATE
ON public.profiles
TO authenticated;

GRANT SELECT
ON public.events
TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE
ON public.events
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.teams
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.team_members
TO authenticated;
