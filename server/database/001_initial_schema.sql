-- -------------------------------------------------------------
-- Database: rento_dev
-- Generation Time: 2025-09-29 22:13:00.2530
-- -------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table Definition
CREATE TABLE "public"."agencies" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "account_owner_id" uuid NOT NULL,
    "contact_email" text NOT NULL,
    "phone_number" text,
    "agency_name" varchar(200) NOT NULL,
    "ward_id" uuid NOT NULL,
    "website_url" text,
    "logo_url" text,
    "bilingual_support" bool,
    "verified" bool DEFAULT false,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."agencies_translations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "agencies_id" uuid NOT NULL,
    "language_id" uuid NOT NULL,
    "company_bio" text,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."agents" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "agency_id" uuid NOT NULL,
    "license_number" varchar(100),
    "languages_spoken" _text,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."agents_translations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "agents_id" uuid NOT NULL,
    "language_id" uuid NOT NULL,
    "agent_name" varchar(200) NOT NULL,
    "bio" text,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."appi_audit_events" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "event_id" varchar(100) NOT NULL,
    "user_id" uuid,
    "event_type" varchar(50) NOT NULL CHECK ((event_type)::text = ANY ((ARRAY['data_access'::character varying, 'consent_change'::character varying, 'deletion_request'::character varying, 'data_export'::character varying, 'login'::character varying, 'logout'::character varying])::text[])),
    "event_timestamp" timestamptz NOT NULL DEFAULT now(),
    "ip_address" inet NOT NULL,
    "user_agent" text,
    "data_accessed" text,
    "compliance_status" varchar(20) NOT NULL DEFAULT 'compliant'::character varying CHECK ((compliance_status)::text = ANY ((ARRAY['compliant'::character varying, 'violation'::character varying, 'warning'::character varying])::text[])),
    "event_details" jsonb,
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."appi_data_residency_log" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "data_type" varchar(100) NOT NULL,
    "data_id" uuid NOT NULL,
    "geographic_location" varchar(50) NOT NULL DEFAULT 'Japan-Tokyo'::character varying,
    "storage_location" varchar(200) NOT NULL,
    "encryption_status" varchar(50) NOT NULL DEFAULT 'AES-256'::character varying,
    "compliance_check_timestamp" timestamptz NOT NULL DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."appi_incident_tracking" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "incident_id" varchar(100) NOT NULL,
    "incident_type" varchar(50) NOT NULL CHECK ((incident_type)::text = ANY ((ARRAY['data_breach'::character varying, 'unauthorized_access'::character varying, 'system_failure'::character varying, 'compliance_violation'::character varying])::text[])),
    "severity" varchar(20) NOT NULL DEFAULT 'medium'::character varying CHECK ((severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[])),
    "incident_timestamp" timestamptz NOT NULL DEFAULT now(),
    "affected_users_count" int4 DEFAULT 0,
    "data_types_affected" _text,
    "incident_description" text NOT NULL,
    "remediation_actions" _text,
    "status" varchar(20) NOT NULL DEFAULT 'open'::character varying CHECK ((status)::text = ANY ((ARRAY['open'::character varying, 'investigating'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[])),
    "regulatory_notification_sent" bool DEFAULT false,
    "regulatory_notification_timestamp" timestamptz,
    "resolved_timestamp" timestamptz,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."chat_statuses" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "status" varchar(20) NOT NULL CHECK ((status)::text = ANY ((ARRAY['active'::character varying, 'stale'::character varying, 'closed'::character varying, 'expired'::character varying, 'archived'::character varying])::text[])),
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."consent_history" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "consent_id" uuid NOT NULL,
    "action_type" varchar(20) NOT NULL CHECK ((action_type)::text = ANY ((ARRAY['granted'::character varying, 'withdrawn'::character varying, 'modified'::character varying])::text[])),
    "consent_type" varchar(50) NOT NULL,
    "previous_value" bool,
    "new_value" bool NOT NULL,
    "timestamp" timestamptz NOT NULL DEFAULT now(),
    "ip_address" inet NOT NULL,
    "user_agent" text,
    "reason" varchar(100),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."countries" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "country_code" varchar(3) NOT NULL,
    "country_flag" text,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."country_translations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "countries_id" uuid NOT NULL,
    "language_id" uuid NOT NULL,
    "country_name" varchar(100) NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."employment_statuses" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "status" varchar(50) NOT NULL CHECK ((status)::text = ANY ((ARRAY['student'::character varying, 'unemployed'::character varying, 'freelance'::character varying, 'part-time'::character varying, 'salary'::character varying, 'hourly'::character varying])::text[])),
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."employment_statuses_translations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "employment_statuses_id" uuid NOT NULL,
    "language_id" uuid NOT NULL,
    "translated_status" varchar(100) NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."floor_plans" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "type" varchar(50) NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."floor_plans_translations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "floor_plans_id" uuid NOT NULL,
    "language_id" uuid NOT NULL,
    "description" text NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."languages" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "language_code" varchar(10) NOT NULL,
    "language_name" varchar(100) NOT NULL,
    "endonym" varchar(100) NOT NULL,
    "is_supported" bool NOT NULL DEFAULT true,
    "rtl" bool NOT NULL DEFAULT false,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."prefectures" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" varchar(100) NOT NULL,
    "language_id" uuid NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."prefectures_translations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "language_id" uuid NOT NULL,
    "prefectures_id" uuid NOT NULL,
    "name" varchar(100) NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."privacy_policy_versions" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "version" varchar(50) NOT NULL,
    "effective_date" timestamptz NOT NULL,
    "en_content_hash" varchar(64) NOT NULL,
    "jp_content_hash" varchar(64) NOT NULL,
    "major_changes" _text NOT NULL DEFAULT '{}'::text[],
    "requires_reconsent" bool NOT NULL DEFAULT false,
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."profiles" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "phone_number" text,
    "first_name" text,
    "surname" text,
    "employment_status_id" uuid,
    "user_type_id" uuid,
    "is_foreign_resident" bool,
    "nationality_id" uuid,
    "has_guarantor" bool,
    "consecutive_years_employed" int8,
    "rental_readiness_score" int8,
    "onboarding_completed" bool DEFAULT false,
    "about" text,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."profiles_translations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "profile_id" uuid NOT NULL,
    "language_id" uuid NOT NULL,
    "about" text,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."tags" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "slug" varchar(100) NOT NULL,
    "icon" varchar(100),
    "is_featured" bool NOT NULL DEFAULT false,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."tags_translations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "tags_id" uuid NOT NULL,
    "language_id" uuid NOT NULL,
    "label" varchar(200) NOT NULL,
    "description" text,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."user_consent" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "profile_data_consent" bool NOT NULL,
    "location_data_consent" bool NOT NULL,
    "communication_consent" bool NOT NULL,
    "analytics_consent" bool NOT NULL,
    "marketing_consent" bool,
    "consent_timestamp" timestamptz NOT NULL,
    "consent_ip_address" inet NOT NULL,
    "consent_version" varchar(50) NOT NULL,
    "consent_user_agent" text,
    "consent_method" varchar(50) NOT NULL CHECK ((consent_method)::text = ANY ((ARRAY['registration'::character varying, 'profile_update'::character varying, 'policy_change'::character varying])::text[])),
    "withdrawal_timestamp" timestamptz,
    "last_updated" timestamptz NOT NULL DEFAULT now(),
    "policy_version_accepted" varchar(50) NOT NULL,
    "legal_basis" varchar(50) NOT NULL CHECK ((legal_basis)::text = ANY ((ARRAY['consent'::character varying, 'contract'::character varying, 'legitimate_interest'::character varying])::text[])),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."user_types" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "slug" varchar(50) NOT NULL CHECK ((slug)::text = ANY ((ARRAY['renter'::character varying, 'agent'::character varying, 'admin'::character varying, 'partner'::character varying, 'advertiser'::character varying])::text[])),
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "clerk_id" varchar(255),
    "cognito_id" varchar(255),
    "email" text NOT NULL,
    "username" varchar(100) NOT NULL,
    "data_residency_confirmed" bool DEFAULT false,
    "last_consent_review" timestamptz,
    "account_status" varchar(50) DEFAULT 'active'::character varying CHECK ((account_status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'deleted'::character varying])::text[])),
    "deletion_requested_at" timestamptz,
    "deletion_scheduled_at" timestamptz,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."wards" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "prefecture_id" uuid NOT NULL,
    "prefecture_name_en" varchar(100) NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."wards_translations" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "wards_id" uuid NOT NULL,
    "language_id" uuid NOT NULL,
    "name" varchar(100) NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);

INSERT INTO "public"."chat_statuses" ("id", "status", "updated_at", "created_at") VALUES
('454d75c3-a4e1-459f-b5a5-049a40b6295a', 'active', '2025-09-29 13:45:19.175621-06', '2025-09-29 13:45:19.175621-06'),
('7645fb50-74da-4ed9-b2ed-9fba83a691a5', 'closed', '2025-09-29 13:45:19.175621-06', '2025-09-29 13:45:19.175621-06'),
('9e5d770f-c967-4792-8be0-ce5883ae4a81', 'expired', '2025-09-29 13:45:19.175621-06', '2025-09-29 13:45:19.175621-06'),
('c0398403-6e33-4710-9fef-2fdea4d2a97c', 'archived', '2025-09-29 13:45:19.175621-06', '2025-09-29 13:45:19.175621-06'),
('c5faf949-33ac-40e5-bda9-98dbe0538a61', 'stale', '2025-09-29 13:45:19.175621-06', '2025-09-29 13:45:19.175621-06');

