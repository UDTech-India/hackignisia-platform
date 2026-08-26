-- ============================================================================
-- HackIGNISIA — Migration 3: Fix Missing RLS Policies
--
-- This migration adds the missing INSERT and UPDATE policies that were
-- preventing users from registering their details and forming teams.
-- ============================================================================

-- 1. Allow users to update their own profile during registration
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 2. Allow users to create teams
DROP POLICY IF EXISTS "teams_insert_own" ON public.teams;
CREATE POLICY "teams_insert_own" ON public.teams
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- 3. Allow users to search for teams by join_code (or generally view teams)
-- The previous "teams_select_member" restricted them to ONLY teams they were in.
-- We must broaden this so they can actually find a team to join.
DROP POLICY IF EXISTS "teams_select_all_authenticated" ON public.teams;
CREATE POLICY "teams_select_all_authenticated" ON public.teams
FOR SELECT TO authenticated
USING (true);

-- 4. Allow users to insert themselves into team_members to request to join
DROP POLICY IF EXISTS "team_members_insert_self" ON public.team_members;
CREATE POLICY "team_members_insert_self" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid());

-- 5. Allow users to see their OWN team_members records (so they can see pending requests)
-- The previous "team_members_select_teammates" required them to already be an accepted member.
DROP POLICY IF EXISTS "team_members_select_own" ON public.team_members;
CREATE POLICY "team_members_select_own" ON public.team_members
FOR SELECT TO authenticated
USING (profile_id = auth.uid());
