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
-- ============================================================================
-- End of Day 2 migration. Migration 2 adds team-leadership automation,
-- RLS helper functions, and admin policies on top of this.
-- ============================================================================
-- ============================================================================