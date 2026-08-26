ALTER TABLE public.profiles
ADD COLUMN email_notifications BOOLEAN DEFAULT true,
ADD COLUMN announcement_notifications BOOLEAN DEFAULT true,
ADD COLUMN team_notifications BOOLEAN DEFAULT true,
ADD COLUMN submission_notifications BOOLEAN DEFAULT true;
