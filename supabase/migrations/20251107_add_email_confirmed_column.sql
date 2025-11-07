-- Migration: Add email_confirmed_at column to users table
-- Purpose: Store email verification status locally to avoid admin API calls
-- Date: 2025-11-07

-- Add email_confirmed_at column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email_confirmed
ON public.users(email_confirmed_at);

-- Add comment for documentation
COMMENT ON COLUMN public.users.email_confirmed_at IS
'Timestamp when user confirmed their email address. Synced from auth.users.email_confirmed_at';

-- Initialize email_confirmed_at for existing users
-- This is a one-time operation to sync existing data
-- Note: This requires auth.users access which may need to be run with elevated permissions
-- UPDATE public.users u
-- SET email_confirmed_at = (
--   SELECT email_confirmed_at
--   FROM auth.users au
--   WHERE au.id = u.id
-- )
-- WHERE email_confirmed_at IS NULL;

-- Note: For ongoing sync, we'll update this field in the application code
-- when users verify their email (in the callback handler)
