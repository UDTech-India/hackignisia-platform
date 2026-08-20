-- ============================================================================
-- HackIGNISIA — Migration 2: Team Leadership Automation, RLS Helper
-- Functions, Admin Policies, and a Concurrency Fix
--
-- Builds on Migration 1 (20260813000000_initial_schema.sql). Written to be
-- safely applied against a database where profiles/events/teams/team_members
-- already exist — does not redeclare any table, type, or extension.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUTO-ADD TEAM CREATOR AS LEADER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_team_creator_as_leader()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.team_members (team_id, profile_id, is_leader, status)
  VALUES (NEW.id, NEW.created_by, true, 'accepted');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_add_team_creator_as_leader ON public.teams;
CREATE TRIGGER trg_add_team_creator_as_leader
AFTER INSERT ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.add_team_creator_as_leader();

-- ----------------------------------------------------------------------------
-- 2. ONE ACCEPTED LEADER PER TEAM, ENFORCED AT THE DATABASE LEVEL
-- ----------------------------------------------------------------------------
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_leader_must_be_accepted;
ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_leader_must_be_accepted
  CHECK (is_leader = false OR status = 'accepted');

DROP INDEX IF EXISTS idx_one_leader_per_team;
CREATE UNIQUE INDEX idx_one_leader_per_team
ON public.team_members(team_id)
WHERE (is_leader = true AND status = 'accepted');

-- ----------------------------------------------------------------------------
-- 3. RLS HELPER FUNCTIONS — SECURITY DEFINER avoids recursion inside policies
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_team_member(requested_team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = requested_team_id
      AND tm.profile_id = auth.uid() AND tm.status = 'accepted'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_leader(requested_team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = requested_team_id
      AND tm.profile_id = auth.uid() AND tm.is_leader = true AND tm.status = 'accepted'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.platform_role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teammate(requested_profile_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm1
    INNER JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.profile_id = auth.uid() AND tm1.status = 'accepted'
      AND tm2.profile_id = requested_profile_id AND tm2.status = 'accepted'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_team_leader(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_teammate(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

GRANT EXECUTE ON FUNCTION public.is_team_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_leader(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_teammate(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. REPLACE EXISTING POLICIES TO USE THE HELPER FUNCTIONS INSTEAD OF INLINE
--    SUBQUERIES (DROP + CREATE is safe/idempotent — same pattern as before)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_teammate" ON public.profiles;
CREATE POLICY "profiles_select_own_or_teammate" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR (SELECT public.is_teammate(id)));

DROP POLICY IF EXISTS "teams_select_member" ON public.teams;
CREATE POLICY "teams_select_member" ON public.teams
FOR SELECT TO authenticated
USING ((SELECT public.is_team_member(id)));

DROP POLICY IF EXISTS "teams_update_leader" ON public.teams;
CREATE POLICY "teams_update_leader" ON public.teams
FOR UPDATE TO authenticated
USING ((SELECT public.is_team_leader(id)))
WITH CHECK ((SELECT public.is_team_leader(id)));

DROP POLICY IF EXISTS "teams_delete_leader" ON public.teams;
CREATE POLICY "teams_delete_leader" ON public.teams
FOR DELETE TO authenticated
USING ((SELECT public.is_team_leader(id)));

DROP POLICY IF EXISTS "team_members_select_teammates" ON public.team_members;
CREATE POLICY "team_members_select_teammates" ON public.team_members
FOR SELECT TO authenticated
USING ((SELECT public.is_team_member(team_id)));

DROP POLICY IF EXISTS "team_members_update_leader_or_self" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update_leader" ON public.team_members;
CREATE POLICY "team_members_update_leader" ON public.team_members
FOR UPDATE TO authenticated
USING ((SELECT public.is_team_leader(team_id)))
WITH CHECK ((SELECT public.is_team_leader(team_id)));

DROP POLICY IF EXISTS "team_members_delete_leader_or_self" ON public.team_members;
CREATE POLICY "team_members_delete_leader_or_self" ON public.team_members
FOR DELETE TO authenticated
USING (profile_id = auth.uid() OR (SELECT public.is_team_leader(team_id)));

-- ----------------------------------------------------------------------------
-- 5. NEW: ADMIN POLICIES — previously missing; admins had no bypass at all
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
CREATE POLICY "profiles_admin_select" ON public.profiles
FOR SELECT TO authenticated USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
FOR UPDATE TO authenticated
USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "events_admin_insert" ON public.events;
CREATE POLICY "events_admin_insert" ON public.events
FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "events_admin_update" ON public.events;
CREATE POLICY "events_admin_update" ON public.events
FOR UPDATE TO authenticated
USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "events_admin_delete" ON public.events;
CREATE POLICY "events_admin_delete" ON public.events
FOR DELETE TO authenticated USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "teams_admin_select" ON public.teams;
CREATE POLICY "teams_admin_select" ON public.teams
FOR SELECT TO authenticated USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "team_members_admin_select" ON public.team_members;
CREATE POLICY "team_members_admin_select" ON public.team_members
FOR SELECT TO authenticated USING ((SELECT public.is_admin()));

-- ----------------------------------------------------------------------------
-- 6. CONCURRENCY FIX: row-lock the team + also check pending->accepted moves,
--    not just brand-new inserts (the original only covered INSERT)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_team_max_members()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_count integer;
  team_max integer;
BEGIN
  IF NEW.status = 'accepted' AND (TG_OP = 'INSERT' OR OLD.status <> 'accepted') THEN
    SELECT max_members INTO team_max FROM public.teams WHERE id = NEW.team_id FOR UPDATE;
    IF team_max IS NULL THEN
      RAISE EXCEPTION 'Team does not exist';
    END IF;
    SELECT COUNT(*) INTO current_count FROM public.team_members
      WHERE team_id = NEW.team_id AND status = 'accepted';
    IF current_count >= team_max THEN
      RAISE EXCEPTION 'Team has reached its maximum member limit of %', team_max;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_team_max_members ON public.team_members;
CREATE TRIGGER trg_enforce_team_max_members
BEFORE INSERT OR UPDATE OF status ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.enforce_team_max_members();

-- ============================================================================
-- End of Migration 2.
-- ============================================================================
