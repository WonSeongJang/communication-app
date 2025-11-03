# Database Migration: Add Approval Tracking Columns

## Migration Details

**Migration Name**: `add_approval_tracking_columns`
**Created**: 2025-11-03
**Status**: ⏳ **PENDING EXECUTION**

## Overview

This migration extends the `users` table to support the member approval workflow by adding tracking columns for approval/rejection metadata.

## Changes

### New Columns Added to `users` Table

| Column Name | Data Type | Nullable | References | Description |
|------------|-----------|----------|------------|-------------|
| `approval_note` | TEXT | YES | - | Optional note from admin when approving/rejecting |
| `rejected_at` | TIMESTAMP WITH TIME ZONE | YES | - | Timestamp when user was rejected |
| `approved_by` | UUID | YES | users(id) | ID of the admin who approved this user |
| `rejected_by` | UUID | YES | users(id) | ID of the admin who rejected this user |

### Performance Index

**Index Name**: `idx_users_status_created`
**Type**: Partial B-tree Index
**Columns**: `(status, created_at DESC)`
**Condition**: `WHERE status = 'pending'`
**Purpose**: Optimizes queries for pending users list

## Execution Steps

### Option 1: Supabase Dashboard (RECOMMENDED)

1. **Open SQL Editor**:
   - Navigate to: https://mzrvykieuqoxbxhfhsyp.supabase.co/project/_/sql/new

2. **Execute Migration SQL**:
   - Copy the SQL from `migrations/add_approval_tracking_columns.sql`
   - Paste into the SQL editor
   - Click **"Run"** button

3. **Verify Success**:
   ```bash
   cd /Users/jws/cursorPrj/communication/app
   node verify-migration.js
   ```

### Option 2: Supabase CLI

```bash
# Login to Supabase (one-time setup)
supabase login

# Link to project (one-time setup)
supabase link --project-ref mzrvykieuqoxbxhfhsyp

# Execute migration
supabase db push --include-all
```

### Option 3: Direct PostgreSQL Connection

```bash
# Requires PostgreSQL client (psql) installed
psql "postgresql://postgres:[PASSWORD]@db.mzrvykieuqoxbxhfhsyp.supabase.co:5432/postgres" \
  -f migrations/add_approval_tracking_columns.sql
```

## Migration SQL

```sql
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
```

## Verification

After executing the migration, verify success by running:

```bash
node verify-migration.js
```

**Expected Output**:
```
✅ Migration verified successfully!

📋 New columns confirmed:
  ✓ approval_note (TEXT)
  ✓ rejected_at (TIMESTAMP WITH TIME ZONE)
  ✓ approved_by (UUID, FK to users)
  ✓ rejected_by (UUID, FK to users)

📊 Index created:
  ✓ idx_users_status_created on (status, created_at DESC) WHERE status = 'pending'
```

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove index
DROP INDEX IF EXISTS idx_users_status_created;

-- Remove columns
ALTER TABLE users DROP COLUMN IF EXISTS rejected_by;
ALTER TABLE users DROP COLUMN IF EXISTS approved_by;
ALTER TABLE users DROP COLUMN IF EXISTS rejected_at;
ALTER TABLE users DROP COLUMN IF EXISTS approval_note;
```

## Impact Analysis

### Schema Changes
- ✅ **Backward Compatible**: All columns are nullable
- ✅ **Idempotent**: Uses `IF NOT EXISTS` clauses
- ✅ **Zero Downtime**: No data migration required

### Performance Impact
- ✅ **Positive**: New partial index improves pending users queries
- ✅ **Minimal Overhead**: New columns are nullable and optional
- ✅ **Efficient**: Index only covers pending status rows

### Application Impact
- ✅ **Non-Breaking**: Existing queries will continue to work
- ✅ **RLS Compatible**: Existing Row Level Security policies remain valid
- ⚠️ **New Features**: Application code can now use approval tracking

## Files

- 📄 **Migration SQL**: `/Users/jws/cursorPrj/communication/app/migrations/add_approval_tracking_columns.sql`
- 📄 **Verification Script**: `/Users/jws/cursorPrj/communication/app/verify-migration.js`
- 📄 **Execution Helper**: `/Users/jws/cursorPrj/communication/app/execute-migration.js`
- 📄 **This Document**: `/Users/jws/cursorPrj/communication/app/MIGRATION_INSTRUCTIONS.md`

## Next Steps

1. ✅ Execute the migration using one of the methods above
2. ⏳ Verify the migration completed successfully
3. ⏳ Update application code to use new approval tracking columns
4. ⏳ Test the member approval workflow end-to-end

---

**Status**: Ready for execution
**Risk Level**: 🟢 Low (backward compatible, idempotent)
**Estimated Time**: < 1 minute
