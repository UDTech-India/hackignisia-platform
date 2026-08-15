-- ============================================================================
-- HackIGNISIA — Initial Schema Migration (Day 2 of sprint plan)
-- Scope: profiles, events, teams, team_members + RLS
-- Deliberately excludes submissions/evaluations — those land in a later
-- migration (Day 11), matching the sprint plan's sequencing.
--
-- Apply with the Supabase CLI, not the dashboard SQL editor, so this stays
-- versioned and reusable for future events:
--   supabase migration new initial_schema   (then paste this in)
--   supabase db push                        (applies to your linked project)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ROLE ENUM
-- ----------------------------------------------------------------------------
-- Design decision: "Team Leader" from the SRS is modeled as a per-team
-- attribute (team_members.is_leader), NOT a global platform role. A person
-- is fundamentally a participant/mentor/judge/admin at the platform level;
-- being a team's leader is scoped to that one team. This avoids a messy
-- "what if they lead one team and are a plain member of another" case later.
CREATE TYPE platform_role AS ENUM ('participant', 'mentor', 'judge', 'admin');

-- ----------------------------------------------------------------------------
-- 2. PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          text NOT NULL DEFAULT '',
  email              text NOT NULL,
  mobile_number      text,
  college            text,
  course             text,
  year_of_study      text,
  city               text,
  linkedin_url       text,
  github_url         text,
  profile_photo_url  text,
  platform_role      platform_role NOT NULL DEFAULT 'participant',
  -- Registration fee is still unconfirmed (per Aman). Defaulting to
  -- 'not_required' means the free-registration path needs zero changes here;
  -- if a fee gets confirmed later, only new values get used, not a schema
  -- rewrite. See registrations/payments as a separate table if/when a real
  -- fee ships — this column is the MVP placeholder, not the final design.
  payment_status     text NOT NULL DEFAULT 'not_required'
                        CHECK (payment_status IN ('not_required', 'pending', 'paid')),
  profile_completed  boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Auto-create a profile row the moment someone signs up via Supabase Auth,
-- so the app never has to handle "authenticated but no profile exists yet".
CREATE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generic updated_at toucher, reused by every table below.
CREATE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Privilege-escalation guard: a normal user updating their own profile
-- (e.g. adding their LinkedIn URL) must never be able to also flip
-- platform_role to 'admin' in the same request. Only an existing admin can
-- change anyone's role. This is enforced here, not just in app code, because
-- app-code checks get skipped the first time someone calls the API directly.
CREATE FUNCTION prevent_role_self_escalation()
RETURNS trigger AS $$
BEGIN
  IF NEW.platform_role IS DISTINCT FROM OLD.platform_role THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND platform_role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Only an admin can change platform_role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_self_escalation();

-- ----------------------------------------------------------------------------
-- 3. EVENTS  (the table that makes this platform reusable, not IGNISIA-only)
-- ----------------------------------------------------------------------------
CREATE TABLE events (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     text NOT NULL UNIQUE,
  name                     text NOT NULL,
  description              text,
  is_active                boolean NOT NULL DEFAULT true,
  -- All nullable on purpose — Aman hasn't confirmed the timeline yet.
  -- Registration/team features don't need these populated to work.
  registration_opens_at    timestamptz,
  registration_closes_at   timestamptz,
  submission_deadline_at   timestamptz,
  judging_starts_at        timestamptz,
  judging_ends_at          timestamptz,
  results_at               timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now()
);

INSERT INTO events (slug, name, is_active)
VALUES ('ignisia-2026', 'IGNISIA 2026', true);

-- ----------------------------------------------------------------------------
-- 4. TEAMS
-- ----------------------------------------------------------------------------
-- 6-character team code generator — excludes visually ambiguous characters
-- (0/O, 1/I) since participants will be typing these codes by hand to join.
CREATE FUNCTION generate_team_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  already_used boolean;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM teams WHERE team_code = code) INTO already_used;
    EXIT WHEN NOT already_used;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE teams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name         text NOT NULL,
  team_code    text NOT NULL UNIQUE DEFAULT generate_team_code(),
  max_members  int NOT NULL DEFAULT 5 CHECK (max_members BETWEEN 1 AND 10),
  created_by   uuid NOT NULL REFERENCES profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_teams_event_id ON teams(event_id);

-- ----------------------------------------------------------------------------
-- 5. TEAM MEMBERS
-- ----------------------------------------------------------------------------
CREATE TYPE team_member_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE team_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_leader   boolean NOT NULL DEFAULT false,
  status      team_member_status NOT NULL DEFAULT 'accepted',
  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, profile_id)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_profile_id ON team_members(profile_id);

-- Enforce max_members at the database level, not just in the UI — a direct
-- API call should not be able to bypass the team-size cap either.
CREATE FUNCTION enforce_team_max_members()
RETURNS trigger AS $$
DECLARE
  current_count int;
  team_max int;
BEGIN
  IF NEW.status = 'accepted' THEN
    SELECT max_members INTO team_max FROM teams WHERE id = NEW.team_id;
    SELECT COUNT(*) INTO current_count
      FROM team_members WHERE team_id = NEW.team_id AND status = 'accepted';
    IF current_count >= team_max THEN
      RAISE EXCEPTION 'Team % is already at its % member limit', NEW.team_id, team_max;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_team_max_members
  BEFORE INSERT ON team_members
  FOR EACH ROW EXECUTE FUNCTION enforce_team_max_members();

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY — deny-by-default, then explicit allows only
-- ----------------------------------------------------------------------------
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams         ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members  ENABLE ROW LEVEL SECURITY;

-- profiles: read your own row, or any row belonging to someone on a team
-- you're also on (needed for the Team Dashboard showing teammates' names).
CREATE POLICY "profiles_select_own_or_teammate"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR id IN (
      SELECT tm2.profile_id
      FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.profile_id = auth.uid()
    )
  );

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- events: publicly readable (the public site needs this with no login),
-- writes are intentionally left with NO policy — meaning blocked entirely
-- until the admin migration adds an explicit admin-only write policy.
CREATE POLICY "events_select_public"
  ON events FOR SELECT
  USING (is_active = true);

-- teams: only visible to / editable by your own team, editable only by
-- whoever is flagged is_leader for that team.
CREATE POLICY "teams_select_member"
  ON teams FOR SELECT
  USING (id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid()));

CREATE POLICY "teams_insert_authenticated"
  ON teams FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "teams_update_leader"
  ON teams FOR UPDATE
  USING (id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid() AND is_leader = true))
  WITH CHECK (id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid() AND is_leader = true));

-- team_members: see/manage rows only for teams you belong to.
CREATE POLICY "team_members_select_teammates"
  ON team_members FOR SELECT
  USING (team_id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid()));

CREATE POLICY "team_members_insert_self"
  ON team_members FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "team_members_update_leader_or_self"
  ON team_members FOR UPDATE
  USING (
    profile_id = auth.uid()
    OR team_id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid() AND is_leader = true)
  );

CREATE POLICY "team_members_delete_leader_or_self"
  ON team_members FOR DELETE
  USING (
    profile_id = auth.uid()
    OR team_id IN (SELECT team_id FROM team_members WHERE profile_id = auth.uid() AND is_leader = true)
  );

-- ============================================================================
-- End of Day 2 migration.
-- Next migration (Day 11): submissions table, 1:1 with teams, RLS scoped to
-- the owning team only. Evaluations table follows later still, once the
-- Judge Portal work actually starts (blocked on Aman's event-timeline date).
-- ============================================================================