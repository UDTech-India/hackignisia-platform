-- Create notifications table
CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add indexes for fast querying
CREATE INDEX idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
-- Users can only read their own notifications
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications 
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = profile_id);

-- Users can only update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" 
    ON public.notifications 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- We don't want regular users inserting their own notifications arbitrarily, 
-- but our join/accept logic uses the authenticated client. So we must allow insert.
-- Users can insert notifications if they are authenticated.
CREATE POLICY "Users can insert notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to delete their own notifications (optional)
CREATE POLICY "Users can delete their own notifications"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (auth.uid() = profile_id);
