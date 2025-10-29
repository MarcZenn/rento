# Rento PostgreSQL Database Schema

This directory contains the complete APPI-compliant PostgreSQL database schema for the Rento Japanese rental application.

**CRITICAL**: This schema contains production-ready APPI compliance features but requires proper security configuration before deployment. Always test in a development environment first.

## Quick Setup

```bash
# Create database
yarn run db:up 
```

## Database Migration System

A **unified, environment-aware database migration system** that handles local Docker, AWS RDS Development, and AWS RDS Production with intelligent automation and safety checks.

### 📋 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Single migrate.ts File                    │
│                                                               │
│  Detects environment → Configures connection → Runs safely  │
└─────────────────────────────────────────────────────────────┘
                                ↓
        ┌──────────────────────┼──────────────────────┐
        │                      │                       │
   ┌────▼────┐          ┌─────▼──────┐         ┌─────▼──────┐
   │  LOCAL  │          │    DEV     │         │    PROD    │
   │         │          │            │         │            │
   │ Docker  │          │  AWS RDS   │         │  AWS RDS   │
   │ No AWS  │          │  + SSO     │         │  + SSO     │
   │ No SSL  │          │  + Secrets │         │  + Secrets │
   └─────────┘          └────────────┘         └────────────┘
```

### Commands by Environment

| Environment | Start DB | Run Migrations | Check Status |
|-------------|----------|----------------|--------------|
| **Local** | `npm run db:local:up` | `npm run db:migrate:local` | `npm run db:migrate:local:status` |
| **Dev** | N/A (AWS managed) | `npm run db:migrate:dev` | `npm run db:migrate:dev:status` |
| **Prod** | N/A (AWS managed) | `npm run db:migrate:prod` | `npm run db:migrate:prod:status` |

---

### 🔧 How It Works

#### 1. Local Environment
```bash
npm run db:migrate:local
```

**What Happens:**
1. Sets `MIGRATION_ENV=local`
2. Loads `.env.local` (if exists, falls back to defaults)
3. Connects to `localhost:5432`
4. Shows connection details
5. Runs migrations (no confirmation required - safe!)

**Perfect For:**
- Daily development
- Testing new migrations
- Rapid iteration

---

#### 2. Running Deployments 

##### A. Single Manual Process for Both Environments

**To run migrations in DEVELOPMENT:**
```
1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Deploy Database Migrations"
4. Click "Run workflow"
5. Select environment: development
6. Click "Run workflow"
```

**To run migrations in PRODUCTION:**
```
Same steps, but select: production

##### B. Separate Deployment Scripts

```bash
npm run db:migrate:dev
```

**What Happens:**
1. Sets `MIGRATION_ENV=dev`
2. Loads `.env.development` (if exists)
3. **Checks AWS SSO session** for `rento-development-sso` profile
4. If expired → **Opens browser for login automatically**
5. **Fetches RDS endpoint** from CloudFormation stack `development-rento-rds`
6. **Fetches DB password** from Secrets Manager `rento/development/db-password`
7. Shows full connection details + checklist
8. **Requires typing "MIGRATE DEV"** to proceed
9. Runs migrations with SSL

**Perfect For:**
- Testing migrations in cloud environment
- Team collaboration
- Integration testing

---

#### 3. Production Environment (AWS RDS)
```bash
npm run db:migrate:prod
```

**What Happens:**
1. Sets `MIGRATION_ENV=prod`
2. Loads `.env.production` (if exists)
3. **Checks AWS SSO session** for `rento-production-sso` profile
4. If expired → **Opens browser for login automatically**
5. **Fetches RDS endpoint** from CloudFormation stack `production-rento-rds`
6. **Fetches DB password** from Secrets Manager `rento/production/db-password`
7. Shows **critical warning** + comprehensive checklist
8. **Requires typing "MIGRATE PRODUCTION"** to proceed
9. Runs migrations with SSL

**Perfect For:**
- Scheduled production deployments
- CI/CD automation
- Manual emergency fixes

### 🔧 Configuration Requirements

#### AWS CLI Profiles

Add to `~/.aws/config`:

