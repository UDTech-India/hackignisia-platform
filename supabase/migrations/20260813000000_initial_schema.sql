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
-- 3. EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  submission_deadline_at timestamptz,
  judging_starts_at timestamptz,
  judging_ends_at timestamptz,
  results_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. TEAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  team_code text UNIQUE NOT NULL,
  max_members integer NOT NULL DEFAULT 5,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. TEAM MEMBERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_leader boolean NOT NULL DEFAULT false,
  status public.team_member_status NOT NULL DEFAULT 'pending',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, profile_id)
);

-- ============================================================================
-- 6. AUTO CREATE PROFILE AFTER AUTH SIGNUP
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
-- End of Day 2 migration.
-- ============================================================================