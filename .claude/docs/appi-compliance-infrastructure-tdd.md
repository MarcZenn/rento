# Technical Design Document: APPI Compliance Infrastructure

## Status

**Priority:** Critical
**Triaged:** True
**Last Updated:** 2025-09-23

## Overview

# APPI Compliance Infrastructure - Technical Design Document

This Technical Design Document outlines the implementation of APPI (Act on Protection of Personal Information) compliance infrastructure for Rento's Japanese market operation. This foundational system enables legal data processing, establishes competitive barriers, and provides the security framework upon which all other platform features depend.

## Background Context

This is a Technical Design Document for APPI Compliance Infrastructure. It outlines the technical requirements and implementation details for establishing comprehensive data privacy and residency compliance for Rento's operation in Japan. It should serve as a guiding document for a SCRUM master to reference as they craft tickets in Archon that developers and engineers can then reference to implement APPI Compliance Infrastructure in the codebase.

This TDD is based on the APPI Compliance Infrastructure Feature Requirements Document (FRD), which establishes the business case, regulatory requirements, and MVP scope for Japan-compliant data processing infrastructure.

## Objective & Scope

### MVP Priority Matrix

| Feature Category | MVP Status | Business Impact | Compliance Risk | Implementation Effort | Timeline |
|-----------------|------------|-----------------|-----------------|---------------------|----------|
| **Data Residency Controls** | ✅ MVP Essential | Critical | High | 2 weeks | Week 1-2 |
| **AES-256 Encryption** | ✅ MVP Essential | Critical | High | 1 week | Week 1 |
| **Basic Audit Logging** | ✅ MVP Essential | High | High | 1 week | Week 2 |
| **User Consent System** | ✅ MVP Essential | Critical | High | 2 weeks | Week 3-4 |
| **AWS Cognito Migration** | ✅ MVP Essential | Critical | Medium | 3 weeks | Week 2-4 |
| **Basic Compliance Dashboard** | ✅ MVP Essential | Medium | Medium | 1 week | Week 5 |
| **Automated Incident Detection** | 🟡 Month 2-3 | Medium | Low | 2 weeks | Post-MVP |
| **Real-time Monitoring** | 🟡 Month 2-3 | Medium | Low | 1 week | Post-MVP |
| **MFA for Admin** | 🟡 Month 2-3 | Low | Low | 1 week | Post-MVP |
| **Advanced Analytics** | 🔴 Month 4-6 | Low | None | 3 weeks | Post-MVP |
| **Automated Retention** | 🔴 Month 4-6 | Low | Low | 2 weeks | Post-MVP |
| **Synthetic Test Data** | 🔴 Month 6-12 | Low | None | 2 weeks | Post-MVP |

**Legend:**
- ✅ MVP Essential: Required for legal market entry
- 🟡 Early Post-MVP: High value, moderate effort
- 🔴 Later Post-MVP: Nice-to-have, can wait for scale

### Summary

**Objective:** Establish APPI-compliant infrastructure that enables Rento's legal operation in Japan while creating competitive barriers and building agent trust.

**What it enables:** This feature enables Rento to legally process user data, handle real estate transactions, and build relationships with privacy-conscious Japanese real estate agents. It provides the foundational security and compliance layer upon which all other platform features depend.

**Why needed:** Without APPI compliance, Rento cannot legally operate in Japan's heavily regulated data privacy landscape. This infrastructure is mandatory for market entry and creates a ¥3-5M competitive barrier that protects market position once implemented.

### Success Metrics

• Achieve 100% data residency compliance within Japanese infrastructure boundaries
• Pass APPI compliance audit with zero critical violations
• Reduce agent partnership acquisition friction by 40% through demonstrated privacy leadership
• Maintain ¥150K-250K monthly operational costs during MVP phase (reduced scope + AWS Cognito reduces costs by 60-70% vs Auth0)
• Enable legal platform operation with full audit trail capability
• Establish 99% system availability with 8-hour disaster recovery capability

### In Scope (MVP-Essential)

**Core Compliance Requirements (Cannot be deferred):**
• Self-hosted AWS Tokyo deployment with data residency controls
• AES-256 encryption for data transmission and storage
• Basic audit logging system with 2-year retention
• User consent management with privacy preferences and withdrawal capability
• Basic backup and disaster recovery within Japanese boundaries (8-hour RTO)
• API gateway with request logging and essential security headers
• Basic compliance dashboard for daily monitoring
• User privacy settings interface for consent management
• Migrate away from Clerk authentication to AWS Cognito+Amplify
• Essential documentation for Japanese regulatory reporting (manual process)

**Simplified MVP Implementations:**
• Manual incident response procedures (automated detection deferred)
• Basic password + IP allowlisting for admin access (MFA deferred)
• Manual data lifecycle management (automated retention policies deferred)
• Standard test data management (synthetic data environment deferred)
• Basic audit log search/filter (advanced analytics deferred)
• Manual monthly cost review (automated optimization deferred)

### Out of Scope (Post-MVP Roadmap)

**Deferred to Month 2-3:**
• Automated security incident detection with regulatory notification workflows
• Real-time compliance monitoring with automated alerting
• Multi-factor authentication for administrative functions

**Deferred to Month 4-6:**
• Real-time compliance violation detection
• Advanced audit analytics and reporting
• Automated data retention policies and deletion workflows