```ini
[profile rento-development-sso]
sso_start_url = https://your-org.awsapps.com/start
sso_region = ap-northeast-1
sso_account_id = 123456789012  # Dev account
sso_role_name = DeveloperAccess
region = ap-northeast-1

[profile rento-production-sso]
sso_start_url = https://your-org.awsapps.com/start
sso_region = ap-northeast-1
sso_account_id = 987654321098  # Prod account
sso_role_name = AdminAccess
region = ap-northeast-1
```

---

### 🔒 Safety Features

#### 1. Environment Detection
Shows exactly where you're connecting:
```
✅ LOCAL → Safe, Docker
⚠️  DEV → AWS RDS Development
🚨 PROD → AWS RDS Production (danger!)
```

#### 2. Progressive Confirmation
- **Local**: None (safe)
- **Dev**: Type `MIGRATE DEV`
- **Prod**: Type `MIGRATE PRODUCTION`

---

### 📊 Migration Flow Diagram

```
User runs command
        ↓
┌───────────────────────┐
│ Detect MIGRATION_ENV  │
│  (local/dev/prod)     │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Load configuration    │
│  - Env file           │
│  - AWS profile        │
│  - Stack names        │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ AWS SSO (if needed)   │
│  - Check session      │
│  - Auto-login if exp  │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Fetch AWS resources   │ (if needed)
│  - RDS endpoint       │
│  - DB password        │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Display target info   │
│  - Connection details │
│  - Safety checklist   │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Get confirmation      │
│  (if not local/CI)    │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Connect to database   │
│  - Test health        │
│  - Create migrations  │
│    tracking table     │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Apply migrations      │
│  - Check if applied   │
│  - Verify checksum    │
│  - Run in transaction │
│  - Track environment  │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Verify success        │
│  - Health check       │
│  - Show status        │
└───────────────────────┘
```

---

### 🎓 Learning Resources

### Understanding the Code

Key sections in `migrate.ts`:

1. **Lines 72-100**: Environment configurations
2. **Lines 106-197**: AWS SSO manager
3. **Lines 203-330**: Configuration loader
4. **Lines 336-426**: Safety checks
5. **Lines 432-696**: Migration logic

---

## APPI Audit Event Types Management

The `appi_audit_event_types` table provides **type safety** for audit logging while maintaining **flexibility** for adding new event types.

## Current Event Types

### 📋 Consent Management
- `consent_read` - User consent data accessed
- `consent_validation_failed` - Consent validation check failed
- `consent_validated` - Consent validation check passed
- `consent_history_accessed` - User consent history accessed
- `consent_recorded` - Initial user consent recorded
- `consent_updated` - User consent preferences updated
- `consent_withdrawn` - User consent withdrawn
- `consent_change` - Generic consent change event

### 👤 User Management
- `user_data_access` - User data accessed
- `user_created` - New user account created
- `user_updated` - User account information updated
- `user_deleted` - User account deleted

### 📝 Profile Management
- `profile_data_access` - User profile data accessed
- `profile_created` - User profile created
- `profile_updated` - User profile information updated

### 🗑️ Deletion Management
- `deletion_request` - Data deletion request submitted
- `deletion_processing` - Data deletion request being processed
- `deletion_completed` - Data deletion request completed
- `deletion_cancelled` - Data deletion request cancelled

### 📊 Data Access
- `data_access` - Generic data access event
- `data_export` - User data exported for download

### 🔐 Authentication
- `login` - User login event
- `logout` - User logout event
- `login_failed` - User login attempt failed

### ✅ Compliance
- `audit_trail_generated` - Compliance audit trail generated
- `privacy_policy_updated` - Privacy policy version updated
- `compliance_report_generated` - Compliance report generated

---

## Adding New Event Types

### Option 1: Via SQL Migration (Recommended for planned additions)

Create a new migration file:

```sql
-- 004_add_new_event_types.sql
INSERT INTO "public"."appi_audit_event_types" (event_type, category, description) VALUES
    ('password_reset', 'authentication', 'User password reset requested'),
    ('password_changed', 'authentication', 'User password successfully changed');
```

### Option 2: Via Helper Function (For runtime additions)

