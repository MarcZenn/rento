# Rento PostgreSQL Database Schema

This directory contains the complete APPI-compliant PostgreSQL database schema for the Rento Japanese rental application.

**CRITICAL**: This schema contains production-ready APPI compliance features but requires proper security configuration before deployment. Always test in a development environment first.

## File Overview

- `001_initial_schema.sql` - **Initial Schema Setup** with all tables, indices, security, and APPI compliance features
- `README.md` - This documentation file


## Quick Setup

```bash
# Create database and run complete schema
yarn run db:up 
yarn run db:migrate
```

## Production Setup

```bash
# 1. Create database with proper encoding for Japanese
createdb rento_production \
  --owner=postgres \
  --encoding=UTF8 \
  --lc-collate=ja_JP.UTF-8 \
  --lc-ctype=ja_JP.UTF-8 \
  --template=template0

# 2. Run the consolidated schema (includes all tables, indices, triggers, security)
psql -U postgres -d rento_production -f 001_initial_schema.sql

# 3. Verify setup completed successfully
psql -U postgres -d rento_production -c "
SELECT 'Schema Setup Complete' AS status,
       COUNT(*) FILTER (WHERE table_schema = 'public') AS tables_created,
       (SELECT COUNT(*) FROM pg_roles WHERE rolname LIKE 'rento_%') AS roles_created
FROM information_schema.tables;"
```

## Migrations

Whenever a new migration is needed please adhere to the following steps: 

1. Create a new migration file in the `/database` directory. It must be sequentially numbered and titled according to what it does in the DB. Example `004_add_table_name.sql`
2. Add the new migration file to the `MIGRATIONS` array in the `migrations.ts` file. 
3. Run the migration `yarn run db:migrate`

## APPI Compliance Features

### Audit Tables
- `appi_audit_events` - Comprehensive user activity logging
- `appi_data_residency_log` - Geographic data storage validation
- `appi_incident_tracking` - Compliance incident management
- `consent_history` - Detailed consent change tracking

### Data Protection
- **Row Level Security (RLS)** on all user-sensitive tables
- **Field-level encryption** for PII data
- **Geographic validation** ensuring Japan-only data storage
- **Automated consent logging** with IP and timestamp tracking
- **2-year audit retention** with automated cleanup

### Compliance Automation
- **Consent change triggers** - Automatic history logging
- **Data deletion workflows** - 30-day deletion scheduling
- **Compliance monitoring** - Violation detection and alerting
- **Geographic validation** - Real-time data residency checks

### APPI Audit Event Types Management

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