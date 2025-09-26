-- APPI Compliant PostgreSQL Schema Migration
-- Converted from Convex schema for Rento application
-- Tokyo Region deployment with encryption and audit compliance

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Enable Row Level Security globally
SET row_security = on;

-- ============================================================================
-- CORE USER AND PROFILE TABLES
-- ============================================================================

-- Languages table
CREATE TABLE languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language_code VARCHAR(10) UNIQUE NOT NULL,
    language_name VARCHAR(100) NOT NULL,
    endonym VARCHAR(100) NOT NULL,
    is_supported BOOLEAN NOT NULL DEFAULT true,
    rtl BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_languages_code ON languages(language_code);
CREATE INDEX idx_languages_supported ON languages(is_supported);

-- User types lookup
CREATE TABLE user_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL CHECK (slug IN ('renter', 'agent', 'admin', 'partner', 'advertiser')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employment statuses
CREATE TABLE employment_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status VARCHAR(50) UNIQUE NOT NULL CHECK (status IN ('student', 'unemployed', 'freelance', 'part-time', 'salary', 'hourly')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employment_statuses_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employment_statuses_id UUID NOT NULL REFERENCES employment_statuses(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    translated_status VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employment_statuses_id, language_id)
);

-- Main users table (PII encrypted)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL, -- Will be removed in Task 13
    email TEXT NOT NULL, -- Encrypted with pgcrypto
    username VARCHAR(100) UNIQUE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypt email field for PII protection
CREATE INDEX idx_users_email ON users USING HASH (email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- ============================================================================
-- PRIVACY AND CONSENT TABLES (APPI COMPLIANCE)
-- ============================================================================

-- Privacy policy versions for tracking
CREATE TABLE privacy_policy_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) UNIQUE NOT NULL,
    effective_date TIMESTAMPTZ NOT NULL,
    en_content_hash VARCHAR(64) NOT NULL,
    jp_content_hash VARCHAR(64) NOT NULL,
    major_changes TEXT[] NOT NULL DEFAULT '{}',
    requires_reconsent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Primary consent tracking table (APPI Article 17 compliance)
CREATE TABLE user_consent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Granular consent flags
    profile_data_consent BOOLEAN NOT NULL,
    location_data_consent BOOLEAN NOT NULL,
    communication_consent BOOLEAN NOT NULL,
    analytics_consent BOOLEAN NOT NULL,
    marketing_consent BOOLEAN,

    -- Legal audit fields
    consent_timestamp TIMESTAMPTZ NOT NULL,
    consent_ip_address INET NOT NULL,
    consent_version VARCHAR(50) NOT NULL,
    consent_user_agent TEXT,
    consent_method VARCHAR(50) NOT NULL CHECK (consent_method IN ('registration', 'profile_update', 'policy_change')),

    -- Modification tracking
    withdrawal_timestamp TIMESTAMPTZ,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Compliance verification
    policy_version_accepted VARCHAR(50) NOT NULL REFERENCES privacy_policy_versions(version),
    legal_basis VARCHAR(50) NOT NULL CHECK (legal_basis IN ('consent', 'contract', 'legitimate_interest')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One active consent record per user
);

CREATE INDEX idx_user_consent_user_id ON user_consent(user_id);
CREATE INDEX idx_user_consent_timestamp ON user_consent(consent_timestamp);
CREATE INDEX idx_user_consent_policy_version ON user_consent(policy_version_accepted);

-- Consent history for audit trails (APPI compliance)
CREATE TABLE consent_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_id UUID NOT NULL REFERENCES user_consent(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('granted', 'withdrawn', 'modified')),
    consent_type VARCHAR(50) NOT NULL,
    previous_value BOOLEAN,
    new_value BOOLEAN NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET NOT NULL,
    user_agent TEXT,
    reason VARCHAR(100)
);

CREATE INDEX idx_consent_history_user_id ON consent_history(user_id);
CREATE INDEX idx_consent_history_timestamp ON consent_history(timestamp);
CREATE INDEX idx_consent_history_action ON consent_history(action_type);

-- ============================================================================
-- GEOGRAPHIC AND LOCATION TABLES
-- ============================================================================

-- Countries table
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code VARCHAR(3) UNIQUE NOT NULL,
    country_flag TEXT NOT NULL, -- URL to flag image
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE country_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    countries_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    country_name VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(countries_id, language_id)
);

-- Prefectures (Japanese administrative divisions)
CREATE TABLE prefectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, language_id)
);

-- Wards (sub-prefecture divisions)
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prefecture_id UUID NOT NULL REFERENCES prefectures(id) ON DELETE CASCADE,
    prefecture_name_en VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wards_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wards_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wards_id, language_id)
);

-- ============================================================================
-- USER PROFILES AND PREFERENCES
-- ============================================================================