**Deferred to Month 6-12:**
• Advanced role-based access control with comprehensive audit trails
• Integration with Japanese regulatory reporting systems (automated)
• Synthetic data testing environment
• Automated cost optimization algorithms
• Advanced disaster recovery with 4-hour RTO
• Support for 10,000+ concurrent users (MVP targets 1,000)
• 99.9% uptime SLA (targeting 99% for MVP)

**MVP Scope Reduction Benefits:**
• Development time savings: 3-4 weeks
• Cost reduction: ¥200K-400K in first month
• Risk mitigation: Lower complexity = faster, more reliable delivery
• Maintains full APPI legal compliance while reducing time-to-market

## Compliance Mapping

### Regulatory & Compliance Mapping

• **APPI Article 24 - Cross-Border Data Transfer Restrictions**
  - Self-hosted infrastructure deployment within AWS Tokyo region
  - Geographic boundary controls preventing data transfer outside Japan
  - Data residency validation and monitoring systems
  - Legal agreements with Japanese cloud providers for certified compliance

• **APPI Article 27 - Security Management Measures**
  - AES-256 encryption implementation for data at rest and in transit
  - Access control systems with authentication and authorization
  - Security incident response procedures and documentation
  - Regular security assessments meeting Japanese banking standards

• **APPI Article 25 - Consent Requirements**
  - Granular user consent management system with explicit opt-in
  - Privacy policy version tracking and user acceptance records
  - Consent withdrawal mechanisms with 1-hour processing capability
  - Audit trails for all consent-related actions and changes

• **APPI Article 26 - Data Retention and Deletion**
  - 2-year audit log retention with secure storage systems
  - Data deletion workflows triggered by user requests or policy changes
  - Backup and recovery systems maintaining compliance boundaries
  - Documentation of data lifecycle management procedures

• **APPI Article 30 - Incident Reporting**
  - Security incident detection and logging infrastructure
  - Breach notification procedures aligned with regulatory timelines
  - Incident documentation and reporting systems
  - Communication protocols for regulatory authority notification

## Architecture & Integrations

### Context Diagram

• APPI compliance infrastructure sits as foundational layer beneath all Rento platform services
• Current Convex cloud hosting must migrate to self-hosted AWS Tokyo deployment
• Current Clerk authentication requires migration to AWS Cognito deployed in Tokyo region (ap-northeast-1) for guaranteed data residency.
• All user data processing must occur within Japanese infrastructure boundaries
• Real estate agents and users interact through compliance-controlled data flows
• Audit and monitoring systems provide regulatory reporting capability
• Backup and disaster recovery systems maintain compliance while ensuring availability

### Data Flow Overview

1. User authenticates via AWS Cognito user pool in Tokyo region → System validates within JP boundaries
2. User consent check performed against local consent database → Missing consent triggers consent modal
3. On consent submission → Consent service writes records to encrypted JP storage + audit log created
4. All user data operations validated against consent permissions → Unauthorized access blocked
5. Data processing events logged to encrypted audit system → Compliance dashboard updated
6. Backup operations execute within AWS Tokyo region → No cross-border data transfer
7. Incident detection triggers internal alerts → Manual regulatory reporting initiated if required
8. User data deletion requests → Automated purge across all JP systems within 1-hour SLA

### Integration Points

**auth:**
- provider: "AWS Cognito user pool in Tokyo region (ap-northeast-1) - (migration from Clerk required)"
- hook: "GraphQL authentication middleware → JWT validation → consent validation gate"
- constraint: "All authentication data stored exclusively in Tokyo region infrastructure"

**graphql_api:**
- provider: "Apollo Server with Express middleware"
- hook: "All client requests → GraphQL schema validation → resolver execution"
- constraint: "API layer orchestrates AWS Cognito authentication with Convex database operations"

**convex:**
- provider: "Convex (self-hosted on AWS Tokyo)"
- hook: "GraphQL resolvers → Convex query/mutation functions → encrypted storage with audit logging"
- constraint: "Migration from cloud Convex to self-hosted deployment required"

**aws_tokyo:**
- provider: "AWS Tokyo region services"
- hook: "Infrastructure foundation → all services deployed within JP boundaries"
- constraint: "Geographic boundary enforcement preventing cross-border data transfer"

**encryption:**
- provider: "AES-256 encryption system"
- hook: "All data operations → encrypt at rest and in transit"
- constraint: "Key management must comply with Japanese banking standards"

**audit:**
- provider: "GraphQL audit plugin + custom logging system"
- hook: "GraphQL operations → structured query logging → encrypted log storage with 2-year retention"
- constraint: "Audit trails must support regulatory reporting requirements with GraphQL operation tracking"

## Data Model

APPI Compliance Infrastructure leverages and extends the existing Convex schema foundation to support comprehensive compliance requirements. The current schema provides a good starting point but requires specific enhancements for APPI compliance tracking and audit capabilities.

### Schema Changes

#### Tables

**Enhanced Existing Tables:**

• **user_consent** (already exists, requires enhancement)
  - Add APPI-specific consent granularity fields
  - Add compliance audit fields for regulatory reporting
  - Add consent version tracking for policy changes

• **consent_history** (already exists, requires enhancement)
  - Add APPI incident tracking fields
  - Add regulatory reporting status fields
  - Add automated compliance status tracking

• **privacy_policy_versions** (already exists, good foundation)
  - Minimal changes needed for APPI compliance tracking

**New Tables Required:**

