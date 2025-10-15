-- Migration: Add appi_audit_event_types lookup table with foreign key constraint
-- Date: 2025-10-08
-- Purpose: Enforce type safety for audit event types while maintaining flexibility

-- ============================================================================
-- APPI AUDIT EVENT TYPES LOOKUP TABLE
-- ============================================================================

CREATE TABLE "public"."appi_audit_event_types" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_type" varchar(50) NOT NULL UNIQUE,
    "category" varchar(50) NOT NULL CHECK (
        (category)::text = ANY (
            (ARRAY[
                'data_access'::character varying,
                'consent_management'::character varying,
                'user_management'::character varying,
                'profile_management'::character varying,
                'deletion_management'::character varying,
                'authentication'::character varying,
                'compliance'::character varying,
                'system'::character varying
            ])::text[]
        )
    ),
    "description" text NOT NULL,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- ============================================================================
-- SEED INITIAL EVENT TYPES
-- ============================================================================

-- Consent Management Events
INSERT INTO "public"."appi_audit_event_types" (event_type, category, description) VALUES
    ('consent_read', 'consent_management', 'User consent data accessed for read operation'),
    ('consent_validation_failed', 'consent_management', 'Consent validation check failed'),
    ('consent_validated', 'consent_management', 'Consent validation check passed'),
    ('consent_history_accessed', 'consent_management', 'User consent history accessed'),
    ('consent_recorded', 'consent_management', 'Initial user consent recorded'),
    ('consent_updated', 'consent_management', 'User consent preferences updated'),
    ('consent_withdrawn', 'consent_management', 'User consent withdrawn'),
    ('consent_change', 'consent_management', 'Generic consent change event');

-- User Management Events
INSERT INTO "public"."appi_audit_event_types" (event_type, category, description) VALUES
    ('user_data_access', 'user_management', 'User data accessed'),
    ('user_created', 'user_management', 'New user account created'),
    ('user_updated', 'user_management', 'User account information updated'),
    ('user_deleted', 'user_management', 'User account deleted');

-- Profile Management Events
INSERT INTO "public"."appi_audit_event_types" (event_type, category, description) VALUES
    ('profile_data_access', 'profile_management', 'User profile data accessed'),
    ('profile_created', 'profile_management', 'User profile created'),
    ('profile_updated', 'profile_management', 'User profile information updated');

-- Deletion Management Events
INSERT INTO "public"."appi_audit_event_types" (event_type, category, description) VALUES
    ('deletion_request', 'deletion_management', 'Data deletion request submitted'),
    ('deletion_processing', 'deletion_management', 'Data deletion request being processed'),
    ('deletion_completed', 'deletion_management', 'Data deletion request completed'),
    ('deletion_cancelled', 'deletion_management', 'Data deletion request cancelled');

-- Data Access Events
INSERT INTO "public"."appi_audit_event_types" (event_type, category, description) VALUES
    ('data_access', 'data_access', 'Generic data access event'),
    ('data_export', 'data_access', 'User data exported for download');

-- Authentication Events
INSERT INTO "public"."appi_audit_event_types" (event_type, category, description) VALUES
    ('login', 'authentication', 'User login event'),
    ('logout', 'authentication', 'User logout event'),
    ('login_failed', 'authentication', 'User login attempt failed');

-- Compliance Events
INSERT INTO "public"."appi_audit_event_types" (event_type, category, description) VALUES
    ('audit_trail_generated', 'compliance', 'Compliance audit trail generated for user'),
    ('privacy_policy_updated', 'compliance', 'Privacy policy version updated'),
    ('compliance_report_generated', 'compliance', 'Compliance report generated');

-- ============================================================================
-- DROP OLD CONSTRAINT ON appi_audit_events
-- ============================================================================

-- Remove the old hardcoded CHECK constraint
ALTER TABLE "public"."appi_audit_events"
    DROP CONSTRAINT IF EXISTS appi_audit_events_event_type_check;

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINT TO appi_audit_events
-- ============================================================================

-- Add foreign key constraint to enforce event type validation
ALTER TABLE "public"."appi_audit_events"
    ADD CONSTRAINT fk_appi_audit_event_type
    FOREIGN KEY (event_type)
    REFERENCES "public"."appi_audit_event_types"(event_type)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Index for quick lookups by event type
CREATE INDEX idx_appi_audit_event_types_event_type ON public.appi_audit_event_types USING btree (event_type);

-- Index for filtering by category
CREATE INDEX idx_appi_audit_event_types_category ON public.appi_audit_event_types USING btree (category);

-- Index for filtering active event types
CREATE INDEX idx_appi_audit_event_types_active ON public.appi_audit_event_types USING btree (is_active)
    WHERE is_active = true;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE "public"."appi_audit_event_types" IS
'Lookup table for valid APPI audit event types - provides type safety and documentation';

COMMENT ON COLUMN "public"."appi_audit_event_types"."event_type" IS
'Unique identifier for the event type (e.g., consent_read, user_created)';

COMMENT ON COLUMN "public"."appi_audit_event_types"."category" IS
'High-level category for grouping related event types';

COMMENT ON COLUMN "public"."appi_audit_event_types"."description" IS
'Human-readable description of what this event type represents';

COMMENT ON COLUMN "public"."appi_audit_event_types"."is_active" IS
'Whether this event type is currently active (allows soft deprecation)';

-- ============================================================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION update_appi_audit_event_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appi_audit_event_types_updated_at
    BEFORE UPDATE ON "public"."appi_audit_event_types"
    FOR EACH ROW
    EXECUTE FUNCTION update_appi_audit_event_types_updated_at();

-- ============================================================================
-- HELPER FUNCTION: Add new event type
-- ============================================================================

CREATE OR REPLACE FUNCTION add_audit_event_type(
    p_event_type varchar(50),
    p_category varchar(50),
    p_description text
)
RETURNS uuid AS $$
DECLARE
    v_event_type_id uuid;
BEGIN
    INSERT INTO "public"."appi_audit_event_types" (event_type, category, description)
    VALUES (p_event_type, p_category, p_description)
    ON CONFLICT (event_type) DO NOTHING
    RETURNING id INTO v_event_type_id;

    RETURN v_event_type_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_audit_event_type IS
'Helper function to safely add new audit event types with conflict handling';

-- ============================================================================
-- HELPER VIEW: Active Event Types by Category
-- ============================================================================

CREATE OR REPLACE VIEW v_active_audit_event_types AS
SELECT
    category,
    array_agg(event_type ORDER BY event_type) as event_types,
    count(*) as count
FROM "public"."appi_audit_event_types"
WHERE is_active = true
GROUP BY category
ORDER BY category;

COMMENT ON VIEW v_active_audit_event_types IS
'Quick reference view showing all active audit event types grouped by category';
