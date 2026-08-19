-- ============================================================================
-- HackIGNISIA Platform
-- Initial Database Schema
--
-- Includes:
--   1. Platform roles
--   2. Profiles
--   3. Events
--   4. Teams
--   5. Team members
--   6. Authentication profile trigger
--   7. Team management functions
--   8. RLS
--   9. Security helpers
--
-- Excludes:
--   submissions
--   evaluations
--   judging
--   payments
--
-- Those will be added in later migrations.
-- ============================================================================


-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================================
-- 1. ENUMS
-- ============================================================================

CREATE TYPE public.platform_role AS ENUM (
  'participant',
  'mentor',
  'judge',
  'admin'
);


CREATE TYPE public.team_member_status AS ENUM (
  'pending',
  'accepted',
  'rejected'
);


-- ============================================================================
-- 2. PROFILES
-- ============================================================================

CREATE TABLE public.profiles (

  id uuid PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  full_name text NOT NULL DEFAULT '',

  email text NOT NULL,

  mobile_number text,

  college text,

  course text,

  year_of_study text,

  city text,

  linkedin_url text,

  github_url text,

  profile_photo_url text,

  platform_role public.platform_role
    NOT NULL DEFAULT 'participant',

  payment_status text
    NOT NULL DEFAULT 'not_required'
    CHECK (
      payment_status IN (
        'not_required',
        'pending',
        'paid'
      )
    ),

  profile_completed boolean
    NOT NULL DEFAULT false,

  created_at timestamptz
    NOT NULL DEFAULT now(),

  updated_at timestamptz
    NOT NULL DEFAULT now()
);


-- ============================================================================
-- 3. AUTO CREATE PROFILE AFTER AUTH SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN

  INSERT INTO public.profiles (
    id,
    full_name,
    email
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      ''
    ),
    COALESCE(
      NEW.email,
      ''
    )
  );

  RETURN NEW;

END;
$$;


DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;


CREATE TRIGGER on_auth_user_created

AFTER INSERT ON auth.users

FOR EACH ROW

EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 4. UPDATED_AT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN

  NEW.updated_at = now();

  RETURN NEW;

END;
$$;


DROP TRIGGER IF EXISTS trg_profiles_updated_at
ON public.profiles;


CREATE TRIGGER trg_profiles_updated_at

BEFORE UPDATE ON public.profiles

FOR EACH ROW

EXECUTE FUNCTION public.set_updated_at();


-- ============================================================================
-- 5. PREVENT ROLE SELF ESCALATION
--
-- Normal participant:
--   Can update own profile
--   Cannot change participant -> admin
--
-- Admin:
--   Can change roles
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN

  IF NEW.platform_role IS DISTINCT FROM OLD.platform_role THEN

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.platform_role = 'admin'
    ) THEN

      RAISE EXCEPTION
        'Only an admin can change platform_role';

    END IF;

  END IF;

  RETURN NEW;

END;
$$;


DROP TRIGGER IF EXISTS trg_prevent_role_escalation
ON public.profiles;


CREATE TRIGGER trg_prevent_role_escalation

BEFORE UPDATE ON public.profiles

FOR EACH ROW

EXECUTE FUNCTION public.prevent_role_self_escalation();


-- ============================================================================
-- 6. EVENTS
-- ============================================================================

CREATE TABLE public.events (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  slug text NOT NULL UNIQUE,

  name text NOT NULL,

  description text,

  is_active boolean
    NOT NULL DEFAULT true,

  registration_opens_at timestamptz,

  registration_closes_at timestamptz,

  submission_deadline_at timestamptz,

  judging_starts_at timestamptz,

  judging_ends_at timestamptz,

  results_at timestamptz,

  created_at timestamptz
    NOT NULL DEFAULT now()
);


-- ============================================================================
-- 7. DEFAULT EVENT
-- ============================================================================

INSERT INTO public.events (
  slug,
  name,
  description,
  is_active
)

VALUES (
  'ignisia-2026',
  'IGNISIA 2026',
  'IGNISIA 2026 Hackathon',
  true
)