• **appi_audit_events**
  - event_id (primary key)
  - user_id (foreign key to users)
  - event_type (data_access, consent_change, deletion_request, etc.)
  - event_timestamp (ISO8601 format)
  - ip_address (for APPI incident tracking)
  - user_agent (browser/app identification)
  - data_accessed (encrypted field describing what data was accessed)
  - compliance_status (compliant, violation, under_review)
  - retention_until (calculated deletion date based on 2-year retention)

• **appi_data_residency_log**
  - log_id (primary key)
  - operation_type (create, read, update, delete, backup)
  - data_location (AWS region/zone verification)
  - boundary_check_result (passed, failed, warning)
  - timestamp (ISO8601 format)
  - service_component (convex, auth, storage, etc.)

• **appi_incident_tracking**
  - incident_id (primary key)
  - incident_type (security_breach, data_leak, unauthorized_access)
  - detection_timestamp (ISO8601 format)
  - resolution_status (open, investigating, resolved, reported)
  - affected_users (array of user IDs)
  - regulatory_notification_required (boolean)
  - notification_sent_timestamp (ISO8601 format if applicable)

#### Fields

**Enhanced user_consent table fields:**
- `appi_consent_granularity` (object) - Specific APPI consent categories
- `regulatory_basis` (string) - Legal basis for data processing under APPI
- `jp_specific_consent` (boolean) - Japan-specific privacy agreement acceptance
- `cross_border_consent` (boolean) - Explicit consent for any cross-border processing (should remain false)

**Enhanced consent_history table fields:**
- `appi_compliance_check` (boolean) - Whether change maintains APPI compliance
- `regulatory_impact` (string) - Assessment of regulatory implications
- `automated_compliance_status` (string) - Automated compliance validation result

**New audit system index requirements:**
- Compound index on (user_id, event_timestamp) for efficient user audit trails
- Index on event_type for compliance reporting queries
- Index on retention_until for automated cleanup processes
- Geographic constraint index ensuring all records remain in JP region

## API Contract (GraphQL Schema)

### GraphQL Schema Definition

```graphql
# APPI Compliance Types
type ConsentStatus {
  isValid: Boolean!
  consentStatus: ConsentDetails!
  lastUpdated: String!
}

type ConsentDetails {
  appiConsentGranularity: JSONObject
  regulatoryBasis: String!
  jpSpecificConsent: Boolean!
  crossBorderConsent: Boolean!
}

type AuditEvent {
  eventId: ID!
  timestamp: String!
  status: String!
  eventType: String!
  userId: ID!
  dataAccessed: String
  complianceStatus: String!
}

type DataDeletionRequest {
  requestId: ID!
  estimatedCompletion: String!
  status: String!
  deletionScope: String!
}

type ComplianceReport {
  reportId: ID!
  reportData: JSONObject!
  generatedAt: String!
  reportType: String!
}

type ConsentUpdate {
  updated: Boolean!
  effectiveDate: String!
  auditId: ID!
}

# Input Types
input ConsentUpdatesInput {
  appiConsentGranularity: JSONObject
  policyVersion: String!
  userAgent: String!
}

input AuditEventInput {
  eventType: String!
  userId: ID!
  dataAccessed: String
  ipAddress: String!
}

# Queries
type Query {
  validateUserConsent(
    userId: ID!
    consentType: String!
    operation: String!
  ): ConsentStatus

  checkDataResidency(
    timeRange: String!
    serviceComponent: String
  ): DataResidencyStatus

  generateComplianceReport(
    reportType: String!
    startDate: String!
    endDate: String!
  ): ComplianceReport
}

# Mutations
type Mutation {
  logAuditEvent(input: AuditEventInput!): AuditEvent

  processDataDeletionRequest(
    userId: ID!
    deletionScope: String!
  ): DataDeletionRequest

  updateConsentPreferences(
    input: ConsentUpdatesInput!
  ): ConsentUpdate
}
```

### GraphQL Resolvers Implementation

**Authentication Middleware:**
```typescript
// GraphQL Authentication Context
const authContext = async ({ req }: { req: Request }) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    // Validate JWT with AWS Cognito
    const decoded = jwt.verify(token, await getCognitoPublicKey());
    const cognitoUser = await cognito.getUser(decoded.sub);

    return {
      user: cognitoUser,
      convex: convexClient,
      isAuthenticated: true
    };
  } catch (error) {
    throw new AuthenticationError('Invalid authentication token');
  }
};
```

**APPI Compliance Resolvers:**
```typescript
const resolvers = {
  Query: {
    validateUserConsent: async (_, { userId, consentType, operation }, { user, convex }) => {
      // Validate user permissions
      if (user.id !== userId) {
        throw new ForbiddenError('Insufficient consent for operation');
      }

      // Query Convex for consent status
      const consent = await convex.query(api.compliance.validateUserConsent, {
        userId,
        consentType,
        operation
      });

      return {
        isValid: consent.isValid,
        consentStatus: consent.consentDetails,
        lastUpdated: consent.lastUpdated
      };
    },

    checkDataResidency: async (_, { timeRange, serviceComponent }, { user, convex }) => {
      // Admin-only operation
      if (!user.isAdmin) {
        throw new ForbiddenError('Insufficient privileges for residency check');
      }

      return await convex.query(api.compliance.checkDataResidency, {
        timeRange,
        serviceComponent
      });
    }
  },

  Mutation: {
    logAuditEvent: async (_, { input }, { user, convex }) => {
      // Audit logging with user context
      const auditEvent = await convex.mutation(api.audit.logAuditEvent, {
        ...input,
        authenticatedUserId: user.id,
        timestamp: new Date().toISOString()
      });

      return {
        eventId: auditEvent._id,
        timestamp: auditEvent._creationTime,
        status: 'logged'
      };
    },

    processDataDeletionRequest: async (_, { userId, deletionScope }, { user, convex }) => {
      // User can only delete their own data
      if (user.id !== userId) {
        throw new ForbiddenError('Can only delete own user data');
      }

      const deletionRequest = await convex.mutation(api.compliance.processDataDeletionRequest, {
        userId,
        deletionScope,
        requestedBy: user.id
      });

      return {
        requestId: deletionRequest._id,
        estimatedCompletion: deletionRequest.estimatedCompletion,
        status: 'processing'
      };
    }
  }
};
```