```typescript
import { addAuditEventType, EVENT_CATEGORIES } from '@/lib/database/auditEventTypes';

await addAuditEventType({
  eventType: 'password_reset',
  category: EVENT_CATEGORIES.AUTHENTICATION,
  description: 'User password reset requested',
});
```

---

## Using Event Types in Code

### ✅ GOOD: Use constants for type safety

```typescript
import { AUDIT_EVENT_TYPES } from '@/lib/database/auditEventTypes';

await logConsentEvent(
  userId,
  AUDIT_EVENT_TYPES.CONSENT_READ, // ✅ Autocomplete + type safety
  { source: 'cache' },
  context
);
```

## Event Categories

Events are organized into these high-level categories:

- `data_access` - Data read/export operations
- `consent_management` - Consent recording and validation
- `user_management` - User CRUD operations
- `profile_management` - Profile CRUD operations
- `deletion_management` - Data deletion workflows
- `authentication` - Login/logout events
- `compliance` - Audit and reporting
- `system` - System-level events

## Database Roles

### Production Roles
- `rento_app_service` - Main application database access
- `rento_compliance_officer` - APPI compliance management
- `rento_admin` - Full database administration
- `rento_agent` - Limited access for real estate agents
- `rento_read_only` - Analytics and reporting access
- `rento_data_processor` - Migration and batch operations

### Security Features
- **Connection limits** per role
- **Statement timeouts** for query protection
- **SSL enforcement** (configure in pg_hba.conf)
- **Password policies** (update default passwords!)

## Performance Considerations

### Query Optimization
- All APPI compliance queries optimized for <100ms response
- Property search indices for rent/location/features
- User authentication indices for fast login
- Audit log indices for compliance reporting

### Maintenance
- **VACUUM** and **ANALYZE** scheduled for optimal performance
- **Index usage monitoring** via pg_stat_user_indexes
- **Connection pooling** recommended (pg_bouncer)
- **Query monitoring** via pg_stat_statements

## Security Checklist

### Before Production Deployment

- [ ] **Update all role passwords** (currently set to 'CHANGE_ME_IN_PRODUCTION')
- [ ] **Generate new encryption keys** (replace default keys in encryption_keys table)
- [ ] **Configure SSL certificates** (server.crt, server.key)
- [ ] **Update pg_hba.conf** for proper authentication methods
- [ ] **Set up backup procedures** with encryption
- [ ] **Configure monitoring and alerting**
- [ ] **Validate geographic data residency**

### Recommended pg_hba.conf
```
# TYPE  DATABASE        USER                    ADDRESS                 METHOD
hostssl rento_production rento_app_service      0.0.0.0/0               md5
hostssl rento_production rento_admin            127.0.0.1/32            cert
local   rento_production postgres                                        peer
```

### postgresql.conf Settings
```
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
log_statement = 'all'  # For audit compliance
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

## Monitoring and Maintenance

### Daily Checks
- Monitor `appi_audit_events` for compliance violations
- Check `appi_incident_tracking` for open incidents
- Verify `appi_data_residency_log` for geographic compliance
- Review connection counts and performance metrics

### Weekly Maintenance
- Run compliance violation monitoring function
- Review audit log sizes and retention
- Check index usage and query performance
- Validate backup procedures

### Monthly Reviews
- Performance optimization analysis
- Security review and updates
- Disaster recovery testing

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check role grants and RLS policies
   - Verify `app.current_user_cognito_id` is set correctly

2. **Slow Query Performance**
   - Check index usage with EXPLAIN ANALYZE
   - Review query patterns in pg_stat_statements
   - Consider additional indices for frequent filters

3. **APPI Compliance Violations**
   - Check `appi_audit_events` for violation details
   - Verify geographic data residency constraints
   - Review consent validation triggers

4. **Connection Issues**
   - Check connection limits per role
   - Verify SSL configuration
   - Review pg_hba.conf authentication rules

## Support and Documentation

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- APPI Guidelines: https://www.ppc.go.jp/en/
- Database Security Best Practices: Follow OWASP guidelines
- Backup and Recovery: Implement point-in-time recovery procedures

---