-- User profiles (contains PII - encrypted fields)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number TEXT, -- Encrypted
    first_name TEXT, -- Encrypted
    surname TEXT, -- Encrypted
    employment_status_id UUID REFERENCES employment_statuses(id),
    user_type_id UUID REFERENCES user_types(id),
    is_foreign_resident BOOLEAN,
    nationality_id UUID REFERENCES countries(id),
    has_guarantor BOOLEAN,
    consecutive_years_employed BIGINT,
    rental_readiness_score BIGINT,
    onboarding_completed BOOLEAN DEFAULT false,
    about TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Encrypt PII fields in profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_user_type ON profiles(user_type_id);

-- Profile translations for multilingual support
CREATE TABLE profiles_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    about TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, language_id)
);

-- Floor plans
CREATE TABLE floor_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) UNIQUE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE floor_plans_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_plans_id UUID NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(floor_plans_id, language_id)
);

-- User preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    min_rent BIGINT, -- in yen
    max_rent BIGINT, -- in yen
    min_size BIGINT, -- in square meters
    max_size BIGINT, -- in square meters
    preferred_layouts UUID[] REFERENCES floor_plans(id),
    language_preference_id UUID REFERENCES languages(id),
    preferred_wards UUID[] REFERENCES wards(id),
    no_key_money BOOLEAN,
    pets_allowed BOOLEAN,
    foreigner_friendly BOOLEAN,
    english_lease BOOLEAN,
    furnished BOOLEAN,
    station_distance_max BOOLEAN,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- PROPERTY AND AGENCY TABLES
-- ============================================================================

-- Tags for properties
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100), -- Icon name or URL
    is_featured BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tags_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tags_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    label VARCHAR(200) NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tags_id, language_id)
);

-- Agencies
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_owner_id UUID NOT NULL REFERENCES users(id),
    contact_email TEXT NOT NULL, -- Encrypted
    phone_number TEXT, -- Encrypted
    agency_name VARCHAR(200) UNIQUE NOT NULL,
    ward_id UUID NOT NULL REFERENCES wards(id),
    website_url TEXT,
    logo_url TEXT,
    bilingual_support BOOLEAN,
    verified BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agencies_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agencies_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    company_bio TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agencies_id, language_id)
);

-- Agents
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    languages_spoken TEXT[], -- Array of language codes
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE agents_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agents_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    agent_name VARCHAR(200) NOT NULL,
    bio TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agents_id, language_id)
);

-- Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(300) NOT NULL,
    prefecture_id UUID NOT NULL REFERENCES prefectures(id),
    ward_id UUID NOT NULL REFERENCES wards(id),
    postal_code BIGINT NOT NULL,
    street VARCHAR(500) NOT NULL,
    rent_amount DOUBLE PRECISION NOT NULL,
    key_money_amount DOUBLE PRECISION,
    deposit_amount DOUBLE PRECISION,
    maintenance_fee DOUBLE PRECISION,
    guarantor_fee DOUBLE PRECISION,
    management_fee DOUBLE PRECISION,
    agency_fee DOUBLE PRECISION,
    utilities_covered BOOLEAN NOT NULL DEFAULT false,
    floor_plan_id UUID REFERENCES floor_plans(id),
    area_m2 DOUBLE PRECISION,
    nearest_station_walk_min BIGINT,
    tags_ids UUID[] REFERENCES tags(id),
    furnished BOOLEAN,
    guarantor_required BOOLEAN,
    photos TEXT[] DEFAULT '{}', -- Array of image URLs
    agency_id UUID NOT NULL REFERENCES agencies(id),
    agent_id UUID NOT NULL REFERENCES agents(id),
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    date_listed TIMESTAMPTZ,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_name ON properties(name);
CREATE INDEX idx_properties_ward ON properties(ward_id);
CREATE INDEX idx_properties_agency ON properties(agency_id);
CREATE INDEX idx_properties_available ON properties(is_available);
CREATE INDEX idx_properties_rent ON properties(rent_amount);

CREATE TABLE properties_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    properties_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(properties_id, language_id)
);

-- ============================================================================
-- MESSAGING AND CHAT TABLES
-- ============================================================================