**Apollo Server Configuration:**
```typescript
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { auditPlugin } from './plugins/auditPlugin';

const app = express();

// APPI Compliance middleware
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Rate limit exceeded for APPI compliance'
}));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    // APPI compliance audit plugin
    auditPlugin({
      enableQueryLogging: true,
      enableFieldAccessLogging: true,
      auditSensitiveFields: ['personalInfo', 'contactDetails']
    }),
  ],
});

// Mount GraphQL with APPI compliance context
app.use('/graphql',
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  }),
  express.json({ limit: '1mb' }),
  expressMiddleware(server, {
    context: authContext
  })
);
```

### GraphQL Endpoint Access

**Base URL:** `https://api.rento.jp/graphql`
**Authentication:** Bearer token in Authorization header (AWS Cognito JWT)
**Request Format:** POST with JSON body containing GraphQL query/mutation
**Response Format:** JSON with data/errors structure per GraphQL specification

## Frontend Spec (Mobile)

### Surfaces

• **Consent Modal/Screen** - New modal for APPI consent collection during onboarding and policy updates
• **Privacy Settings Page** - Enhanced user profile section for consent management and data preferences
• **Data Deletion Request Screen** - New screen allowing users to request data deletion with confirmation flow
• **Privacy Policy Viewer** - Enhanced policy viewer with version tracking and acceptance recording
• **Compliance Notification System** - Toast/banner notifications for compliance-related updates
• **Security Incident Notification** - Emergency notification system for required security breach disclosures

### Components

• **consent_modal**
  - Intro summary with link to current policy version (version pinned for audit trail)
  - Granular checkbox list per APPI consent purpose with plain-language descriptions
  - Required/optional consent indicators with clear visual hierarchy
  - Primary CTA: "Save Consent Choices" (disabled until explicit selections made)
  - Secondary CTA: "Review Full Privacy Policy"
  - Locale switch (EN/JP) with cultural context preservation
  - Legal disclaimer text with regulatory compliance language

• **privacy_settings_page**
  - Current consent status overview with last-updated timestamps
  - Editable consent preferences with immediate effect indicators
  - Data download request section with processing time estimates
  - Data deletion request section with irreversibility warnings
  - Consent history viewer showing past changes and policy versions
  - Help and support section with automated guidance for common requests

• **data_deletion_confirmation**
  - Multi-step confirmation flow with irreversibility warnings
  - Scope selector (partial vs complete deletion) with impact explanations
  - Timeline indicator showing 1-hour processing SLA
  - Alternative options (data download, account suspension) before deletion
  - Final confirmation with password/biometric verification

• **compliance_notification_banner**
  - Dismissible banner for non-critical compliance updates
  - Persistent banner for required actions (new consent needed)
  - Emergency notification overlay for security incidents
  - Localized messaging with cultural sensitivity for Japanese users
  - Action buttons directing to appropriate compliance screens

### State

• **consent_state_management**
  - Current user consent status cached locally with server sync
  - Policy version tracking to detect when new consent required
  - Consent preferences with granular permission tracking
  - Consent history for audit trail display
  - Pending consent changes before server confirmation

• **compliance_notification_state**
  - Active compliance notifications with priority levels
  - Dismissed notification tracking to prevent re-display
  - Emergency incident notifications with required acknowledgment
  - Compliance action queue for required user actions

• **data_request_state**
  - Active data deletion requests with status tracking
  - Data download request status and file availability
  - Request history for user reference and audit trails
  - Processing timeline and estimated completion tracking

• **privacy_settings_state**
  - User privacy preferences with real-time sync status
  - Available consent options with current selection state
  - Policy version information and update availability
  - Automated compliance status and guidance system

## Enforcement & Guardrails

**Data Residency Enforcement:**
- Geographic boundary validation at infrastructure level preventing cross-border data transfer
- Real-time monitoring of all data operations with automatic blocking of non-compliant transfers
- Database constraints enforcing JP-region storage with automated compliance checks
- API gateway geographic restrictions blocking requests from outside Japanese infrastructure

**Consent Validation Guardrails:**
- Pre-processing consent checks blocking unauthorized data access attempts
- Automated consent expiration handling with grace period notifications
- Consent dependency mapping preventing feature access without required permissions
- Audit trail requirements making all data operations traceable and reversible

**Access Control Enforcement:**
- Role-based permissions restricting compliance functions to authorized personnel
- Multi-factor authentication requirements for sensitive compliance operations
- Session timeout enforcement for administrative compliance interfaces
- IP allowlisting for admin access to sensitive audit functions (Post-MVP feature)

