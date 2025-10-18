-- Migration: Add is_verified column to users table
-- Description: Allows tracking of email verification status independently from Cognito
--              Users can access the app before email verification, with gated features
-- Date: 2025-10-18

-- Add is_verified column
ALTER TABLE "public"."users"
ADD COLUMN "is_verified" boolean NOT NULL DEFAULT false;

-- Create index for querying verified users
CREATE INDEX idx_users_is_verified ON "public"."users" USING btree (is_verified);

-- Add comment for documentation
COMMENT ON COLUMN "public"."users"."is_verified" IS 'Indicates whether the user has verified their email address. Set to true after PostConfirmation trigger.';

-- Backfill existing users (if any) - assume verified if they have a created_at timestamp
-- Since we currently have no users, this is precautionary
UPDATE "public"."users"
SET "is_verified" = true
WHERE "cognito_id" IS NOT NULL;