ON CONFLICT (slug)
DO NOTHING;


-- ============================================================================
-- 8. TEAM CODE GENERATOR
--
-- Excludes:
--   0
--   O
--   1
--   I
--
-- Example:
--   7KPM4X
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_team_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE

  chars text :=
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  code text;

  code_exists boolean;

BEGIN

  LOOP

    code := '';

    FOR i IN 1..6 LOOP

      code :=
        code ||
        substr(
          chars,
          floor(
            random() * length(chars) + 1
          )::integer,
          1
        );

    END LOOP;


    SELECT EXISTS (
      SELECT 1
      FROM public.teams
      WHERE team_code = code
    )
    INTO code_exists;


    EXIT WHEN NOT code_exists;

  END LOOP;


  RETURN code;

END;
$$;


-- ============================================================================
-- 9. TEAMS
-- ============================================================================

CREATE TABLE public.teams (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  event_id uuid NOT NULL
    REFERENCES public.events(id)
    ON DELETE CASCADE,

  name text NOT NULL,

  team_code text NOT NULL UNIQUE
    DEFAULT public.generate_team_code(),

  max_members integer NOT NULL DEFAULT 5

    CHECK (
      max_members BETWEEN 1 AND 10
    ),

  created_by uuid NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE RESTRICT,

  created_at timestamptz
    NOT NULL DEFAULT now(),

  updated_at timestamptz
    NOT NULL DEFAULT now()
);


CREATE INDEX idx_teams_event_id
ON public.teams(event_id);


CREATE INDEX idx_teams_created_by
ON public.teams(created_by);


CREATE INDEX idx_teams_team_code
ON public.teams(team_code);


DROP TRIGGER IF EXISTS trg_teams_updated_at
ON public.teams;


CREATE TRIGGER trg_teams_updated_at

BEFORE UPDATE ON public.teams

FOR EACH ROW

EXECUTE FUNCTION public.set_updated_at();


-- ============================================================================
-- 10. TEAM MEMBERS
-- ============================================================================

CREATE TABLE public.team_members (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  team_id uuid NOT NULL
    REFERENCES public.teams(id)
    ON DELETE CASCADE,

  profile_id uuid NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  is_leader boolean
    NOT NULL DEFAULT false,

  status public.team_member_status
    NOT NULL DEFAULT 'accepted',

  joined_at timestamptz
    NOT NULL DEFAULT now(),

  UNIQUE (
    team_id,
    profile_id
  ),

  -- A pending/rejected member cannot be leader.
  CHECK (
    is_leader = false
    OR status = 'accepted'
  )
);


CREATE INDEX idx_team_members_team_id
ON public.team_members(team_id);


CREATE INDEX idx_team_members_profile_id
ON public.team_members(profile_id);


CREATE INDEX idx_team_members_status
ON public.team_members(status);


-- ============================================================================
-- 11. ONE LEADER PER TEAM
-- ============================================================================

CREATE UNIQUE INDEX idx_one_leader_per_team

ON public.team_members(team_id)

WHERE (
  is_leader = true
  AND status = 'accepted'
);


-- ============================================================================
-- 12. HELPER:
--     IS CURRENT USER MEMBER OF TEAM?
--
-- SECURITY DEFINER avoids RLS recursion.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_team_member(
  requested_team_id uuid
)

RETURNS boolean

LANGUAGE sql

STABLE

SECURITY DEFINER

SET search_path = ''
AS $$

  SELECT EXISTS (

    SELECT 1

    FROM public.team_members tm

    WHERE tm.team_id = requested_team_id

      AND tm.profile_id = auth.uid()

      AND tm.status = 'accepted'

  );

$$;


-- ============================================================================
-- 13. HELPER:
--     IS CURRENT USER TEAM LEADER?
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_team_leader(
  requested_team_id uuid
)

RETURNS boolean

LANGUAGE sql

STABLE

SECURITY DEFINER