**Data Retention Guardrails:**
- Automated 2-year audit log retention with secure deletion after expiration
- User data deletion enforcement within 1-hour SLA with confirmation workflows
- Backup system constraints maintaining compliance boundaries during disaster recovery
- Legal hold capabilities preventing deletion during active regulatory investigations

**Incident Response Automation:**
- Automatic security incident detection with compliance team alerting
- Regulatory notification workflow automation for required breach disclosures
- Evidence preservation systems maintaining audit integrity during incidents
- Communication templates ensuring consistent regulatory compliance messaging

## Security

### Touchpoints

• **Cross-Border Data Leakage Risk**
  - **Exploit**: Misconfigured backup systems or CDN could transfer data outside Japan
  - **Mitigation**: Geographic constraints at infrastructure level, automated boundary validation, regular compliance audits of all data flows

• **Authentication Provider Migration Risk**
  - **Exploit**: Clerk-to-AWS Cognito migration could expose user credentials or create access gaps 
  - **Mitigation**: AWS Amplify integration with comprehensive testing. No real risk of leak since there is currenlty no stored user credentials

• **Audit Log Tampering Risk**
  - **Exploit**: Compromised admin accounts could modify audit trails to hide compliance violations
  - **Mitigation**: Immutable audit logging with cryptographic signatures, append-only database design, segregated audit infrastructure

• **Consent Bypass Vulnerability**
  - **Exploit**: Application bugs could allow data processing without valid consent validation
  - **Mitigation**: Multiple consent validation layers, automated testing of consent flows, real-time consent monitoring with alerts

• **Encryption Key Management Exposure**
  - **Exploit**: Improper key rotation or storage could expose all encrypted user data
  - **Mitigation**: Japanese banking-standard key management, automated rotation procedures, hardware security modules for key storage

### PII Handling

• **User Authentication Data (emails, passwords, session tokens)**
  - Encrypted at rest using AES-256 with Japanese banking-standard key management
  - Transmitted only over TLS 1.3 with certificate pinning
  - Stored in Japanese infrastructure with no cross-border access
  - Access logged with full audit trails and retention controls

• **Real Estate Search History and Preferences**
  - Anonymized for analytics while preserving user privacy
  - Consent-gated access with granular permission controls
  - Automatic deletion workflows triggered by user requests or retention policies
  - Geographic tagging removed from stored search data to prevent location tracking

• **Agent Communication Records**
  - End-to-end encryption for sensitive property negotiation data
  - Translation service data processed within Japanese boundaries only
  - Message retention aligned with business requirements and user consent
  - Agent access controls preventing unauthorized message history access

• **Financial Information (income, guarantor data)**
  - Highest level encryption and access controls
  - Segregated storage systems with additional authentication requirements
  - Limited access to essential personnel only with full audit logging
  - Automatic redaction in logs and non-essential system components

### Secure Compliance

• Implement end-to-end encryption meeting Japanese banking security standards for all sensitive data
• Establish multi-factor authentication requirements for all administrative compliance functions
• Deploy automated vulnerability scanning and penetration testing within Japanese infrastructure (out of scope for MVP)
• Maintain air-gapped backup systems within Japanese boundaries for regulatory compliance
• Implement automated security incident detection with regulatory notification workflows (out of scope for MVP)
• Establish secure communication channels with Japanese regulatory authorities (out of scope for MVP)
• Deploy automated compliance monitoring with real-time violation detection and alerting

### Additional Concerns or Requirements

**Data Retention Security:** Implement secure deletion procedures ensuring data cannot be recovered after retention periods expire, with cryptographic verification of deletion completion for audit purposes.

**Incident Response Integration:** Establish secure communication protocols with Japanese legal counsel and regulatory authorities, including encrypted communication channels and pre-approved incident disclosure templates.

**Access Control Auditing:** Deploy continuous monitoring of all administrative access to compliance systems with behavioral analysis to detect unauthorized or suspicious access patterns.

**Third-Party Risk Management:** Establish security assessment procedures for any third-party services integrated with compliance infrastructure, ensuring all vendors meet Japanese data residency and security requirements.

**Administrative Security:** Implement additional security controls for admin accounts including multi-factor authentication, session management, and enhanced monitoring of all compliance-related activities.

## Localizations

### Frontend Localizations

• **Consent Modal Components** - All consent collection interfaces requiring EN/JP localization with legal terminology
• **Privacy Settings Pages** - User privacy preference interfaces with cultural context for Japanese users
• **Data Deletion Confirmation Flows** - Multi-step deletion workflows with culturally appropriate warnings and explanations
• **Compliance Notification Banners** - System notifications for compliance updates with formal/informal register matching cultural expectations
• **Error Messages and Validation Text** - All compliance-related error handling with clear explanations in both languages
• **Legal Disclaimer Text** - APPI-specific legal language requiring professional translation and legal review
• **Security Incident Notifications** - Emergency communication templates with culturally sensitive disclosure language

### Backend Localizations

**Tables Affected:**
- **privacy_policy_versions** table requires localization fields:
  - `en_content_hash` (existing) - English policy version fingerprint
  - `jp_content_hash` (existing) - Japanese policy version fingerprint
  - **New fields needed**: `en_policy_text`, `jp_policy_text` for full policy storage

**New Translation Tables Required:**
- **appi_compliance_messages_translations**
  - `message_id` (foreign key to compliance message templates)
  - `language` (foreign key to languages table)
  - `translated_message` (localized compliance notification text)
  - `legal_review_status` (approved, pending, requires_update)

