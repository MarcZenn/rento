-- Migration: Add is_verified audit event type
-- Description: Adds is_verified event type for tracking email verification via Cognito
-- Date: 2025-10-18

-- Insert the new audit event type
INSERT INTO "public"."appi_audit_event_types" (
  "event_type",
  "category",
  "description",
  "is_active",
  "created_at"
)
VALUES (
  'is_verified',
  'authentication',
  'User email address verified via Cognito PostConfirmation trigger',
  true,
  NOW()
)
ON CONFLICT (event_type) DO NOTHING;
