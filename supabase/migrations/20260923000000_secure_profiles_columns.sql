-- ============================================================================
-- HackIGNISIA — Migration: Secure Profile Columns
--
-- This migration adds a BEFORE UPDATE trigger to the `profiles` table to
-- prevent non-admin users from updating their own `platform_role` or
-- `payment_status`, closing a severe privilege escalation vulnerability.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Allow the update if the protected columns are unchanged
    IF (NEW.platform_role IS NOT DISTINCT FROM OLD.platform_role) AND 
       (NEW.payment_status IS NOT DISTINCT FROM OLD.payment_status) THEN
        RETURN NEW;
    END IF;

    -- If a protected column is being changed, verify the user is an admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Permission denied: Cannot update protected columns (platform_role, payment_status)';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_columns ON public.profiles;

CREATE TRIGGER tr_protect_profile_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_columns();