- **audit_event_descriptions_translations**
  - `event_type_id` (foreign key to audit event types)
  - `language` (foreign key to languages table)
  - `user_friendly_description` (localized explanation of audit events for user transparency)
  - `technical_description` (localized technical details for compliance officers)

**Enhanced Existing Tables:**
- **consent_history** table enhancement:
  - Add `consent_language` field to track which language version was used for consent
  - Add `cultural_context_notes` field for Japan-specific consent handling requirements

## Performance & Reliability

### Reliability

**Infrastructure Reliability:**
- Deploy APPI compliance infrastructure across multiple AWS Tokyo availability zones for fault tolerance
- Implement automated failover procedures that maintain data residency compliance during outages
- Establish health check monitoring for all compliance-critical services with 5-minute check intervals
- Create automated backup verification procedures ensuring compliance data integrity and recoverability

**Consent System Reliability:**
- Implement redundant consent validation pathways preventing single points of failure
- Deploy consent data caching with automated invalidation to ensure consent checks remain available during database issues
- Establish consent validation fallback procedures that default to blocking data access when validation systems are unavailable
- Create automated consent system health monitoring with immediate alerting for compliance-critical failures

**Audit System Reliability:**
- Deploy audit logging to multiple storage systems preventing audit trail loss during system failures
- Implement audit log integrity verification using cryptographic signatures to detect tampering or corruption
- Establish automated audit system monitoring with real-time alerting for logging failures or delays
- Create audit data recovery procedures maintaining compliance during disaster scenarios

**Data Migration Reliability:**
- Implement comprehensive testing procedures for Convex and Clerk migration with rollback capabilities
- Deploy staged migration approach minimizing service disruption while maintaining compliance throughout transition
- Establish migration verification procedures ensuring no data loss or compliance violations during infrastructure changes
- Create migration monitoring dashboards providing real-time visibility into compliance status during transitions

### Performance Targets

**Response Time Targets:**
- Consent validation queries: <100ms (critical path for all data operations)
- Audit event logging: <200ms (non-blocking to maintain application performance)
- Data deletion request processing: <1 hour end-to-end (APPI regulatory requirement)
- Compliance report generation: <30 seconds for standard reports (regulatory efficiency)
- Data residency validation: <50ms (real-time boundary checking)

**Throughput Targets:**
- Support 1,000 concurrent users with full APPI compliance validation (MVP capacity target)
- Process 10,000 audit events per minute without performance degradation
- Handle 100 consent updates per minute with real-time validation
- Support 50 simultaneous compliance report generations

**Availability Targets:**
- 99% system availability with planned maintenance windows (MVP target, 99.9% post-MVP)
- <8 hour recovery time objective (RTO) for disaster recovery scenarios
- <1 hour recovery point objective (RPO) for compliance-critical data
- 24/7 availability for consent validation and audit logging systems

**Technical Implementation Requirements:**
- Implement database connection pooling optimized for compliance query patterns
- Deploy Redis caching for frequently accessed consent and audit data
- Establish query optimization specifically for APPI compliance reporting needs
- Create performance monitoring dashboards tracking compliance-specific metrics
- Implement automated performance testing for compliance workflows

## Rollout Plan

**Deployment Strategy:**
This feature requires a carefully orchestrated rollout due to the migration of existing infrastructure (Convex, Clerk to AWS Cognito) and the critical nature of compliance requirements. The deployment must maintain service availability while ensuring no compliance violations occur during the transition. Luckily, there is no working MVP in production so there is little to no risk should service be interrupted. There are also no existing users so there is low risk of compliance violations.

**Deployment Plan:**

**Phase 1: Core Infrastructure (Week 1-2) - Simplified MVP**
- Set up AWS Tokyo region infrastructure with geographic boundary controls
- Deploy self-hosted Convex instance with encrypted storage and basic backup systems
- Establish AWS Cognito authentication in Tokyo region (ap-northeast-1)
- Implement basic audit logging infrastructure with 2-year retention capability
- Deploy basic monitoring dashboard (manual alerting initially)

**Phase 2: Authentication Migration (Week 3-4) - Streamlined**
- Migrate existing user data to Japanese infrastructure with encryption at rest
- Transfer Convex database to self-hosted instance with data integrity verification
- Complete user authentication migration from Clerk to AWS Cognito using AWS Amplify
- Implement consent collection system for existing users with APPI compliance options
- Deploy basic compliance dashboard for daily manual monitoring

**Phase 3: Application Integration (Week 5) - Essential Features Only**
- Integrate mobile app with new APPI compliance APIs and consent validation systems
- Deploy frontend consent management interfaces with EN/JP localization
- Implement basic data deletion request workflows (manual processing initially)
- Conduct focused testing of core compliance workflows with test data

**Phase 4: MVP Launch (Week 6) - Reduced Scope**
- Conduct focused APPI compliance review with legal counsel (documentation-based)
- Perform basic load testing with 500 concurrent users to validate MVP targets
- Deploy production monitoring with manual incident response procedures
- Complete essential regulatory documentation and admin training
- **Go-live with simplified but fully compliant MVP**

**Post-MVP Development Roadmap:**
- **Month 2-3**: Automated incident detection, real-time monitoring, MFA for admin
- **Month 4-6**: Advanced analytics, automated retention policies, real-time alerts
- **Month 6-12**: Synthetic testing, advanced disaster recovery, automated optimization

