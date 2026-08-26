-- Fix: add ON DELETE CASCADE to all foreign keys referencing auth.users
-- so that deleting a user cleans up all their data automatically.

-- 1. profiles table (id references auth.users)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. team_members: profile_id references profiles
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_profile_id_fkey;

ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. teams: created_by references profiles
ALTER TABLE public.teams
  DROP CONSTRAINT IF EXISTS teams_created_by_fkey;

ALTER TABLE public.teams
  ADD CONSTRAINT teams_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