INSERT INTO "public"."countries" ("id", "country_code", "country_flag", "updated_at", "created_at") VALUES
('00314e1c-df97-4fac-abcf-172a1bec079e', 'FRO', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('021044c1-813c-47b8-ae66-031de670b92e', 'IRQ', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('02593d45-0d24-4f94-85a9-088049200c39', 'MDV', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('03004091-7c97-4edf-8b16-21c4f653c73e', 'ERI', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('0405e53d-f110-413b-b22c-e2ea6027623d', 'EST', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('0432c215-936e-4bd6-bf9e-09aa21e58a77', 'BWA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('04c40b7d-3570-44d1-b2f4-25c2e36f6170', 'LBN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('05b38ce6-1542-4cde-add6-a3a9839e750a', 'PNG', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('082aba35-5efd-4182-a898-febec1fab0c8', 'LBR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('0986f313-46dc-467d-aeae-6f9a4cc1625b', 'PRT', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('09c2cbe7-d18e-4620-9c18-cd9cf55c2180', 'PSE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('0a272d6d-aa53-4695-b0c2-32267c0fb947', 'NGA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('0be1aa7d-4fee-4bc4-b469-9a62f5a7394b', 'LUX', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('0d5345ff-7d4c-4ce6-89bd-a244a2f2de66', 'BRN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('0eafe1b8-1a0d-4d8c-8a41-09282084643e', 'KNA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('0f52a171-53de-4790-994e-29a7b18ee863', 'JOR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('10750f38-d79a-4e40-8cc5-c962ea20561e', 'CIV', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('10a67e80-556b-4c56-8ac5-52536aa51077', 'GRC', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('1306ba1a-ccaa-417f-a61a-ba7f7055d56c', 'ARE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('13944ee2-a1ea-4529-b869-65593b85ff31', 'JPN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('18720efe-8de4-4d9a-8fb8-2e6dcd7fe0b9', 'BGD', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('18d3ebce-4011-4985-81c2-deb993ec0b75', 'GIB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('1a38ead8-48a7-4200-ab13-6b010d290c86', 'MAC', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('1dfa3a6e-57c9-459c-9a8b-67bd186c31bb', 'CAN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('1e98cc4c-f184-4671-8189-cf70ab465dc1', 'DEU', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('20bd4f78-9ea0-4a7d-82ed-3f124640e5df', 'BRB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('21ce7a74-b786-463e-a122-579318f4f8dd', 'QAT', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('22751985-1047-494a-8a6a-f746d683ac4c', 'CHE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('22d16d27-559c-45f4-9ed5-17289dfb3427', 'FLK', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('236f4535-49df-449f-a0d3-b8ffedf7df19', 'LCA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('24608ee3-d029-499e-aa50-77b0f87ccac5', 'SLB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('252727d7-3e55-45fa-a2db-3b3ad56b8b7c', 'SYC', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('2544a77f-a60a-4125-9bb0-a7f8bf2d0b11', 'AND', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('26086be1-6236-42a9-a04e-1fa1700912e6', 'CMR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('261ff99f-2868-4d54-a295-f9c18d651701', 'SVN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('26ab45e1-3eb7-498b-a816-ba9b23f124b0', 'SDN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('2820d011-d5ec-4f7d-ae05-43afaa42b668', 'GHA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('2858af7c-9189-4162-bb86-bfa7defde8c6', 'NAM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('29569dbc-ffdd-4328-a91c-dac2ff2712e3', 'SUR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('2b5b5a83-1b1d-497e-9942-625f38dabacf', 'SRB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('2d58332d-d924-421e-90ac-f5fa2d345913', 'MMR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('2dfb2b0f-27f0-4cc9-82c0-1adb9f27abb5', 'DOM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('2e2a4c84-2163-4ecb-8fc7-d4a1d9968ebe', 'HTI', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('34ceef05-c7c1-413f-b01d-7a770d1605eb', 'ROU', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('35ca413a-9f27-4a24-8eec-ef39ff2c56a3', 'RWA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3639d313-0fe3-484f-a5fe-3be4d1a58991', 'OMN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('37ae151f-43a7-4217-a096-5f95afd0c3dd', 'CHL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3853637a-7412-4beb-951e-e0437b02b856', 'PRY', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('38913c21-9a81-4582-8dde-a6515b5f1ac8', 'SHN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3986b121-04e3-4eb7-bc0c-7b2462406ff9', 'NCL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('39d721f2-afb6-4e11-a232-5f54813fe8a9', 'VGB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3af52a3b-53a7-4b84-afad-34d43c8a9197', 'BHR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3b37d6ac-e023-4bd4-b08b-5be9c7866e98', 'CZE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3b58a761-ea91-4db5-8c2a-636ddc1d7837', 'TUV', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3c821ff0-cd23-4c9e-b320-88272628d041', 'PRI', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3e397dad-ac0e-4661-b284-61cc9bbd273f', 'CYM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3e4312b1-ca33-4d8c-a86a-9b511ba907fb', 'VNM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3e6dc308-d332-4eb6-ada3-cf46437c7bcf', 'TJK', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('3f05e3cd-b573-4a52-bb49-8fad2744080c', 'BEL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('408f8602-3f42-40dc-b48e-83bd18979ecd', 'AZE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('44b4f2bd-d345-4420-9a2c-c0ef87ded77a', 'MUS', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('455b16dd-3f5b-416f-8290-64385d959b1a', 'FJI', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('46651e96-eb8e-47ff-ae6c-1779c160ed27', 'HND', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('4927b92b-d266-4e59-8088-d7808073599b', 'CUW', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('496546ce-2082-4f0e-ac27-6016089b3f94', 'MNE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('499e44bd-e69d-492e-b8b0-ccde0ddcb842', 'SVK', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('4cfd4650-52c6-40b6-95e9-45c4a1598155', 'BMU', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('4e0826ca-0f51-473f-a778-d2d78e384b84', 'YEM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('4e4714a3-313c-477c-a499-24e6e717c740', 'DNK', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('506b4add-84af-42b0-9fbb-8f0ecb9ca8b7', 'MHL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('5081896e-4c8e-4f12-9138-7b5d02614686', 'IND', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('526ed5c5-410e-4330-ace7-048450bfa67f', 'LTU', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('532efb34-604b-4c3e-9809-f4afbdf1d478', 'ECU', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('54115d47-8b62-473f-9c6d-246454005771', 'AFG', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('566d1adc-7c9c-43ea-815b-e7d24ccb3982', 'ETH', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('588c9d6f-1508-489b-98b7-246967b9a36b', 'MLI', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('58afa50e-22d8-417c-a6bd-04ee1ffc5332', 'CPV', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('5a358009-3d79-4249-834a-9e95c2af9a63', 'LBY', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('5a50baf8-84b2-4158-92cf-77ff281c39a6', 'AUT', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('5c94851f-a2eb-4167-8a1c-c098be2bc49c', 'TWN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('5dd10424-a539-445e-96ca-0bae73f66d62', 'FSM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('5e7ca5aa-ebd3-46eb-a9b5-5f3b9d46eeb1', 'AIA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('5fd7cc85-d323-4413-a951-3c9ee9b590e1', 'IMN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('613a4e26-f472-452b-b143-3b5d8a5455b0', 'PHL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('62408cee-3e6e-4f0b-8fe9-b843ad7e789f', 'BLZ', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('667487fe-e4d8-49ae-9021-f3b3d9ba74b7', 'BTN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('67665a4f-d2bd-4d16-bc62-f070accd4fa8', 'FRA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('68fde868-9a07-47f2-9a48-66d0a80df395', 'NER', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('69aec785-849f-46e1-ad7f-5d7cfb55c6b8', 'MOZ', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('6c54ff41-ed43-4e4c-9bb5-ce0fd5c8d8d2', 'WSM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('6d93bb49-8d94-43f9-8a0a-9c14c5f6a9d2', 'VUT', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('7197629b-4d4c-4ace-87f5-7698ce6c622c', 'CAF', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('729bdb6c-fe43-47d5-b807-32b2bdc1efe3', 'GEO', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('7447405a-9b8e-4092-8708-57ac82c442fe', 'DJI', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('74546421-5eec-411a-b395-b7ba09dc90be', 'MNG', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('746746cc-006a-4cec-980b-1b05087de25e', 'TTO', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('7671f10c-947c-4df2-a5a2-1db7e4af939c', 'SGP', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('7689e70a-53d1-4104-a98f-202e4ed66704', 'LKA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('771a6dee-06ba-41aa-875d-ae59df2c2275', 'PAK', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('7916729b-dbfc-4cfe-ba6c-2e327b21b542', 'BFA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('7c8e55f8-39f0-4594-97bd-eebc117147e5', 'SYR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('7d000b67-2570-4a2a-afec-6917a31b5a07', 'TUN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('7e44a217-9c27-43f9-910a-042e38a4689e', 'MRT', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('7e677f97-623b-44fe-8b66-b437040b7de6', 'MSR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8019cdd3-f1c6-4694-bef5-0d649f994589', 'ZAF', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('824220bb-9348-4fff-af99-15b8ab63ce87', 'MYS', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8371feb1-9af9-45e9-91a0-04d7fad948c5', 'COD', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8489531c-9b3d-4312-b4a1-c8b5246b0012', 'SOM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('84b91c12-a917-4580-a206-7bfc24b78411', 'JEY', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('84e2f19a-ba02-4a61-95f8-f02113bb066d', 'POL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('85308d30-498d-4b3a-ab9f-0b30648d9fc5', 'ATG', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8679bb5e-39f0-4f40-b7d9-ef6281fb3af4', 'BLM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('87218f31-9c07-4736-8d6b-b5199da85019', 'LAO', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8732dbe9-e03f-4497-8d8a-76dcf9909731', 'KOR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8789dbf0-8dc2-4641-8195-e85550732dbb', 'SLV', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('89aaa981-700e-40fe-be1d-5870446e20ad', 'COL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8b8a010f-3f45-4ce1-ae9a-edf10c1d80bf', 'FIN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8b981b3a-2242-40ac-9155-7c9340820b14', 'TKM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8c42878f-ad5b-47f4-84ff-cb8aae865601', 'URY', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8c628198-8e95-4705-a4dd-06f23debc881', 'RUS', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8cd869ad-e71e-41d7-a501-4ec5b3a7d7b5', 'SAU', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8e114485-03d2-45c8-b997-a2a772283a4e', 'TUR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('8fe6201e-691e-4ccb-b102-b22e6de8fa0a', 'CUB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('901bbceb-bee5-4257-b729-d32ed20ec265', 'BDI', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('90991fca-5974-4be0-8aaf-6979b2622388', 'NPL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('90c7d957-4f93-4bab-9875-907c80e56b9a', 'LIE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('925618f5-00b9-411d-bf3d-a08db4ced221', 'COM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('93176be7-a93e-423c-88f9-f1018a431449', 'AUS', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('93535627-74c7-4c94-bdc4-11b2081ecbd2', 'MNP', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('94445ff0-8497-4107-af67-8329627c45bf', 'MCO', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('954adce9-97b5-43b4-9342-e0cf65ccd16b', 'MKD', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('95f9b719-5a8b-4ceb-bf9c-f6392184f32f', 'ZMB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('966fc359-d3fb-450d-8dc4-4ebfc61e9c14', 'ZWE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('972588d2-1294-4972-8396-26bcb8b1e5d8', 'UKR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('97283444-9f38-4e78-beba-1332d57c1e93', 'SWE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('9795e878-ce1d-45f7-a8ba-5cadf1b647c3', 'GTM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('97cbe8c1-907c-4e8c-b185-06a39d966668', 'NOR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('981c9a3e-8511-4be0-8506-fa8810322a98', 'PLW', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('982d59a9-fe54-4194-a72c-63305ef40023', 'JAM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('9836148e-aa12-4998-b72c-02211674c911', 'STP', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('996401ee-abed-40cd-b0c0-17d5c5f5e3c2', 'ALB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('9c3acf77-46b7-4f4c-be62-ec2e9563fdb4', 'ARM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('9cdbb28d-d0f3-4ce3-8cdf-67b47ad158b4', 'KAZ', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('9d88a583-4f0a-423f-a3e4-6f7ce8569eb1', 'COG', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('9f3103cb-5bae-491c-82df-d9734c9eb363', 'GBR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('a0023895-b5f0-4469-b59d-726ae2cd8bf9', 'ABW', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('a2199dbf-a324-47d3-ac61-3088acb3ce3c', 'HKG', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('a2a1b1dc-d932-45ad-8588-2b179aa4e2f6', 'GMB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('a3d6e5b8-6401-405c-88c2-196fc2f095a6', 'TCA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('a761838d-db7e-4090-8e27-ea30ef10266f', 'PER', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('a7cc3ecb-6cd0-4af6-9a6b-428c721bc5d2', 'MDA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ab7d9887-29ca-496d-9377-bc02b20f4b2f', 'TZA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ac8122c3-361f-4128-a385-570855f2d977', 'KIR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ace2d96a-a46f-43f1-bf98-cb5a2d1a73bf', 'LVA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ad9f79e9-aa4c-41cb-abe3-f03cc6060c79', 'GUY', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('aed856d3-f02a-4861-87a3-77545755d91a', 'MDG', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('af2a9321-ec36-44f9-bebb-737965034771', 'GUM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('b27881af-dc99-419e-b29e-a2b3f0055745', 'KWT', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('b33e6ccb-3821-46dd-84d2-a06b3db2ec95', 'BGR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('b48a48cf-cede-4bee-9072-6794ce02bbf4', 'VIR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('b5cc9686-679d-47ae-8539-df4b2e30d6c4', 'AGO', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('b761c69b-fa93-4136-94c7-1b381dc13cbf', 'GAB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('b7d58aad-d614-423f-bbc4-1447040c2468', 'NIC', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('badab895-0af5-44dc-b96c-7c9a80162680', 'GIN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('c327bf37-6f2a-41ed-9750-ce18bbac2fed', 'BHS', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('c57a1f34-c62e-475c-9d88-cab154debb03', 'SEN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('c652e8fb-adfe-4b09-a575-3fb41db09b62', 'TLS', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('c7747916-872e-4107-87ee-753764d45654', 'KGZ', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ca67ec28-4998-4118-ba34-6b70c6d7957a', 'HUN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ca87bb31-6743-4c71-bc45-669bc1271957', 'TGO', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ccee84e0-f7e9-477f-aec3-4ac6ddc1e8ed', 'SWZ', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('cd0d9400-854f-43a4-a31c-7d8262d4bdbd', 'USA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('cf61d778-2635-4bee-ad7b-803feb8da689', 'VEN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('cf97d546-cf91-42a6-8150-04b778521d81', 'SMR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('cf9dd3c2-7562-4954-93da-20789e62d7c4', 'LSO', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d012ba28-77a9-466d-9746-a5a603f36b0d', 'UGA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d0cc3a95-fe2f-4aec-87bc-5ecfd31f2a4e', 'KHM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d11d5d88-a565-4b1c-b612-d4240398555f', 'GRD', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d337f72c-b5a8-4b49-b598-446cf981aa81', 'BRA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d448ad22-e37a-4358-9e2b-72822957b600', 'ASM', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d49258c9-c8e7-4664-b8e5-811e34977337', 'BOL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d521e998-ae7e-4448-bbdf-c010a3db23a5', 'ESP', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d5a9eaaa-c6ea-4eaf-87b3-5e7f693783ee', 'ISR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d5caae5d-da7e-4291-8ebd-f09866c5b961', 'CHN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('d9b18987-dcf2-4daa-9e8a-2fcda61af321', 'SLE', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('da2df2f2-6cc6-4bfe-baa8-9ccc97ad47cf', 'MWI', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('de995b09-1ec9-4dc9-91bc-f850c6c5d7d3', 'NZL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('e09c916c-5740-43ce-a096-857e97c3bd08', 'NRU', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('e32709ca-ea35-4126-98b7-a1f08b65dc47', 'DZA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('e330a9d8-2e23-4090-9bb8-018a27e52627', 'EGY', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('e44455e3-2a5c-486c-bf9c-485d40070c5c', 'THA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('e45632e4-c957-4044-897b-6b61bf5471d4', 'CRI', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('e6f59077-47fc-41c0-a237-716951828f6a', 'PYF', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('e8046318-09f1-4166-a9ba-19c606c1b7b0', 'NLD', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('e891fd9c-82fe-4981-b779-d666ece5bc57', 'CYP', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('e9b3b682-a19c-420b-a456-d18a6edf49c3', 'MEX', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ea52c7d9-f146-47bf-b79f-8b7d78cfdcb5', 'PAN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('eaf712c6-c7e2-4f29-ae7c-4cd315c1fd7f', 'GNQ', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ebab532f-8b03-40a6-916d-135d8ae6d0d0', 'XKX', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ec54c1f9-afbf-4af6-a433-2975ef7260e7', 'ITA', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ec5ba2c0-5cbe-4fee-adc2-22113a2e4684', 'KEN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('ecf1d0f9-8307-430c-92af-b73aee30509e', 'IRN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f117c3e7-f73e-41c4-92fb-ff7832230ca9', 'IDN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f16b5e33-da43-48ae-8aab-975695af155b', 'MAR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f26be482-43cc-4e3c-b22b-38e551ac11e3', 'SSD', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f2de81e7-8529-4247-a05e-0a046d63293d', 'HRV', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f3eb7d71-0629-4b07-892d-9480dd77b238', 'ISL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f41994f8-6aed-4bfa-b3cf-25931e5db619', 'ARG', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f5256d12-5b54-40e8-918a-ce452acf5247', 'IRL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f5715803-dfd6-41e8-91cd-f6c42dfed983', 'BEN', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f5c862b3-754d-4e40-8bf4-8ae56dd1d2d0', 'TON', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f6b92026-d14e-46ac-974d-12a41bc50f8e', 'UZB', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('f9463b4e-9260-4b3f-a026-a7dba7b43664', 'BLR', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('faa4a1e5-dd49-4d90-96bc-3e4bcf460783', 'MLT', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('fb31419f-ef53-4649-8e6c-eb3c25098e1f', 'TCD', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06'),
('fe0aa8b6-0c5a-49cd-9ce4-811f4bfbf660', 'GRL', NULL, '2025-09-29 16:58:51.994941-06', '2025-09-29 16:58:51.994941-06');

INSERT INTO "public"."employment_statuses" ("id", "status", "updated_at", "created_at") VALUES
('1ea9fdfe-3775-4395-bf9e-76dd60a4e46e', 'unemployed', '2025-09-29 13:45:19.17535-06', '2025-09-29 13:45:19.17535-06'),
('3ebdbe97-a22f-49b8-9ea3-ba4b188b416f', 'part-time', '2025-09-29 13:45:19.17535-06', '2025-09-29 13:45:19.17535-06'),
('55515785-5126-4bc7-b9cb-2f6d82240209', 'freelance', '2025-09-29 13:45:19.17535-06', '2025-09-29 13:45:19.17535-06'),
('a326d926-c9b3-4e7e-bc2f-02b1441cf307', 'salary', '2025-09-29 13:45:19.17535-06', '2025-09-29 13:45:19.17535-06'),
('a3bd9b31-c276-482c-bd5b-72c8ab64cdcf', 'student', '2025-09-29 13:45:19.17535-06', '2025-09-29 13:45:19.17535-06'),
('d6cf381e-4ce4-4530-a879-c43adbb27246', 'hourly', '2025-09-29 13:45:19.17535-06', '2025-09-29 13:45:19.17535-06');

INSERT INTO "public"."employment_statuses_translations" ("id", "employment_statuses_id", "language_id", "translated_status", "updated_at", "created_at") VALUES
('1cdd4ef6-2b96-4223-a3a6-95d307a548ba', 'a3bd9b31-c276-482c-bd5b-72c8ab64cdcf', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '学生', '2025-09-29 17:32:47.280229-06', '2025-09-29 17:32:47.280229-06'),
('20ccb9e8-c166-46bf-a5c6-069e8e78582f', '3ebdbe97-a22f-49b8-9ea3-ba4b188b416f', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'アルバイター', '2025-09-29 17:32:47.280229-06', '2025-09-29 17:32:47.280229-06'),
('2fe78bf5-f4de-41d0-8268-4ad14352ba68', '55515785-5126-4bc7-b9cb-2f6d82240209', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'フリーランス', '2025-09-29 17:32:47.280229-06', '2025-09-29 17:32:47.280229-06'),
('9b618394-2b38-4a27-9c94-4a3f35e1e329', 'a326d926-c9b3-4e7e-bc2f-02b1441cf307', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '給与', '2025-09-29 17:32:47.280229-06', '2025-09-29 17:32:47.280229-06'),
('b3293f88-163a-4083-b222-11a483c82211', '1ea9fdfe-3775-4395-bf9e-76dd60a4e46e', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '浪々', '2025-09-29 17:32:47.280229-06', '2025-09-29 17:32:47.280229-06');

INSERT INTO "public"."floor_plans" ("id", "type", "updated_at", "created_at") VALUES
('1a4bc4bb-10a3-4e46-a644-8846b4ecd940', '3LDK', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('1f0b3f97-b0c6-431a-b92e-19d10c332851', '3SLDK', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('67a69da4-698c-4dfb-b258-a48accb9e844', '2LDK', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('702edb6c-284e-46b9-a6e4-6187a4db6bc7', '1DK', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('73afc3cf-5475-4232-83d4-99bd264fea9f', '1DK+', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('ace4c7ab-3cab-4ef9-a343-7f82ad27ad7c', '3DK+', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('af68ecd0-7d27-4c3d-87c9-adf4f08fa4a9', '2DK+', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('bcef015d-da8d-41c7-a0b5-c7b0e7f0f488', '1SLDK', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('bde8a5ba-b166-40fb-9023-4c4b950a88f3', '2SLDK', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('dd461f9f-c688-4db2-8086-ecf518c57376', '1R', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06'),
('e5ac588d-d77d-43e1-8e9f-c7506be75f74', '1LDK', '2025-09-29 17:36:21.818152-06', '2025-09-29 17:36:21.818152-06');

INSERT INTO "public"."floor_plans_translations" ("id", "floor_plans_id", "language_id", "description", "updated_at", "created_at") VALUES
('059f32c3-e4e6-4c69-94ee-3c6d88c9ae6c', '1a4bc4bb-10a3-4e46-a644-8846b4ecd940', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '独立したリビングルーム、ダイニングエリア、キッチンを備えた3ベッドルームアパートメント。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('07a6e89d-3259-4a05-9cb9-cc53fdc0b19b', '702edb6c-284e-46b9-a6e4-6187a4db6bc7', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A studio apartment with a single room that serves as the living room, bedroom, and kitchen.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('0e1e961b-e7ff-4826-8e60-aa33094f198c', 'bde8a5ba-b166-40fb-9023-4c4b950a88f3', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A two-bedroom apartment with a separate living room, dining area, kitchen and a small storage area.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('0fe240ba-992b-4fb2-8094-c9357eaea887', 'ace4c7ab-3cab-4ef9-a343-7f82ad27ad7c', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '3ベッドルームアパートメントには、独立したリビングルーム、ダイニングエリア、キッチン、追加の部屋があります。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('1102b92f-1c82-477b-998a-991c56fc70cf', 'bcef015d-da8d-41c7-a0b5-c7b0e7f0f488', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A one-bedroom apartment with a separate living room, dining area, kitchen and a small storage area.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('145b6d0d-41e6-4edc-99a9-14b118b92f84', '1f0b3f97-b0c6-431a-b92e-19d10c332851', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A three-bedroom apartment with a separate living room, dining area, kitchen and a small storage area.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('208d5a73-694b-487f-a9dc-c1dfc23d6c09', 'af68ecd0-7d27-4c3d-87c9-adf4f08fa4a9', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A two-bedroom apartment with a separate living room, dining area, kitchen and an additional room.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('318d281a-0d16-41ff-a44c-15f477db1b15', 'bcef015d-da8d-41c7-a0b5-c7b0e7f0f488', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '独立したリビングルーム、ダイニングエリア、キッチン、小さな収納スペースを備えた1ベッドルームアパートメント。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('36b26f51-47c4-412e-b668-005efd306088', '702edb6c-284e-46b9-a6e4-6187a4db6bc7', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'リビングルーム、ベッドルーム、キッチンを兼ねたワンルームのアパートメント。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('4f948fe5-4720-4a80-81e0-7e593900033e', 'e5ac588d-d77d-43e1-8e9f-c7506be75f74', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A one-bedroom apartment with a separate living room, dining area, and kitchen', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('552b45bc-d895-4e7d-bc68-266fff34087e', '73afc3cf-5475-4232-83d4-99bd264fea9f', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A one-bedroom apartment with a separate living room, dining area, and kitchen and an additional room.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('68334d89-3b38-451a-b757-31c2b60bb2c1', 'e5ac588d-d77d-43e1-8e9f-c7506be75f74', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '独立したリビングルーム、ダイニングエリア、キッチンを備えた1ベッドルームアパートメント。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('75ce4ea4-7c25-4a3d-ae5e-d4a4c1bdc59f', 'bde8a5ba-b166-40fb-9023-4c4b950a88f3', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '独立したリビングルーム、ダイニングエリア、キッチン、小さな収納スペースを備えた2ベッドルームアパートメント。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('8a68a8d1-56ab-443f-87a3-a38abe2af0d8', '67a69da4-698c-4dfb-b258-a48accb9e844', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A two-bedroom apartment with a separate living room, dining area, and kitchen.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('95035c76-710b-40a6-b18e-a7b0d165c0e4', 'dd461f9f-c688-4db2-8086-ecf518c57376', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Only one room from which the kitchen and bathroom are directly accessed.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('c1d40d02-8d3d-455a-b4b9-1c30c9df8b2b', '67a69da4-698c-4dfb-b258-a48accb9e844', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '独立したリビングルーム、ダイニングエリア、キッチンを備えた2ベッドルームアパートメント。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('cd8f8574-0e2d-4a33-9bf2-615d7885bfc2', 'af68ecd0-7d27-4c3d-87c9-adf4f08fa4a9', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2ベッドルームのアパートメントで、独立したリビングルーム、ダイニングエリア、キッチン、追加の部屋があります。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('d3fe1d34-e784-4c7a-bbe1-8ceb648928c0', '1a4bc4bb-10a3-4e46-a644-8846b4ecd940', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A three-bedroom apartment with a separate living room, dining area, and kitchen.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('d4bfb1ef-889d-41b0-ba9f-eb3d67c6fa32', 'ace4c7ab-3cab-4ef9-a343-7f82ad27ad7c', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'A three-bedroom apartment with a separate living room, dining area, kitchen and additional room.', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('e3b47eae-7082-4bfa-8cb3-9a30444f5786', 'dd461f9f-c688-4db2-8086-ecf518c57376', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'キッチンとバスルームに直接出入りできる部屋は1つだけ。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('e45163d9-57fb-47a8-af35-c7ab26ca6145', '73afc3cf-5475-4232-83d4-99bd264fea9f', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '独立したリビングルーム、ダイニングエリア、キッチンを備えた1ベッドルーム・アパートメント。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06'),
('fda98cba-dd42-4bed-aeb3-746267ab8971', '1f0b3f97-b0c6-431a-b92e-19d10c332851', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '独立したリビングルーム、ダイニングエリア、キッチン、小さな収納スペースを備えた3ベッドルームアパートメント。', '2025-09-29 17:57:14.425747-06', '2025-09-29 17:57:14.425747-06');

INSERT INTO "public"."languages" ("id", "language_code", "language_name", "endonym", "is_supported", "rtl", "updated_at", "created_at") VALUES
('1373546d-cba2-4fd2-9df9-27dbd66706ed', 'en', 'English', 'English', 't', 'f', '2025-09-29 13:45:19.174132-06', '2025-09-29 13:45:19.174132-06'),
('dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'ja', 'Japanese', '日本語', 't', 'f', '2025-09-29 13:45:19.174132-06', '2025-09-29 13:45:19.174132-06');

INSERT INTO "public"."prefectures" ("id", "name", "language_id", "updated_at", "created_at") VALUES
('070d93b3-259d-484d-ade1-635e7ff1715c', '山形県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('0866e6bb-b0b4-4f2b-b38a-94bfea719ef6', 'Iwate', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('13dc9958-41e9-4ae8-82a4-fe54adf302af', 'Kagawa', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('16332e17-6b6b-4161-bc43-4125ccd6a7e8', 'Ishikawa', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('17509699-e465-4646-9335-750e76832418', 'Miyazaki', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('1991ed6a-73bc-4d51-ad28-10439df94ec6', '大分県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('229f533b-ba49-4324-93b8-d9e05ff9bc45', '愛知県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('2378416b-266c-4c6f-bc33-a2d0c96f490b', 'Hyōgo', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('23adba78-b7a0-4975-aa11-c56512340d98', '京都府', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('25bccbcf-f936-48ce-9f55-98f88718b776', 'Aichi', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('27853b0b-d906-44bf-985a-0fe44c7a5cb4', '千葉市', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('29aaaa28-b694-4f54-927c-c9dc5b7e43ba', 'Akita', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('29bfbe3a-65cd-4103-bfbc-1de7e24ea081', 'Mie', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('2aa48943-5f3a-403a-967f-d4f33090db65', 'Wakayama', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('2d931162-b48a-4354-9790-0834d47ae297', 'Okayama', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('2da38606-90d2-4d76-bd90-674006732452', '東京', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('36783f12-7b1d-4a97-8e33-eb4d22da69ec', 'Tokushima', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('42904c19-ea8d-4e75-8040-fd280c4f2b78', '北海道', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('44d7a069-3a8c-4e34-84f1-b4e8b1b8a764', 'Fukui', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('4596aad7-6c6b-4f78-a851-a996f334b1d4', '愛媛県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('473218b5-1c8e-41cd-80b3-8c5854a53b3c', 'Nagasaki', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('4884c406-0bd3-4671-a9dc-bb4d7ca53ed7', 'Ibaraki', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('48c0d3f8-933e-41fe-8681-ce42254e1024', '熊本県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('48c9dcd4-7187-4e49-9689-94ad29d27519', 'Saga', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('496c08c9-b92d-4264-bf47-a7271efbcf8b', '山梨県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('4a10f292-cbe0-4a4f-a8fa-0fc958364ed3', 'Nara', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('4abad5be-788b-4224-868b-e346b48944bb', '滋賀県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('4baf5448-4382-40d2-b57c-3f5006a58b23', 'Miyagi', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('4def3505-2114-49f8-aa03-1a88cef07f61', '佐賀県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('4f1c1bda-1b6d-4bad-b7ed-ca1c85f61176', 'Hokkaidō', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('5173b5d7-3a7d-4f3a-8a1e-ebebcae2bb80', '徳島県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('521f2ea9-19d8-4478-b358-900ccbdd8af4', '宮崎県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('53d0e107-a889-4f96-a315-b0d1ce42fe76', '岐阜市', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('565c77ff-c677-4c1c-bc15-625e71f87bf3', '福井県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('5c7214c3-9b6a-47f9-bdad-91d0f51a17c2', '長野市', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('5d3265a7-d631-4781-b232-5c9c5a38e1e8', 'Ehime', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('6069afe1-d341-4793-9abe-b05f1ca18ab4', 'Chiba', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('63125d25-b374-4a1d-a8e4-bf5350af91a3', 'Saitama', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('64a4b34e-4e9f-4d73-8ba6-304cd87b6074', 'Shiga', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('69b39f2d-ccd2-4ac2-81dd-9864c2f3d619', 'Shimane', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('705e58a4-b561-42ab-aca0-a62035363ef1', '宮城県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('76596e4c-9698-4084-a2b8-dfcce9330e36', '岡山県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('774f61de-c0b5-4bfa-ac83-eb7f8ca32b6a', '長崎県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('7e6dad4d-b647-4892-ac92-9521d253a641', '島根県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('84525356-5954-4ea7-b6e4-ccb4058b1225', 'Kumamoto', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('84ebfc29-143d-4c30-b20a-fa945a60a4e1', 'Gunma', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('870fde92-90f7-42b3-9989-97020d15753f', '三重県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('89ddca2e-804a-43b1-921e-f95027a359f3', '大阪府', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('90827946-7819-42cc-a5bc-3f1d8d5aba16', '秋田犬', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('920b20f7-0771-4818-aedc-dedcf64e5b0a', '富山県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('953d14c3-fc9e-4c86-8008-70db7a05a564', 'Yamaguchi', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('95f97ae1-7b20-494e-8bf9-ac1322d3eb7a', 'Gifu', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('981628f3-5f5d-4d0f-a38f-44b039611fcf', 'Niigata', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('9dba51d3-5ae7-4b64-a05d-7876fc8f5288', '埼玉県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('a0a6b8a2-d5a8-4829-9ff2-9a45a6caf58a', '高知県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('a253c6f1-d771-42d8-8e72-90d882d842db', 'Kagoshima', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('a5ef3fe9-9006-4707-a06c-c3f544af47ef', 'Tottori', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('aa6dba18-c72e-4413-8c83-47e61f53ce6a', '新潟市', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('ab3258f5-ec42-4079-a84c-18ecf2e586c4', '鹿児島県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('ab5d8e69-d227-4dbc-b0c7-35945f093158', 'Ōita', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('ad47bd9c-1851-4e50-bbc2-ed6f7cb68609', 'Tokyo', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('b40e3ae4-11b6-4f04-8244-2de69d9d62bf', '青森', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('b5267871-bd43-41d2-ae93-96ca21b56fb3', 'Kyoto', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('b64b6ecb-7f66-4a68-955c-4f559ba458a6', '広島県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('b6e155f2-4f22-4500-a58a-72b135125e7c', '沖縄県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('b85fcd0c-8c84-4560-a2b2-86e08b097e40', '栃木市', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('bd420a9f-ff68-491c-a12f-61bae4be352d', 'Osaka', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('c2505f69-c5ba-4916-b416-5f341bd574bd', 'Kanagawa', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('c598c2c8-f38b-4876-ade5-495cce1834d1', '奈良県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('c6ffa4be-6ca1-4140-90b4-0e80925f2c2e', '(石川県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('ca9cec5a-599b-42b0-925b-b23463fc3511', 'Toyama', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('cb106f50-79c1-4252-88fb-9594b5e3c3b8', '兵庫県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('cb86b962-b446-41f2-9ac0-f78a94f3952b', '鳥取県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('cc9b8059-cc29-47ac-8b9c-c17534808169', 'Fukushima', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('cfa66523-67e0-47b4-877b-ea57ab28b0f5', '神奈川', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('d138d4da-abf3-4ba3-8771-b34b74e32ad0', '静岡県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('d1dcc51b-c30c-4e52-bb3b-f37f3237625f', 'Fukuoka', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('d403985f-0c80-481b-b3d8-abdedffa63fb', 'Aomori', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('d48d64c7-7e62-463f-9313-a1a9b3f43084', '岩手県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('d5f98dfe-c488-49e2-b980-68e8bfaa8683', '山口県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('d6538fca-dde6-4fae-b477-e529d16ac50c', 'Okinawa', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('d76769a6-8c83-44c6-8ffa-6fa0ecf4e327', '和歌山県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('d9a82728-1472-47b2-92ed-dfce07d64414', 'Nagano', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('d9b524ef-4cfa-4dc7-80aa-bf7cf12d586d', 'Yamagata', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('db385cac-ef11-48a8-929b-7939097beebf', '群馬県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('de62b11a-f610-45c9-9e91-4409e4fd66f6', 'Tochigi', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('e67a6720-1feb-4cf4-95af-37bffcc9456d', 'Hiroshima', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('e90f9eee-4bc4-424d-8bf1-31541f13c67d', '茨城町', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('e99ecc92-f87b-4900-b89f-75bbde30908b', 'Yamanashi', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('ea5d7ac7-7125-4c7f-83c9-85117d0c572b', 'Shizuoka', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('eb0645db-02d0-454c-b752-9a0e65e37246', '福島市', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('efed3c61-d3b8-436c-a5b5-059539d7c192', '香川県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('f2c88a3c-c782-42e6-9f6a-6f3664e65a8d', 'Kōchi', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06'),
('f8f34227-76d6-41e6-b177-157ec4923400', '福岡県', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2025-09-29 20:06:23.181466-06', '2025-09-29 20:06:23.181466-06');

INSERT INTO "public"."prefectures_translations" ("id", "language_id", "prefectures_id", "name", "updated_at", "created_at") VALUES
('0027cb53-4acd-4353-9682-e72c13e34373', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'ab5d8e69-d227-4dbc-b0c7-35945f093158', 'Ōita', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('07aa9c90-7e09-4bd3-822d-371e21c3cbbc', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'bd420a9f-ff68-491c-a12f-61bae4be352d', 'Osaka', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('0835a671-bc23-49a7-886e-d4791ee0981b', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'eb0645db-02d0-454c-b752-9a0e65e37246', '福島市', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('0954f368-9df2-47e9-aa7e-fcdacabb562d', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '89ddca2e-804a-43b1-921e-f95027a359f3', '大阪府', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('095f5492-3b1b-4e98-9ac5-0ccac66a8431', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'ca9cec5a-599b-42b0-925b-b23463fc3511', 'Toyama', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('0a656448-31c7-4826-a8c1-883a99ba19f0', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'db385cac-ef11-48a8-929b-7939097beebf', '群馬県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('0fae5bba-2d07-4561-b4a9-c5d659586856', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '84525356-5954-4ea7-b6e4-ccb4058b1225', 'Kumamoto', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('14bb3e25-b48b-45f4-9c7e-1fb7acd8dad6', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'cb86b962-b446-41f2-9ac0-f78a94f3952b', '鳥取県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('19afa818-4b80-4012-a28d-50562305a4e8', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '23adba78-b7a0-4975-aa11-c56512340d98', '京都府', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('1c0e5ad2-96ed-44d0-a441-fcaf150e40a1', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '4a10f292-cbe0-4a4f-a8fa-0fc958364ed3', 'Nara', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('1c926ef9-b0eb-4f05-8188-f9d67fe63958', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'ab3258f5-ec42-4079-a84c-18ecf2e586c4', '鹿児島県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('1cf9f5f8-62c6-411f-95e7-916d623a4f27', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '4def3505-2114-49f8-aa03-1a88cef07f61', '佐賀県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('24add196-adc6-4441-bb0b-e4dff00e26d7', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '4596aad7-6c6b-4f78-a851-a996f334b1d4', '愛媛県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('2616802c-c4d4-49e9-8e8c-a71121f02910', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '4baf5448-4382-40d2-b57c-3f5006a58b23', 'Miyagi', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('272c9c50-b355-46df-a5c3-dcd4ccae63df', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'aa6dba18-c72e-4413-8c83-47e61f53ce6a', '新潟市', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('2734e0ab-a0ab-46ac-b5d1-d40459bfc1f7', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'd403985f-0c80-481b-b3d8-abdedffa63fb', 'Aomori', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('28fdf7ea-162f-4a9b-b80b-ca6405164444', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'd48d64c7-7e62-463f-9313-a1a9b3f43084', '岩手県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('2996b6e5-7da9-4184-852e-653451a7f6bb', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'cfa66523-67e0-47b4-877b-ea57ab28b0f5', '神奈川', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('2a9b75c7-665d-43fc-92b7-a906e8f9547e', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '5d3265a7-d631-4781-b232-5c9c5a38e1e8', 'Ehime', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('2d09cce2-3946-4e5c-a39d-864f593222c9', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'cb106f50-79c1-4252-88fb-9594b5e3c3b8', '兵庫県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('345590dc-7c77-4968-b646-86e35db586f0', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '17509699-e465-4646-9335-750e76832418', 'Miyazaki', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('3dc29fd9-176d-4427-8bbd-d5d6734596b4', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'd9a82728-1472-47b2-92ed-dfce07d64414', 'Nagano', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('3e0f7fe2-433a-4aff-83d3-95f7a65dfca3', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2d931162-b48a-4354-9790-0834d47ae297', 'Okayama', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('3fd6e5fb-e163-4a1f-907b-d00b560770c5', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '521f2ea9-19d8-4478-b358-900ccbdd8af4', '宮崎県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('4202069a-0193-4d5f-8654-c3a00a7dabe9', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '565c77ff-c677-4c1c-bc15-625e71f87bf3', '福井県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('44dfbe91-46d5-4e73-9da4-1b8cd6aaea33', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'a253c6f1-d771-42d8-8e72-90d882d842db', 'Kagoshima', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('4c04223b-f772-472b-acd4-030ad03da52c', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '953d14c3-fc9e-4c86-8008-70db7a05a564', 'Yamaguchi', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('503dc0e9-3f3a-4380-aaf4-94f02e02d37d', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'b6e155f2-4f22-4500-a58a-72b135125e7c', '沖縄県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('514cd124-80ef-4de7-84f1-941f56dfa5c8', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'e99ecc92-f87b-4900-b89f-75bbde30908b', 'Yamanashi', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('5197be6a-701c-4f59-a94d-141288dd0271', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'e90f9eee-4bc4-424d-8bf1-31541f13c67d', '茨城町', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('5346a1cb-1f00-4dfc-aa55-b0fc5c25d976', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '5173b5d7-3a7d-4f3a-8a1e-ebebcae2bb80', '徳島県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('53c61574-6fe0-4356-9cf0-01fef19c7bb9', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '69b39f2d-ccd2-4ac2-81dd-9864c2f3d619', 'Shimane', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('58620f12-9dc6-46f6-9fa1-1a86e1063e7e', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'c6ffa4be-6ca1-4140-90b4-0e80925f2c2e', '(石川県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('596a5f5b-dadd-4ce4-8e02-a57d0f2d7edf', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'efed3c61-d3b8-436c-a5b5-059539d7c192', '香川県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('5a7f4efb-b986-40fb-a8db-d9f3475d1aec', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '870fde92-90f7-42b3-9989-97020d15753f', '三重県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('60944350-95dc-4402-9606-33a86864e60b', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '4f1c1bda-1b6d-4bad-b7ed-ca1c85f61176', 'Hokkaidō', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('648dc0df-7b5c-4672-bfb5-721b4a15f54f', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'd76769a6-8c83-44c6-8ffa-6fa0ecf4e327', '和歌山県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('668aec44-ba68-4c67-8f96-1e8a00e21f74', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2378416b-266c-4c6f-bc33-a2d0c96f490b', 'Hyōgo', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('6b9a5cd9-0d62-46b2-8afc-f5cb536248ce', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '64a4b34e-4e9f-4d73-8ba6-304cd87b6074', 'Shiga', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('6c9acb36-164f-4452-91c3-27f2360ec2d8', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '29bfbe3a-65cd-4103-bfbc-1de7e24ea081', 'Mie', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('6ee3c749-fe4b-45f0-b142-bedffbf1c62f', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '84ebfc29-143d-4c30-b20a-fa945a60a4e1', 'Gunma', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('6ef260bd-694d-473e-912a-bd6e742755cd', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '774f61de-c0b5-4bfa-ac83-eb7f8ca32b6a', '長崎県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('6ef5bcc8-fba5-4647-84b2-c45cf556ad55', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '48c9dcd4-7187-4e49-9689-94ad29d27519', 'Saga', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('6f05ac64-bf87-49fa-926a-24cd83890448', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '4884c406-0bd3-4671-a9dc-bb4d7ca53ed7', 'Ibaraki', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('6f568192-1203-4cee-be32-960e81cb7b00', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'c2505f69-c5ba-4916-b416-5f341bd574bd', 'Kanagawa', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('70346aa0-7b0d-40f9-b271-53ee707a84a2', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'e67a6720-1feb-4cf4-95af-37bffcc9456d', 'Hiroshima', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('78c204dc-c5e2-4c21-a098-94148a2d86f2', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '95f97ae1-7b20-494e-8bf9-ac1322d3eb7a', 'Gifu', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('79eee71a-b5e7-4284-b514-16bc5de6e3d8', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'f8f34227-76d6-41e6-b177-157ec4923400', '福岡県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('7eafda35-c923-470e-9ebb-ae4e2fda839f', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '13dc9958-41e9-4ae8-82a4-fe54adf302af', 'Kagawa', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('7f33d77c-f9de-4997-b594-d175a13f052b', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'a0a6b8a2-d5a8-4829-9ff2-9a45a6caf58a', '高知県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('821e2a4b-2b35-4184-ac40-f75a7fa7b407', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'c598c2c8-f38b-4876-ade5-495cce1834d1', '奈良県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('82b19569-e1f7-4f27-8359-8804f23c869c', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'd6538fca-dde6-4fae-b477-e529d16ac50c', 'Okinawa', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('8aebc87e-f00e-47f4-aa13-a48037e7c74c', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'b5267871-bd43-41d2-ae93-96ca21b56fb3', 'Kyoto', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('8e2c4436-4930-4b5f-9a0d-d21587eaaf35', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '36783f12-7b1d-4a97-8e33-eb4d22da69ec', 'Tokushima', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('8e7f5192-2232-4334-902e-4046bf07cf1a', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '473218b5-1c8e-41cd-80b3-8c5854a53b3c', 'Nagasaki', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('8f8cbc16-9603-4a5b-9743-5e1776300dfe', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '7e6dad4d-b647-4892-ac92-9521d253a641', '島根県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('8fb24046-7304-4c90-b0e9-a1e8b8a7f97a', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '5c7214c3-9b6a-47f9-bdad-91d0f51a17c2', '長野市', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('9333d435-b183-4ef8-bf2c-8ee39580576d', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '63125d25-b374-4a1d-a8e4-bf5350af91a3', 'Saitama', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('9a032165-9645-411e-957e-0e4dc42cadaa', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '229f533b-ba49-4324-93b8-d9e05ff9bc45', '愛知県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('9a9d4ed0-faaf-419e-ab2b-52c05e5158ea', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'b40e3ae4-11b6-4f04-8244-2de69d9d62bf', '青森', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('9dcfe401-0333-493d-b0b9-842e21cb1262', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '920b20f7-0771-4818-aedc-dedcf64e5b0a', '富山県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('9e2687e4-45e0-4493-9b61-be823364fc47', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '1991ed6a-73bc-4d51-ad28-10439df94ec6', '大分県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('9e4c407d-5fbe-4ab2-a79e-3eb9e9ad6d97', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'd1dcc51b-c30c-4e52-bb3b-f37f3237625f', 'Fukuoka', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('a1023e43-c789-44e2-8212-e8fe328270e0', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'd9b524ef-4cfa-4dc7-80aa-bf7cf12d586d', 'Yamagata', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('a17391ee-f39f-45fe-b1a4-49bd7b9e764e', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'd5f98dfe-c488-49e2-b980-68e8bfaa8683', '山口県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('a2d272e8-58d9-4684-a80a-0302de797929', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'ea5d7ac7-7125-4c7f-83c9-85117d0c572b', 'Shizuoka', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('a6d1b7af-a387-482a-a674-72296d3ef409', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'b85fcd0c-8c84-4560-a2b2-86e08b097e40', '栃木市', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('a8953db0-5357-48b2-bbd0-fb1bfeb62a19', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'a5ef3fe9-9006-4707-a06c-c3f544af47ef', 'Tottori', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('aa9dc72b-d620-4104-aca7-12725a0f2af2', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '2aa48943-5f3a-403a-967f-d4f33090db65', 'Wakayama', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('aca9cf28-11c7-4c5a-8f2b-57bdd3a00b55', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '2da38606-90d2-4d76-bd90-674006732452', '東京', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('b39cec93-ddde-483e-b8c6-0979268a118e', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '4abad5be-788b-4224-868b-e346b48944bb', '滋賀県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('bbff8eed-aa7b-47fe-b95f-dde618c282b6', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'f2c88a3c-c782-42e6-9f6a-6f3664e65a8d', 'Kōchi', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('bc18819d-ccb6-4d63-bfc5-f5328471ac54', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '29aaaa28-b694-4f54-927c-c9dc5b7e43ba', 'Akita', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('be005f63-e75d-4114-ae59-56b4d18dd26c', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '76596e4c-9698-4084-a2b8-dfcce9330e36', '岡山県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('c22b4d2c-fbbc-48b8-9aec-6be0080aab22', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '981628f3-5f5d-4d0f-a38f-44b039611fcf', 'Niigata', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('c97e42ef-92de-4020-b56a-829f46e7f31a', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '070d93b3-259d-484d-ade1-635e7ff1715c', '山形県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('cb725c60-5ca6-4865-bb7e-fbb21a62a9ac', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '27853b0b-d906-44bf-985a-0fe44c7a5cb4', '千葉市', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('cbeefb96-4eb3-4c3f-844b-d7156f9828e5', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '6069afe1-d341-4793-9abe-b05f1ca18ab4', 'Chiba', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('cc0fc480-d94e-4a97-bbb5-7e56bdc94421', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '705e58a4-b561-42ab-aca0-a62035363ef1', '宮城県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('cc2d0f40-fbdd-4877-ba91-8c956e686144', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '90827946-7819-42cc-a5bc-3f1d8d5aba16', '秋田犬', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('cf01dbd3-aa08-4148-b85d-cb483d906fd1', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '0866e6bb-b0b4-4f2b-b38a-94bfea719ef6', 'Iwate', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('d1aafc92-613e-4a41-8453-8a4e818cd27a', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'ad47bd9c-1851-4e50-bbc2-ed6f7cb68609', 'Tokyo', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('d53f225f-e6b2-45a9-9083-8a62781ed97f', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '44d7a069-3a8c-4e34-84f1-b4e8b1b8a764', 'Fukui', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('d6bbf3ca-3b48-4704-ab88-6348640d41a1', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'd138d4da-abf3-4ba3-8771-b34b74e32ad0', '静岡県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('d7d6d651-c1e6-4e86-9fc3-27fa3e78d70f', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '16332e17-6b6b-4161-bc43-4125ccd6a7e8', 'Ishikawa', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('df98132b-68c4-4293-aaba-12c425853949', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '496c08c9-b92d-4264-bf47-a7271efbcf8b', '山梨県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('e4eea8c3-e8e0-41ec-ada1-22d255223a30', '1373546d-cba2-4fd2-9df9-27dbd66706ed', '25bccbcf-f936-48ce-9f55-98f88718b776', 'Aichi', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('e554ddbc-54e3-4537-938c-ab1a72ed47f7', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '9dba51d3-5ae7-4b64-a05d-7876fc8f5288', '埼玉県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('e6395bc3-d0da-4d4d-bd5f-88895b8caca6', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '53d0e107-a889-4f96-a315-b0d1ce42fe76', '岐阜市', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('ebc5431b-8e44-4510-a91d-6276fca7502e', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '48c0d3f8-933e-41fe-8681-ce42254e1024', '熊本県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('f03221d8-9247-4211-a5b8-6930449e4c7d', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'de62b11a-f610-45c9-9e91-4409e4fd66f6', 'Tochigi', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('f58c240c-9db9-40d3-883e-23035098bddc', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'b64b6ecb-7f66-4a68-955c-4f559ba458a6', '広島県', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('f6ba2a8f-9f1d-4ae6-87ed-00a24a3b5553', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'cc9b8059-cc29-47ac-8b9c-c17534808169', 'Fukushima', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06'),
('fda8b73c-ff97-4292-8721-8647fec7fbdc', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '42904c19-ea8d-4e75-8040-fd280c4f2b78', '北海道', '2025-09-29 21:25:48.827522-06', '2025-09-29 21:25:48.827522-06');

INSERT INTO "public"."tags" ("id", "slug", "icon", "is_featured", "updated_at", "created_at") VALUES
('0158bf21-146f-463c-b0dc-a11d9ec093e3', 'no-agency-fee', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('0eba4123-b3f5-4259-8c35-0d400173fcbc', 'no-guarantor-required', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('13a49c59-4f64-4794-ad4d-1687f1551b81', 'smoking-ok', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('1b7b6950-1413-46eb-b995-0c3cffaab73b', 'near-convenience-s', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('1f31e304-94a4-4093-8d61-e3e881be14aa', 'wifi-included', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('25887e17-cc48-44cc-9099-a218ae2444c6', 'furnished', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('264f33c0-bd4a-4262-87c5-c0ed177cbc15', 'loft', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('30037d78-01e3-4890-8daf-78d0dabb8ecc', 'cat-ok', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('4918071d-b330-4920-8686-a5859aa6b464', 'english-lease-ok', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('6279b319-c41f-4c88-80b6-83be1dffd90a', 'bike-parking', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('73ee65fb-a46c-481c-a8d6-4cc5a3e6acf2', 'women-only', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('8f956c49-5156-49ed-9866-b5d1ac8ed87f', 'washer-dryer', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('9effb301-3ebf-47d2-831f-53ae292a669c', 'quiet-area', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('aa78691e-7d55-4a2d-9c76-28f70fc6c073', 'accessible', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('afff06ed-cc26-4a77-b0a0-2995ba8a9da5', 'dog-ok', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('bc0eb23b-0738-4fbd-9f15-8dfc2af1617d', 'short-term-ok', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('c76970af-6601-49d4-8541-d8f6a679435d', 'no-deposit', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('cb59fa60-1aa2-4cb4-85ad-04fa449c224f', 'elevator', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('cb759d6f-086a-41b6-9067-06497148b335', 'balcony', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('d15d5fca-8f1a-4f91-91bd-c63d11aa143d', 'foreigner-friendly', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('d8eb438e-19e1-4d32-9c3e-cde4bf368ec0', 'utilities-included', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('dd8bf28b-c619-40b6-a8f0-b46e81f2aaf9', 'near-station', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('e52016a3-9e42-40c9-95a7-8075bfed21cb', 'no-key-money', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06'),
('fc5d4e43-a112-45d5-941a-38a19ba64267', 'auto-lock', NULL, 'f', '2025-09-29 14:58:11.609518-06', '2025-09-29 14:58:11.609518-06');

INSERT INTO "public"."tags_translations" ("id", "tags_id", "language_id", "label", "description", "updated_at", "created_at") VALUES
('039d4496-06a7-4a3c-b9b8-5a3a73589caa', '9effb301-3ebf-47d2-831f-53ae292a669c', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Quiet Area', 'Property is in a quiet neighborhood.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('070b10d4-2598-461d-87d7-1334d84eb664', '0eba4123-b3f5-4259-8c35-0d400173fcbc', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '保証人不要', '保証人とは、借主が家賃やその他の費用を滞納した場合に、それを補填することを約束する第三者の個人または企業である。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('0c1f5075-fd78-45a3-9cc3-873b5f3f9966', 'aa78691e-7d55-4a2d-9c76-28f70fc6c073', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'バリアフリー', 'ハンディキャップをお持ちの方もご利用いただけます。', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('0f49e56e-6bab-4b86-ad2c-323aacb4ab00', 'bc0eb23b-0738-4fbd-9f15-8dfc2af1617d', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '短期入居可', '短期リースも可能。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('1933f4a6-4539-4b4c-8a2e-2a1801f2acd1', 'afff06ed-cc26-4a77-b0a0-2995ba8a9da5', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Dog OK', 'Dogs are allowed to live in this property.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('1a5732ac-9f47-49a7-a66f-ee831d4375a6', 'd15d5fca-8f1a-4f91-91bd-c63d11aa143d', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '外国人歓迎', '外国人居住者のニーズに合わせたアメニティや賃貸条件を提供し、多くの場合、短期リース、保証人不要、クレジットカード支払いオプションなどを含む。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('23097951-53ac-430a-9e7f-186c2ea220fc', '1f31e304-94a4-4093-8d61-e3e881be14aa', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Wi-Fi Included', 'Wireless internet access included.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('295657f5-accd-4641-bb0d-b03978b3fcf3', '8f956c49-5156-49ed-9866-b5d1ac8ed87f', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Washer & Dryer', 'There is a washer and dryer on the property.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('2fe4f98d-6e8a-4363-8f72-ed65a0566623', 'd8eb438e-19e1-4d32-9c3e-cde4bf368ec0', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '光熱費込み', '光熱費の一部または全部が家賃に含まれている。', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('4b7856ee-74e8-462a-ba8c-76c523f18f1e', '0158bf21-146f-463c-b0dc-a11d9ec093e3', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'No Agency Fee', 'An agency fee, also known as a brokerage fee or commission, is the payment made to a real estate company for assisting in finding and securing a property (rental or purchase).', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('4bcc4116-531d-445f-af45-84d3933f4733', 'cb59fa60-1aa2-4cb4-85ad-04fa449c224f', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Elevator', 'Elevator access.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('4f611bf1-6214-4472-8b8c-b740c9cb158d', 'cb59fa60-1aa2-4cb4-85ad-04fa449c224f', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'エレベーターあり', 'エレベーター', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('52fc51e3-bed9-421f-bd0c-b5095bfd3af5', '30037d78-01e3-4890-8daf-78d0dabb8ecc', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '猫OK', '猫はこの物件に住むことができる。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('5776a06a-2434-4422-be1c-3a1dcb2afd76', '1b7b6950-1413-46eb-b995-0c3cffaab73b', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'コンビニ近く', '物件はコンビニの近く。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('5c908bad-50e9-4a3a-8654-fbe1daba01a7', 'e52016a3-9e42-40c9-95a7-8075bfed21cb', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'No Key Money', 'Key money is a fee paid to a manager, a landlord, or even a current tenant to secure a lease on a residential rental property. The term is sometimes used to refer to a security deposit. However, in some competitive rental markets, key money is simply a gratuity.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('5d4050ff-b546-45f9-bd73-d428cb5e237d', '13a49c59-4f64-4794-ad4d-1687f1551b81', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '喫煙可', '喫煙可のポリシーがあったり、指定された喫煙エリアがある場合もある。', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('603ce063-e553-4a67-859c-331074eee339', '25887e17-cc48-44cc-9099-a218ae2444c6', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '家具付き', '家具付き、または一部家具付き。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('605b3a50-4ed4-4442-819f-20c0fb3e073c', 'cb759d6f-086a-41b6-9067-06497148b335', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'バルコニー付き', 'バルコニー付き。', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('60d6579c-0f69-46a9-a8ac-06ad1696536d', '1b7b6950-1413-46eb-b995-0c3cffaab73b', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Near Convenience Store', 'Property is near a convenience store.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('63fb5f74-51d4-47d2-886b-3aa9a4c72003', '8f956c49-5156-49ed-9866-b5d1ac8ed87f', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '洗濯乾燥機付き', '敷地内に洗濯機と乾燥機がある。', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('6ab897a9-790c-4206-ad52-9f4758f6c218', '264f33c0-bd4a-4262-87c5-c0ed177cbc15', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'ロフト付き', 'この物件にはロフトスペースがある。', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('6d3657f0-e054-4034-8308-cefe4861ccc2', '0eba4123-b3f5-4259-8c35-0d400173fcbc', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'No Guarantor Required', 'A guarantor is a third-party individual or company who promises to cover rent or other expenses if the tenant fails to do so', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('742ab7c4-1c6f-45a9-bf88-074d44e4c014', 'e52016a3-9e42-40c9-95a7-8075bfed21cb', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '礼金なし', '礼金とは、賃貸住宅の賃貸契約を確保するために、管理人、家主、あるいは現在の借主に支払う費用のこと。敷金という意味で使われることもある。しかし、競争の激しい賃貸市場では、礼金は単なる謝礼である場合もある。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('75e6269a-2d55-4913-9acd-89775334c0cd', 'afff06ed-cc26-4a77-b0a0-2995ba8a9da5', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '犬OK', '犬はこの物件に住むことができる。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('8ac2ec92-a7d2-4e60-bd22-1c65382d4351', '30037d78-01e3-4890-8daf-78d0dabb8ecc', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Cat OK', 'Cats are allowed to live in this property.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('8cbfe01f-6d9a-46a5-81cd-39893c11d233', '264f33c0-bd4a-4262-87c5-c0ed177cbc15', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Loft', 'Property has a loft space.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('957edbf4-49d6-4803-ba88-305f362d4cbc', 'dd8bf28b-c619-40b6-a8f0-b46e81f2aaf9', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '駅徒歩5分以内', 'この物件は駅の近くにある。', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('960b23c6-1dfc-4560-aa01-03924b0bf4f4', 'fc5d4e43-a112-45d5-941a-38a19ba64267', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Auto Lock', 'Entrance locks automatically.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('a18d8e51-ec61-4a4c-8200-06d41dc627bf', 'bc0eb23b-0738-4fbd-9f15-8dfc2af1617d', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Short Lease Term OK', 'A short term lease is available.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('a4a533c8-f39d-4da2-a781-55bdf880c45e', '1f31e304-94a4-4093-8d61-e3e881be14aa', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'Wi-Fiあり', 'ワイヤレスインターネット接続込み。', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('aa49d7c7-3cc9-478c-9373-de2fbb8ac1ef', 'aa78691e-7d55-4a2d-9c76-28f70fc6c073', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Handicap Accessible', 'Property accommodates handicapped indivduals.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('aa8cfa76-8cbd-496a-81ee-9c8fea4296bf', '4918071d-b330-4920-8686-a5859aa6b464', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '英語契約可', 'リースは英語で利用可能。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('afd8f825-1a49-4a1e-b64a-d521cfab650e', '73ee65fb-a46c-481c-a8d6-4cc5a3e6acf2', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Women Only', 'Exclusively designed and available to women.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('affe126e-3b94-4d2a-9dc5-716387a3719b', 'd15d5fca-8f1a-4f91-91bd-c63d11aa143d', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Foreigner Friendly', 'Offers amenities and rental terms tailored to the needs of international residents, often including shorter-term leases, no guarantor requirements, option for credit card payments and more.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('b52334cb-a9e1-4fea-a3b8-66395331679b', 'c76970af-6601-49d4-8541-d8f6a679435d', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'No Deposit', 'A deposit fee, often referred to as shikikin (敷金), is a one-time payment made by a tenant to the landlord at the start of the lease. This fee is typically equivalent to one to two months rent.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('b7d1750a-5146-42af-94cc-6173352adeb7', '73ee65fb-a46c-481c-a8d6-4cc5a3e6acf2', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '女性専用', '女性専用。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('bf6fc5c0-5ea4-4fec-be74-b222247b9c1e', 'd8eb438e-19e1-4d32-9c3e-cde4bf368ec0', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Utilities Included', 'Some or all of the utility costs are included in the rent cost.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('c58284bf-4a27-4b77-a6b2-d8e18831a400', 'dd8bf28b-c619-40b6-a8f0-b46e81f2aaf9', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Near Station', 'Property is near a train station.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('c8eeca01-ed11-42ab-bb32-bffcd6c23ce7', '4918071d-b330-4920-8686-a5859aa6b464', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'English Lease', 'The lease is available in english.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('cafe53fa-72d3-4e86-a961-bee8e66e68bc', 'cb759d6f-086a-41b6-9067-06497148b335', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Balcony', 'The property has a balcony.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('ceb4cd9a-0a54-4b1f-8853-27aa9a716c44', 'fc5d4e43-a112-45d5-941a-38a19ba64267', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', 'オートロック', '入り口は自動的にロックされる。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('e057ef9f-391c-4892-b23b-52c1b702e11a', '6279b319-c41f-4c88-80b6-83be1dffd90a', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '駐輪場あり', '駐輪場あり。」', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('e0b56e48-64aa-4540-924e-8b474eedb70a', '6279b319-c41f-4c88-80b6-83be1dffd90a', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Bicycle Parking', 'Bicycle parking available.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('e278f3ea-59d3-4765-9a01-cfa3a9097075', '0158bf21-146f-463c-b0dc-a11d9ec093e3', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '仲介手数料なし', '仲介手数料は、仲介手数料または仲介手数料とも呼ばれ、物件（賃貸または購入）探しと確保を支援するために不動産会社に支払われるものである。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('e4225e52-3a71-4f10-ba54-e302d24c463a', '9effb301-3ebf-47d2-831f-53ae292a669c', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '静かな地域', '物件は閑静な住宅街にある。', '2025-09-29 16:28:59.522629-06', '2025-09-29 16:28:59.522629-06'),
('f02265bf-bee2-485c-8ee8-c6f5abe953fe', '25887e17-cc48-44cc-9099-a218ae2444c6', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Furnished', 'The property is fully or partly furnished.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('f2189e3f-afde-4360-ae6e-dc2834c3ac32', 'c76970af-6601-49d4-8541-d8f6a679435d', 'dcef161a-a352-4542-a8b0-f38ac0cbea6a', '敷金なし', '敷金（しききん）とは、賃貸契約開始時に借主が貸主に支払う一時金のことである。', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06'),
('fd0f1e12-7519-48be-adaa-94c1b8f623ea', '13a49c59-4f64-4794-ad4d-1687f1551b81', '1373546d-cba2-4fd2-9df9-27dbd66706ed', 'Smoking OK', 'May have smoking-friendly policies, or have a designated smoking area.', '2025-09-29 16:12:06.938026-06', '2025-09-29 16:12:06.938026-06');

INSERT INTO "public"."user_types" ("id", "slug", "updated_at", "created_at") VALUES
('345ad3c8-5a17-4420-b880-5fade6f83b2e', 'renter', '2025-09-29 13:45:19.175079-06', '2025-09-29 13:45:19.175079-06'),
('59ac97fb-4f4e-4d0c-84f7-5e2d0c5add59', 'agent', '2025-09-29 13:45:19.175079-06', '2025-09-29 13:45:19.175079-06'),
('857d7054-9f59-4b29-af0c-93bfdba81809', 'advertiser', '2025-09-29 13:45:19.175079-06', '2025-09-29 13:45:19.175079-06'),
('a8f83d98-5a10-423c-a915-acff23937ce5', 'partner', '2025-09-29 13:45:19.175079-06', '2025-09-29 13:45:19.175079-06'),
('e42baf27-59ae-421e-9859-c8f6a7f81ef7', 'admin', '2025-09-29 13:45:19.175079-06', '2025-09-29 13:45:19.175079-06');

CREATE EXTENSION "pg_stat_statements";
ALTER TABLE "public"."agencies" ADD FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id");
ALTER TABLE "public"."agencies" ADD FOREIGN KEY ("account_owner_id") REFERENCES "public"."users"("id");


-- Indices
CREATE UNIQUE INDEX agencies_agency_name_key ON public.agencies USING btree (agency_name);
CREATE INDEX idx_agencies_ward_verified ON public.agencies USING btree (ward_id, verified) WHERE (verified = true);
CREATE INDEX idx_agencies_bilingual ON public.agencies USING btree (bilingual_support) WHERE (bilingual_support = true);
ALTER TABLE "public"."agencies_translations" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;
ALTER TABLE "public"."agencies_translations" ADD FOREIGN KEY ("agencies_id") REFERENCES "public"."agencies"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX agencies_translations_agencies_id_language_id_key ON public.agencies_translations USING btree (agencies_id, language_id);
ALTER TABLE "public"."agents" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."agents" ADD FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX agents_user_id_key ON public.agents USING btree (user_id);
CREATE INDEX idx_agents_agency_user ON public.agents USING btree (agency_id, user_id);
CREATE INDEX idx_agents_languages_gin ON public.agents USING gin (languages_spoken);
ALTER TABLE "public"."agents_translations" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;
ALTER TABLE "public"."agents_translations" ADD FOREIGN KEY ("agents_id") REFERENCES "public"."agents"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX agents_translations_agents_id_language_id_key ON public.agents_translations USING btree (agents_id, language_id);
ALTER TABLE "public"."appi_audit_events" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


-- Indices
CREATE UNIQUE INDEX appi_audit_events_event_id_key ON public.appi_audit_events USING btree (event_id);
CREATE INDEX idx_appi_audit_user ON public.appi_audit_events USING btree (user_id);
CREATE INDEX idx_appi_audit_timestamp ON public.appi_audit_events USING btree (event_timestamp);
CREATE INDEX idx_appi_audit_type ON public.appi_audit_events USING btree (event_type);
CREATE INDEX idx_appi_audit_user_type_time ON public.appi_audit_events USING btree (user_id, event_type, event_timestamp);
CREATE INDEX idx_appi_audit_compliance_violations ON public.appi_audit_events USING btree (compliance_status) WHERE ((compliance_status)::text = 'violation'::text);
CREATE INDEX idx_appi_audit_session_tracking ON public.appi_audit_events USING btree (event_timestamp, ip_address);


-- Indices
CREATE INDEX idx_appi_residency_location ON public.appi_data_residency_log USING btree (geographic_location);
CREATE INDEX idx_appi_residency_timestamp ON public.appi_data_residency_log USING btree (compliance_check_timestamp);
CREATE INDEX idx_appi_residency_location_time ON public.appi_data_residency_log USING btree (geographic_location, compliance_check_timestamp);


-- Indices
CREATE UNIQUE INDEX appi_incident_tracking_incident_id_key ON public.appi_incident_tracking USING btree (incident_id);
CREATE INDEX idx_appi_incident_timestamp ON public.appi_incident_tracking USING btree (incident_timestamp);
CREATE INDEX idx_appi_incident_status ON public.appi_incident_tracking USING btree (status);
CREATE INDEX idx_appi_incident_severity ON public.appi_incident_tracking USING btree (severity);
CREATE INDEX idx_appi_incident_severity_time ON public.appi_incident_tracking USING btree (severity, incident_timestamp);
CREATE INDEX idx_appi_incident_regulatory ON public.appi_incident_tracking USING btree (regulatory_notification_sent) WHERE (regulatory_notification_sent = true);


-- Indices
CREATE UNIQUE INDEX chat_statuses_status_key ON public.chat_statuses USING btree (status);
ALTER TABLE "public"."consent_history" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."consent_history" ADD FOREIGN KEY ("consent_id") REFERENCES "public"."user_consent"("id") ON DELETE CASCADE;


-- Indices
CREATE INDEX idx_consent_history_user_id ON public.consent_history USING btree (user_id);
CREATE INDEX idx_consent_history_timestamp ON public.consent_history USING btree ("timestamp");
CREATE INDEX idx_consent_history_action ON public.consent_history USING btree (action_type);
CREATE INDEX idx_consent_history_audit ON public.consent_history USING btree (user_id, "timestamp", action_type);


-- Indices
CREATE UNIQUE INDEX countries_country_code_key ON public.countries USING btree (country_code);
ALTER TABLE "public"."country_translations" ADD FOREIGN KEY ("countries_id") REFERENCES "public"."countries"("id") ON DELETE CASCADE;
ALTER TABLE "public"."country_translations" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX country_translations_countries_id_language_id_key ON public.country_translations USING btree (countries_id, language_id);
CREATE INDEX idx_country_translations_lookup ON public.country_translations USING btree (countries_id, language_id);


-- Indices
CREATE UNIQUE INDEX employment_statuses_status_key ON public.employment_statuses USING btree (status);
ALTER TABLE "public"."employment_statuses_translations" ADD FOREIGN KEY ("employment_statuses_id") REFERENCES "public"."employment_statuses"("id") ON DELETE CASCADE;
ALTER TABLE "public"."employment_statuses_translations" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX employment_statuses_translati_employment_statuses_id_langua_key ON public.employment_statuses_translations USING btree (employment_statuses_id, language_id);
CREATE INDEX idx_all_translations_lookup ON public.employment_statuses_translations USING btree (employment_statuses_id, language_id);


-- Indices
CREATE UNIQUE INDEX floor_plans_type_key ON public.floor_plans USING btree (type);
ALTER TABLE "public"."floor_plans_translations" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;
ALTER TABLE "public"."floor_plans_translations" ADD FOREIGN KEY ("floor_plans_id") REFERENCES "public"."floor_plans"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX floor_plans_translations_floor_plans_id_language_id_key ON public.floor_plans_translations USING btree (floor_plans_id, language_id);


-- Indices
CREATE UNIQUE INDEX languages_language_code_key ON public.languages USING btree (language_code);
CREATE INDEX idx_languages_code ON public.languages USING btree (language_code);
CREATE INDEX idx_languages_supported ON public.languages USING btree (is_supported) WHERE (is_supported = true);
ALTER TABLE "public"."prefectures" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX prefectures_name_language_id_key ON public.prefectures USING btree (name, language_id);
ALTER TABLE "public"."prefectures_translations" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;
ALTER TABLE "public"."prefectures_translations" ADD FOREIGN KEY ("prefectures_id") REFERENCES "public"."prefectures"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX prefectures_translations_name_key ON public.prefectures_translations USING btree (name);


-- Indices
CREATE UNIQUE INDEX privacy_policy_versions_version_key ON public.privacy_policy_versions USING btree (version);
ALTER TABLE "public"."profiles" ADD FOREIGN KEY ("user_type_id") REFERENCES "public"."user_types"("id");
ALTER TABLE "public"."profiles" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."profiles" ADD FOREIGN KEY ("employment_status_id") REFERENCES "public"."employment_statuses"("id");
ALTER TABLE "public"."profiles" ADD FOREIGN KEY ("nationality_id") REFERENCES "public"."countries"("id");


-- Indices
CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);
CREATE INDEX idx_profiles_user_type ON public.profiles USING btree (user_type_id);
CREATE INDEX idx_profiles_user_lookup ON public.profiles USING btree (user_id, user_type_id, employment_status_id);
ALTER TABLE "public"."profiles_translations" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;
ALTER TABLE "public"."profiles_translations" ADD FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX profiles_translations_profile_id_language_id_key ON public.profiles_translations USING btree (profile_id, language_id);


-- Indices
CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);
ALTER TABLE "public"."tags_translations" ADD FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;
ALTER TABLE "public"."tags_translations" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX tags_translations_tags_id_language_id_key ON public.tags_translations USING btree (tags_id, language_id);
ALTER TABLE "public"."user_consent" ADD FOREIGN KEY ("policy_version_accepted") REFERENCES "public"."privacy_policy_versions"("version");
ALTER TABLE "public"."user_consent" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX user_consent_user_id_key ON public.user_consent USING btree (user_id);
CREATE INDEX idx_user_consent_user_id ON public.user_consent USING btree (user_id);
CREATE INDEX idx_user_consent_timestamp ON public.user_consent USING btree (consent_timestamp);
CREATE INDEX idx_user_consent_policy_version ON public.user_consent USING btree (policy_version_accepted);
CREATE INDEX idx_user_consent_withdrawal ON public.user_consent USING btree (withdrawal_timestamp) WHERE (withdrawal_timestamp IS NOT NULL);
CREATE INDEX idx_user_consent_compliance ON public.user_consent USING btree (user_id, consent_timestamp, policy_version_accepted);


-- Indices
CREATE UNIQUE INDEX user_types_slug_key ON public.user_types USING btree (slug);


-- Indices
CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);
CREATE INDEX idx_users_email ON public.users USING hash (email);
CREATE UNIQUE INDEX users_clerk_id_key ON public.users USING btree (clerk_id);
CREATE UNIQUE INDEX users_cognito_id_key ON public.users USING btree (cognito_id);
CREATE INDEX idx_users_username ON public.users USING btree (username);
CREATE INDEX idx_users_clerk_id ON public.users USING btree (clerk_id) WHERE (clerk_id IS NOT NULL);
CREATE INDEX idx_users_cognito_id ON public.users USING btree (cognito_id) WHERE (cognito_id IS NOT NULL);
CREATE INDEX idx_users_account_status ON public.users USING btree (account_status);
CREATE INDEX idx_users_deletion_scheduled ON public.users USING btree (deletion_scheduled_at) WHERE (deletion_scheduled_at IS NOT NULL);
CREATE INDEX idx_users_basic_info ON public.users USING btree (id, email, username, account_status);
ALTER TABLE "public"."wards" ADD FOREIGN KEY ("prefecture_id") REFERENCES "public"."prefectures"("id") ON DELETE CASCADE;
ALTER TABLE "public"."wards_translations" ADD FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE CASCADE;
ALTER TABLE "public"."wards_translations" ADD FOREIGN KEY ("wards_id") REFERENCES "public"."wards"("id") ON DELETE CASCADE;


-- Indices
CREATE UNIQUE INDEX wards_translations_wards_id_language_id_key ON public.wards_translations USING btree (wards_id, language_id);