SET search_path = ''
AS $$

  SELECT EXISTS (

    SELECT 1

    FROM public.team_members tm

    WHERE tm.team_id = requested_team_id

      AND tm.profile_id = auth.uid()

      AND tm.is_leader = true

      AND tm.status = 'accepted'

  );

$$;


-- ============================================================================
-- 14. HELPER:
--     IS CURRENT USER ADMIN?
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()

RETURNS boolean

LANGUAGE sql

STABLE

SECURITY DEFINER

SET search_path = ''
AS $$

  SELECT EXISTS (

    SELECT 1

    FROM public.profiles p

    WHERE p.id = auth.uid()

      AND p.platform_role = 'admin'

  );

$$;


-- ============================================================================
-- 15. HELPER:
--     IS REQUESTED PROFILE A TEAMMATE OF CURRENT USER?
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_teammate(
  requested_profile_id uuid
)

RETURNS boolean

LANGUAGE sql

STABLE

SECURITY DEFINER

SET search_path = ''
AS $$

  SELECT EXISTS (

    SELECT 1

    FROM public.team_members tm1

    INNER JOIN public.team_members tm2

      ON tm1.team_id = tm2.team_id

    WHERE tm1.profile_id = auth.uid()

      AND tm1.status = 'accepted'

      AND tm2.profile_id = requested_profile_id

      AND tm2.status = 'accepted'

  );

$$;


-- ============================================================================
-- 16. AUTO ADD TEAM CREATOR AS LEADER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.add_team_creator_as_leader()

RETURNS trigger

LANGUAGE plpgsql

SECURITY DEFINER

SET search_path = ''
AS $$

BEGIN

  INSERT INTO public.team_members (

    team_id,

    profile_id,

    is_leader,

    status

  )

  VALUES (

    NEW.id,

    NEW.created_by,

    true,

    'accepted'

  );

  RETURN NEW;

END;

$$;


DROP TRIGGER IF EXISTS trg_add_team_creator_as_leader
ON public.teams;


CREATE TRIGGER trg_add_team_creator_as_leader

AFTER INSERT ON public.teams

FOR EACH ROW

EXECUTE FUNCTION public.add_team_creator_as_leader();


-- ============================================================================
-- 17. TEAM MAX MEMBER ENFORCEMENT
--
-- Handles:
--   INSERT
--   pending -> accepted
--
-- Uses FOR UPDATE on team row to prevent concurrent over-capacity joins.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_team_max_members()

RETURNS trigger

LANGUAGE plpgsql

SECURITY DEFINER

SET search_path = ''
AS $$

DECLARE

  current_count integer;

  team_max integer;

BEGIN

  -- Only check when a new accepted membership is created
  -- or a pending membership becomes accepted.

  IF NEW.status = 'accepted'
     AND (
       TG_OP = 'INSERT'
       OR OLD.status <> 'accepted'
     )
  THEN

    -- Lock team row.
    SELECT max_members

    INTO team_max

    FROM public.teams

    WHERE id = NEW.team_id

    FOR UPDATE;


    IF team_max IS NULL THEN

      RAISE EXCEPTION
        'Team does not exist';

    END IF;


    SELECT COUNT(*)

    INTO current_count

    FROM public.team_members

    WHERE team_id = NEW.team_id

      AND status = 'accepted';


    IF current_count >= team_max THEN

      RAISE EXCEPTION
        'Team has reached its maximum member limit of %',
        team_max;

    END IF;

  END IF;


  RETURN NEW;

END;

$$;


DROP TRIGGER IF EXISTS trg_enforce_team_max_members
ON public.team_members;


CREATE TRIGGER trg_enforce_team_max_members

BEFORE INSERT OR UPDATE OF status

ON public.team_members

FOR EACH ROW

EXECUTE FUNCTION public.enforce_team_max_members();


-- ============================================================================
-- 18. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles
ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.events
ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.teams
ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.team_members
ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 19. PROFILES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS
  "profiles_select_own_or_teammate"
ON public.profiles;