-- Chat statuses
CREATE TABLE chat_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status VARCHAR(20) UNIQUE NOT NULL CHECK (status IN ('active', 'stale', 'closed', 'expired', 'archived')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chats
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    status_id UUID NOT NULL REFERENCES chat_statuses(id),
    last_message_at TIMESTAMPTZ,
    last_seen_by_user TIMESTAMPTZ,
    last_seen_by_agent TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chats_user_agent ON chats(user_id, agent_id);
CREATE INDEX idx_chats_status ON chats(status_id);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL, -- References either users or agents
    sender_type_id UUID NOT NULL REFERENCES user_types(id),
    source_language_id UUID NOT NULL REFERENCES languages(id),
    target_language_id UUID NOT NULL REFERENCES languages(id),
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    is_expired BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================================================
-- APPI COMPLIANCE AUDIT TABLES (NEW)
-- ============================================================================

-- APPI audit events for compliance tracking
CREATE TABLE appi_audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('data_access', 'consent_change', 'deletion_request', 'data_export', 'login', 'logout')),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET NOT NULL,
    user_agent TEXT,
    data_accessed TEXT, -- Encrypted field describing what data was accessed
    compliance_status VARCHAR(20) NOT NULL CHECK (compliance_status IN ('compliant', 'violation', 'warning')) DEFAULT 'compliant',
    event_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appi_audit_user ON appi_audit_events(user_id);
CREATE INDEX idx_appi_audit_timestamp ON appi_audit_events(event_timestamp);
CREATE INDEX idx_appi_audit_type ON appi_audit_events(event_type);

-- Data residency log for geographic compliance
CREATE TABLE appi_data_residency_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_type VARCHAR(100) NOT NULL,
    data_id UUID NOT NULL,
    geographic_location VARCHAR(50) NOT NULL DEFAULT 'Japan-Tokyo',
    storage_location VARCHAR(200) NOT NULL,
    encryption_status VARCHAR(50) NOT NULL DEFAULT 'AES-256',
    compliance_check_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appi_residency_location ON appi_data_residency_log(geographic_location);
CREATE INDEX idx_appi_residency_timestamp ON appi_data_residency_log(compliance_check_timestamp);

-- Incident tracking for APPI compliance
CREATE TABLE appi_incident_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(100) UNIQUE NOT NULL,
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('data_breach', 'unauthorized_access', 'system_failure', 'compliance_violation')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    incident_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    affected_users_count INT DEFAULT 0,
    data_types_affected TEXT[],
    incident_description TEXT NOT NULL,
    remediation_actions TEXT[],
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'closed')) DEFAULT 'open',
    regulatory_notification_sent BOOLEAN DEFAULT false,
    regulatory_notification_timestamp TIMESTAMPTZ,
    resolved_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appi_incident_timestamp ON appi_incident_tracking(incident_timestamp);
CREATE INDEX idx_appi_incident_status ON appi_incident_tracking(status);
CREATE INDEX idx_appi_incident_severity ON appi_incident_tracking(severity);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables containing user data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE appi_audit_events ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for users (can be expanded based on application needs)
CREATE POLICY users_own_data ON users
    FOR ALL TO application_user
    USING (id = current_setting('app.current_user_id')::UUID);

-- ============================================================================
-- FUNCTIONS FOR PII ENCRYPTION/DECRYPTION
-- ============================================================================

-- Function to encrypt PII data
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        pgp_sym_encrypt(
            data,
            current_setting('app.encryption_key', true)
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt PII data
CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(
        decode(encrypted_data, 'base64'),
        current_setting('app.encryption_key', true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional indexes for common queries
CREATE INDEX CONCURRENTLY idx_properties_location ON properties(prefecture_id, ward_id);
CREATE INDEX CONCURRENTLY idx_properties_price_range ON properties(rent_amount) WHERE is_available = true;
CREATE INDEX CONCURRENTLY idx_chats_active ON chats(status_id, last_message_at) WHERE last_message_at IS NOT NULL;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default languages
INSERT INTO languages (language_code, language_name, endonym, is_supported, rtl) VALUES
('en', 'English', 'English', true, false),
('ja', 'Japanese', '日本語', true, false)
ON CONFLICT (language_code) DO NOTHING;

-- Insert user types
INSERT INTO user_types (slug) VALUES
('renter'),
('agent'),
('admin'),
('partner'),
('advertiser')
ON CONFLICT (slug) DO NOTHING;

-- Insert employment statuses
INSERT INTO employment_statuses (status) VALUES
('student'),
('unemployed'),
('freelance'),
('part-time'),
('salary'),
('hourly')
ON CONFLICT (status) DO NOTHING;

-- Insert chat statuses
INSERT INTO chat_statuses (status) VALUES
('active'),
('stale'),
('closed'),
('expired'),
('archived')
ON CONFLICT (status) DO NOTHING;

-- ============================================================================
-- AUDIT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_consent_updated_at BEFORE UPDATE ON user_consent FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Create application user role
CREATE ROLE application_user;
GRANT CONNECT ON DATABASE rento_appi_db TO application_user;
GRANT USAGE ON SCHEMA public TO application_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO application_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO application_user;

-- Grant permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO application_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO application_user;

-- Create read-only role for reporting
CREATE ROLE read_only_user;
GRANT CONNECT ON DATABASE rento_appi_db TO read_only_user;
GRANT USAGE ON SCHEMA public TO read_only_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only_user;

COMMIT;