**MVP Scope Benefits:**
- **Time Reduction**: 8 weeks → 6 weeks (25% faster time-to-market)
- **Resource Efficiency**: Focus on compliance-critical features only
- **Risk Mitigation**: Simpler system = fewer integration points = lower failure risk
- **Cost Optimization**: ¥200K-400K development savings while maintaining full legal compliance

**Special Considerations:**
- **Zero-Downtime Migration:** Use blue-green deployment strategy to maintain service availability during infrastructure transition
- **Compliance Continuity:** Ensure no data processing occurs outside Japanese boundaries at any point during migration
- **Rollback Procedures:** Maintain ability to rollback to pre-migration state if compliance violations detected
- **Legal Coordination:** Coordinate deployment timeline with legal counsel for regulatory notification requirements
- **User Communication:** Deploy user notifications explaining privacy improvements and new consent options

## Acceptance Criteria

• **Data Residency Compliance:** All user data processing occurs within AWS Tokyo region with automated boundary validation and zero cross-border data transfers detected
• **Encryption Implementation:** AES-256 encryption deployed for all data at rest and in transit with Japanese banking-standard key management and quarterly rotation
• **Audit Trail Completeness:** All data access events logged with 2-year retention, searchable audit interface, and compliance reporting capability
• **Consent Management Functionality:** User consent collection, preference management, and withdrawal capabilities with 1-hour processing SLA for deletion requests
• **Authentication Migration Success:** Complete migration from Clerk to AWS Cognito Tokyo region (ap-northeast-1) with AWS Amplify integration.
• **Infrastructure Self-Hosting:** Convex database successfully migrated to self-hosted AWS Tokyo deployment with verified data integrity and performance maintained
• **Compliance Dashboard Operational:** Administrative interface providing daily compliance monitoring, violation detection, and regulatory reporting capability
• **Mobile App Integration Complete:** Consent modals, privacy settings, and deletion request flows integrated with bilingual (EN/JP) support
• **Performance Targets Met:** Sub-500ms response times for 1,000 concurrent users with 99% system availability during MVP phase
• **Legal Compliance Validation:** External legal counsel verification of APPI compliance with formal compliance certification documentation
• **Incident Response Procedures:** Documented and tested procedures for security incident detection, response, and regulatory notification requirements
• **Backup and Recovery Verified:** Disaster recovery capabilities tested with 8-hour RTO while maintaining compliance boundaries and data integrity

## Authentication Provider Decision & Research

### Selected Solution: AWS Cognito Tokyo Region

**Decision Date:** 2025-09-23
**Status:** Approved based on comprehensive research analysis

Based on extensive research documented in `aws-cognito-appi-compliance-research.md`, **AWS Cognito in Tokyo region (ap-northeast-1)** has been selected as the optimal authentication provider for APPI compliance.

### Decision Rationale

**Primary Selection Criteria:**
1. **APPI Compliance**: Full data residency guarantee in Tokyo region
2. **Cost Effectiveness**: 60-70% cost reduction vs Auth0 Private Cloud
3. **Technical Feasibility**: Moderate implementation complexity with AWS Amplify
4. **Enterprise Readiness**: Production-grade AWS infrastructure with banking-standard security

### Comparative Analysis Results

| Solution | APPI Compliance | Monthly Cost | Implementation | Recommendation |
|----------|----------------|--------------|----------------|----------------|
| **AWS Cognito Tokyo** | ✅ Full | ¥10K-30K | 3 weeks | **SELECTED** |
| Auth0 Private Cloud | ✅ Full | ¥500K-800K | 4 weeks | Too Expensive |
| Convex Auth | ❌ None | ¥5K-15K | 2 weeks | Not Compliant |
| Azure AD B2C Go-Local | ✅ Full | ¥50K-100K | 3-4 weeks | Enterprise Alternative |

### Implementation Approach

**Migration Strategy:**
- **Week 1**: GraphQL API layer setup with Apollo Server + AWS Cognito integration
- **Week 2**: AWS Cognito setup in Tokyo region with GraphQL authentication middleware
- **Week 3**: React Native Apollo Client integration replacing REST API calls
- **Week 4**: User migration from Clerk using bulk import with password reset

**GraphQL Architecture Implementation:**

```typescript
// Apollo Server with APPI Compliance Configuration
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import { ConvexHttpClient } from 'convex/browser';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const app = express();

// AWS Cognito JWT Verifier for Tokyo region
const verifier = CognitoJwtVerifier.create({
  userPoolId: "ap-northeast-1_xxxxxxxxx",
  tokenUse: "access",
  clientId: "xxxxxxxxxxxxxxxxxxxxxxxxxx",
});

// APPI Compliance Context
const createContext = async ({ req }) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  try {
    // Verify JWT with AWS Cognito Tokyo region
    const payload = await verifier.verify(token);

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        cognitoGroups: payload['cognito:groups'] || [],
      },
      convex: new ConvexHttpClient(process.env.CONVEX_URL),
      isAuthenticated: true,
    };
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    // APPI Compliance audit plugin
    {
      requestDidStart() {
        return {
          didResolveOperation(requestContext) {
            // Log all GraphQL operations for APPI compliance
            console.log('GraphQL Operation:', {
              operation: requestContext.request.query,
              variables: requestContext.request.variables,
              user: requestContext.context.user?.id,
              timestamp: new Date().toISOString(),
            });
          }
        };
      }
    }
  ],
});

app.use('/graphql',
  cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }),
  express.json(),
  expressMiddleware(server, { context: createContext })
);
```

