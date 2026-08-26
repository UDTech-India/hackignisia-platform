-- Drop the existing constraint if it exists (assuming default name)
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_created_by_fkey;

-- Add the foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.teams 
  ADD CONSTRAINT teams_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;