DROP POLICY IF EXISTS
  "profiles_insert_own"
ON public.profiles;


DROP POLICY IF EXISTS
  "profiles_update_own"
ON public.profiles;


DROP POLICY IF EXISTS
  "profiles_admin_select"
ON public.profiles;


DROP POLICY IF EXISTS
  "profiles_admin_update"
ON public.profiles;


-- User can see:
--   own profile
--   teammate profiles

CREATE POLICY
  "profiles_select_own_or_teammate"

ON public.profiles

FOR SELECT

TO authenticated

USING (

  id = auth.uid()

  OR
  (SELECT public.is_teammate(id))

);


-- User can create only own profile.

CREATE POLICY
  "profiles_insert_own"

ON public.profiles

FOR INSERT

TO authenticated

WITH CHECK (

  id = auth.uid()

);


-- User can update only own profile.

CREATE POLICY
  "profiles_update_own"

ON public.profiles

FOR UPDATE

TO authenticated

USING (

  id = auth.uid()

)

WITH CHECK (

  id = auth.uid()

);


-- Admin can see all profiles.

CREATE POLICY
  "profiles_admin_select"

ON public.profiles

FOR SELECT

TO authenticated

USING (

  (SELECT public.is_admin())

);


-- Admin can update profiles.

CREATE POLICY
  "profiles_admin_update"

ON public.profiles

FOR UPDATE

TO authenticated

USING (

  (SELECT public.is_admin())

)

WITH CHECK (

  (SELECT public.is_admin())

);


-- ============================================================================
-- 20. EVENTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS
  "events_select_public"
ON public.events;


DROP POLICY IF EXISTS
  "events_admin_insert"
ON public.events;


DROP POLICY IF EXISTS
  "events_admin_update"
ON public.events;


DROP POLICY IF EXISTS
  "events_admin_delete"
ON public.events;


-- Public can view active events.

CREATE POLICY
  "events_select_public"

ON public.events

FOR SELECT

TO anon, authenticated

USING (

  is_active = true

);


-- Admin can create events.

CREATE POLICY
  "events_admin_insert"

ON public.events

FOR INSERT

TO authenticated

WITH CHECK (

  (SELECT public.is_admin())

);


-- Admin can update events.

CREATE POLICY
  "events_admin_update"

ON public.events

FOR UPDATE

TO authenticated

USING (

  (SELECT public.is_admin())

)

WITH CHECK (

  (SELECT public.is_admin())

);


-- Admin can delete events.

CREATE POLICY
  "events_admin_delete"

ON public.events

FOR DELETE

TO authenticated

USING (

  (SELECT public.is_admin())

);


-- ============================================================================
-- 21. TEAMS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS
  "teams_select_member"
ON public.teams;


DROP POLICY IF EXISTS
  "teams_insert_authenticated"
ON public.teams;


DROP POLICY IF EXISTS
  "teams_update_leader"
ON public.teams;


DROP POLICY IF EXISTS
  "teams_delete_leader"
ON public.teams;


DROP POLICY IF EXISTS
  "teams_admin_select"
ON public.teams;


-- Team members can see their team.

CREATE POLICY
  "teams_select_member"

ON public.teams

FOR SELECT

TO authenticated

USING (

  (SELECT public.is_team_member(id))

);


-- Any authenticated participant can create a team.

CREATE POLICY
  "teams_insert_authenticated"

ON public.teams

FOR INSERT

TO authenticated

WITH CHECK (

  created_by = auth.uid()

);


-- Only team leader can update team.

CREATE POLICY
  "teams_update_leader"

ON public.teams

FOR UPDATE

TO authenticated

USING (

  (SELECT public.is_team_leader(id))

)

WITH CHECK (

  (SELECT public.is_team_leader(id))

);


-- Only team leader can delete team.

CREATE POLICY
  "teams_delete_leader"

ON public.teams

FOR DELETE

TO authenticated

USING (

  (SELECT public.is_team_leader(id))

);


-- Admin can see all teams.

CREATE POLICY
  "teams_admin_select"

