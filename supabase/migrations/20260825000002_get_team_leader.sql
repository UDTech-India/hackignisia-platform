CREATE OR REPLACE FUNCTION public.get_team_leader(p_team_id uuid) 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = '' 
AS $$ 
  SELECT profile_id 
  FROM public.team_members 
  WHERE team_id = p_team_id AND is_leader = true 
  LIMIT 1; 
$$; 

GRANT EXECUTE ON FUNCTION public.get_team_leader(uuid) TO authenticated;