**React Native Apollo Client Setup:**
```typescript
// React Native GraphQL Client with AWS Cognito
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// Configure AWS Amplify for Tokyo region
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      region: 'ap-northeast-1',
      userPoolId: 'ap-northeast-1_xxxxxxxxx',
      userPoolClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    }
  }
});

// Authentication link for GraphQL requests
const authLink = setContext(async (_, { headers }) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { headers };
  }
});

const httpLink = createHttpLink({
  uri: 'https://api.rento.jp/graphql',
});

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
  },
});
```

**Convex Integration with GraphQL:**
```typescript
// GraphQL resolvers calling Convex functions
const resolvers = {
  Query: {
    getUserProfile: async (_, { userId }, { user, convex }) => {
      // APPI compliance check
      if (user.id !== userId) {
        throw new ForbiddenError('Unauthorized access to user data');
      }

      // Validate consent before data access
      const consentValid = await convex.query(api.compliance.validateUserConsent, {
        userId,
        operation: 'profile_read'
      });

      if (!consentValid.isValid) {
        throw new ForbiddenError('Insufficient consent for operation');
      }

      // Fetch user profile from Convex
      const profile = await convex.query(api.users.getProfile, { userId });

      // Log access for APPI audit
      await convex.mutation(api.audit.logDataAccess, {
        userId,
        dataType: 'user_profile',
        operation: 'read',
        timestamp: new Date().toISOString(),
      });

      return profile;
    },
  },

  Mutation: {
    updateUserProfile: async (_, { input }, { user, convex }) => {
      // Similar APPI compliance pattern for mutations
      const updatedProfile = await convex.mutation(api.users.updateProfile, {
        userId: user.id,
        updates: input,
      });

      return updatedProfile;
    },
  },
};
```

### APPI Compliance Validation

**Data Residency (Article 24):**
- ✅ User pools store data exclusively in Tokyo region
- ✅ Default configuration prevents cross-border data transfer
- ✅ Geographic boundary controls enforced at infrastructure level

**Security Management (Article 27):**
- ✅ Enterprise-grade encryption and access controls
- ✅ Multi-factor authentication support
- ✅ Comprehensive audit logging via AWS CloudTrail

**Audit and Monitoring:**
- ✅ All API calls logged with detailed audit trails
- ✅ 2+ year retention capability with S3 integration
- ✅ Real-time monitoring and alerting capabilities

### Cost Impact Analysis

**Total First Month Cost Comparison (Revised with Scope Reduction):**
- AWS Cognito Tokyo (Simplified MVP): ¥420K-600K (development + service)
- Auth0 Private Cloud (Full Scope): ¥1,250K-1,820K (60-70% higher)
- **Savings from Auth0**: ¥830K-1,220K in first month
- **Savings from Scope Reduction**: ¥100K-200K additional savings

**Ongoing Monthly Costs:**
- AWS Cognito (MVP Scope): ¥8K-25K for MVP scale
- Auth0 Private Cloud: ¥500K-800K
- **Monthly Savings**: ¥475K-792K

### Risk Mitigation

**Migration Risks:**
- User password reset requirement (mitigated by clear communication)
- Custom Convex integration complexity (mitigated by proven JWT libraries)
- React Native compatibility (mitigated by AWS Amplify documentation)

**Compliance Risks:**
- Custom APPI consent implementation needed (addressed in development plan)
- Monitoring setup requirements (leveraged AWS CloudTrail/CloudWatch)

### Success Metrics

**Technical Milestones:**
- Week 1: AWS Cognito user pool operational in Tokyo region
- Week 2: React Native app successfully authenticating via AWS Amplify
- Week 3: All users migrated with functional authentication flows

**Compliance Validation:**
- 100% user data stored in Tokyo region (verified via AWS console)
- Comprehensive audit trails operational (verified via CloudTrail)
- User consent management system functional

## Open Questions

• **AWS Cognito Integration:** AWS Cognito in Tokyo region will replace Clerk. Integration complexity is moderate with AWS Amplify, and costs are 60-70% lower than Auth0 alternatives.
• **Legal Counsel Integration:** What level of ongoing legal counsel involvement is required for compliance monitoring during post-MVP market entry phase?
• **Regulatory Reporting Automation:** Should the MVP include automated regulatory reporting capabilities, or is manual reporting acceptable for the initial phase to reduce development complexity?
• **Cross-Service Consent Validation:** How should consent validation be implemented across all existing Rento services (property search, agent communication, etc.) without breaking current functionality?
• **Data Migration Risk Mitigation:** What additional safeguards are needed during the Convex and Clerk to AWS Cognito migration to ensure zero compliance violations occur during the transition period?
• **Administrative Training:** What technical training and access controls are required for admin users to effectively use the compliance dashboard and incident response systems?
• **Third-Party Service APPI Compliance:** How should APPI compliance requirements be extended to third-party services (translation APIs, payment processing) used by the platform?
• **Performance vs. Compliance Trade-offs:** If performance targets conflict with compliance requirements (e.g., additional validation causing latency), what is the priority hierarchy for MVP delivery?
• **Compliance Testing Strategy:** What specific automated testing approaches are needed to validate APPI compliance beyond standard functional testing for MVP delivery?
• **Incident Response Escalation:** What are the specific triggers and procedures for escalating compliance incidents to regulatory authorities, and how should these be automated vs. manual processes?

## Additional Resources

- AWS Cognito + Tokyo Migration Research - `@.claude/docs/aws-cognito-appi-compliance-research.md`