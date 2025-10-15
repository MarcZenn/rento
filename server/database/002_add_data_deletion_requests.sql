-- Migration: Add data_deletion_requests table for APPI compliance
-- Date: 2025-10-08
-- Purpose: Support APPI Article 27 - User right to data deletion

-- ============================================================================
-- DATA DELETION REQUESTS TABLE
-- ============================================================================

CREATE TABLE "public"."data_deletion_requests" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "requested_at" timestamptz NOT NULL DEFAULT now(),
    "scheduled_deletion_date" timestamptz NOT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'pending'::character varying CHECK (
        (status)::text = ANY (
            (ARRAY[
                'pending'::character varying,
                'processing'::character varying,
                'completed'::character varying,
                'cancelled'::character varying
            ])::text[]
        )
    ),
    "deletion_scope" varchar(50) NOT NULL DEFAULT 'full'::character varying CHECK (
        (deletion_scope)::text = ANY (
            (ARRAY[
                'full'::character varying,
                'partial'::character varying,
                'profile_only'::character varying
            ])::text[]
        )
    ),
    "completed_at" timestamptz,
    "cancelled_at" timestamptz,
    "cancellation_reason" text,
    "deletion_notes" text,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE "public"."data_deletion_requests"
    ADD FOREIGN KEY ("user_id")
    REFERENCES "public"."users"("id")
    ON DELETE CASCADE;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for looking up deletion requests by user
CREATE INDEX idx_data_deletion_user ON public.data_deletion_requests USING btree (user_id);

-- Index for finding pending deletion requests (for scheduled deletion job)
CREATE INDEX idx_data_deletion_status ON public.data_deletion_requests USING btree (status);

-- Index for finding deletion requests by scheduled date (for scheduled deletion job)
CREATE INDEX idx_data_deletion_scheduled_date ON public.data_deletion_requests USING btree (scheduled_deletion_date);

-- Composite index for efficient queries of pending deletions by date
CREATE INDEX idx_data_deletion_pending_by_date ON public.data_deletion_requests
    USING btree (status, scheduled_deletion_date)
    WHERE ((status)::text = 'pending'::text);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE "public"."data_deletion_requests" IS
'APPI Article 27 compliance - Tracks user data deletion requests with 30-day grace period';

COMMENT ON COLUMN "public"."data_deletion_requests"."user_id" IS
'User requesting data deletion';

COMMENT ON COLUMN "public"."data_deletion_requests"."requested_at" IS
'Timestamp when deletion was requested';

COMMENT ON COLUMN "public"."data_deletion_requests"."scheduled_deletion_date" IS
'Date when deletion will be executed (typically 30 days after request)';

COMMENT ON COLUMN "public"."data_deletion_requests"."status" IS
'Status of deletion request: pending, processing, completed, cancelled';

COMMENT ON COLUMN "public"."data_deletion_requests"."deletion_scope" IS
'Scope of deletion: full (all data), partial (some data), profile_only';

COMMENT ON COLUMN "public"."data_deletion_requests"."completed_at" IS
'Timestamp when deletion was completed';

COMMENT ON COLUMN "public"."data_deletion_requests"."cancelled_at" IS
'Timestamp when deletion was cancelled by user';

COMMENT ON COLUMN "public"."data_deletion_requests"."cancellation_reason" IS
'Reason for cancellation if applicable';

-- ============================================================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION update_data_deletion_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_data_deletion_requests_updated_at
    BEFORE UPDATE ON "public"."data_deletion_requests"
    FOR EACH ROW
    EXECUTE FUNCTION update_data_deletion_requests_updated_at();
