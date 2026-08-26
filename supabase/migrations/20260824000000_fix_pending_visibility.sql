-- Update helper functions so pending members can see teammates and their profiles

CREATE OR REPLACE FUNCTION public.is_team_member(requested_team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = requested_team_id
      AND tm.profile_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teammate(requested_profile_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm1
    INNER JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.profile_id = auth.uid()
      AND tm2.profile_id = requested_profile_id
  );
$$;