ON public.teams

FOR SELECT

TO authenticated

USING (

  (SELECT public.is_admin())

);


-- ============================================================================
-- 22. TEAM MEMBERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS
  "team_members_select_teammates"
ON public.team_members;


DROP POLICY IF EXISTS
  "team_members_insert_self"
ON public.team_members;


DROP POLICY IF EXISTS
  "team_members_update_leader"
ON public.team_members;


DROP POLICY IF EXISTS
  "team_members_delete_leader_or_self"
ON public.team_members;


DROP POLICY IF EXISTS
  "team_members_admin_select"
ON public.team_members;


-- Members can see members of their own team.

CREATE POLICY
  "team_members_select_teammates"

ON public.team_members

FOR SELECT

TO authenticated

USING (

  (SELECT public.is_team_member(team_id))

);


-- User can join a team only as themselves.

-- They cannot insert someone else's profile.

CREATE POLICY
  "team_members_insert_self"

ON public.team_members

FOR INSERT

TO authenticated

WITH CHECK (

  profile_id = auth.uid()

);


-- IMPORTANT:
-- Normal members CANNOT update themselves.
--
-- This prevents:
--
--   is_leader = true
--
-- self escalation.
--
-- Only team leader can manage member records.

CREATE POLICY
  "team_members_update_leader"

ON public.team_members

FOR UPDATE

TO authenticated

USING (

  (SELECT public.is_team_leader(team_id))

)

WITH CHECK (

  (SELECT public.is_team_leader(team_id))

);


-- User can leave their own team.
--
-- Leader can also remove members.

CREATE POLICY
  "team_members_delete_leader_or_self"

ON public.team_members

FOR DELETE

TO authenticated

USING (

  profile_id = auth.uid()

  OR

  (SELECT public.is_team_leader(team_id))

);


-- Admin can see all team memberships.

CREATE POLICY
  "team_members_admin_select"

ON public.team_members

FOR SELECT

TO authenticated

USING (

  (SELECT public.is_admin())

);


-- ============================================================================
-- 23. FUNCTION EXECUTION PERMISSIONS
--
-- SECURITY DEFINER functions are required by RLS policies.
-- Authenticated users need EXECUTE because PostgreSQL checks function
-- execution permission before running the policy.
--
-- They return only boolean values and do not expose sensitive data.
-- ============================================================================

REVOKE EXECUTE
ON FUNCTION public.is_team_member(uuid)
FROM anon;


REVOKE EXECUTE
ON FUNCTION public.is_team_leader(uuid)
FROM anon;


REVOKE EXECUTE
ON FUNCTION public.is_teammate(uuid)
FROM anon;


REVOKE EXECUTE
ON FUNCTION public.is_admin()
FROM anon;


GRANT EXECUTE
ON FUNCTION public.is_team_member(uuid)
TO authenticated;


GRANT EXECUTE
ON FUNCTION public.is_team_leader(uuid)
TO authenticated;


GRANT EXECUTE
ON FUNCTION public.is_teammate(uuid)
TO authenticated;


GRANT EXECUTE
ON FUNCTION public.is_admin()
TO authenticated;


-- ============================================================================
-- 24. TABLE PERMISSIONS
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


-- ============================================================================
-- 25. SECURITY DEFINER FUNCTION PERMISSIONS
-- ============================================================================

GRANT EXECUTE
ON FUNCTION public.handle_new_user()
TO postgres;


GRANT EXECUTE
ON FUNCTION public.set_updated_at()
TO postgres;


GRANT EXECUTE
ON FUNCTION public.prevent_role_self_escalation()
TO postgres;


GRANT EXECUTE
ON FUNCTION public.generate_team_code()
TO postgres;


GRANT EXECUTE
ON FUNCTION public.add_team_creator_as_leader()
TO postgres;


GRANT EXECUTE
ON FUNCTION public.enforce_team_max_members()
TO postgres;


-- ============================================================================
-- END OF INITIAL MIGRATION
-- ============================================================================