-- Migration: add_approval_tracking_columns
-- Created: 2025-11-03
-- Description: Add approval tracking columns to users table for member approval workflow

-- Add approval tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_note TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id);

-- Create performance index for pending users queries
CREATE INDEX IF NOT EXISTS idx_users_status_created
ON users(status, created_at DESC)
WHERE status = 'pending';

-- Add helpful comments for documentation
COMMENT ON COLUMN users.approval_note IS 'Optional note from admin when approving or rejecting a user';
COMMENT ON COLUMN users.rejected_at IS 'Timestamp when user was rejected by an admin';
COMMENT ON COLUMN users.approved_by IS 'ID of the admin who approved this user';
COMMENT ON COLUMN users.rejected_by IS 'ID of the admin who rejected this user';

-- Verification query (commented out for production)
-- SELECT
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- AND column_name IN ('approval_note', 'rejected_at', 'approved_by', 'rejected_by')
-- ORDER BY ordinal_position;
