# Rento PostgreSQL Database Schema

This directory contains the complete APPI-compliant PostgreSQL database schema for the Rento Japanese rental application, migrated and enhanced from the original Convex schema.

**CRITICAL**: This schema contains production-ready APPI compliance features but requires proper security configuration before deployment. Always test in a development environment first.

## File Overview

- `001_initial_schema.sql` - **Complete consolidated schema** with all tables, indices, security, and APPI compliance features
- `README.md` - This documentation file


## Quick Setup

```bash
# Create database and run complete schema
createdb rento_production -O postgres
psql -U postgres -d rento_production -f 001_initial_schema.sql
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

## Schema Migration from Convex

### Key Changes
1. **UUID Primary Keys** - All tables use UUID instead of Convex IDs
2. **Proper Foreign Keys** - Full referential integrity
3. **Array Fields** - PostgreSQL arrays for multi-value fields
4. **Timestamp Handling** - TIMESTAMP WITH TIME ZONE for all dates
5. **CHECK Constraints** - Data validation at database level

### Convex to PostgreSQL Mapping
- `v.id("table")` → `UUID REFERENCES table(id)`
- `v.string()` → `VARCHAR(255)` or `TEXT`
- `v.boolean()` → `BOOLEAN`
- `v.int64()` → `BIGINT`
- `v.float64()` → `DECIMAL(12,2)` or `DECIMAL(10,8)` for coordinates
- `v.array()` → PostgreSQL arrays `TYPE[]`
- `v.optional()` → `NULL` allowed

### Index Optimization
- **Composite indices** for frequent query patterns
- **Partial indices** for filtered queries
- **GIN indices** for array operations
- **Covering indices** for common column combinations

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
- [ ] **Test APPI compliance workflows**
- [ ] **Validate geographic data residency**
- [ ] **Test consent management flows**
- [ ] **Verify audit log generation**

### Recommended pg_hba.conf
```
# TYPE  DATABASE        USER                    ADDRESS                 METHOD
hostssl rento_production rento_app_service      0.0.0.0/0               md5
hostssl rento_production rento_compliance_officer 0.0.0.0/0            cert
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

## Data Migration Strategy

1. **Export from Convex** using the migration scripts
2. **Transform data formats** (Convex IDs → UUIDs, timestamps, etc.)
3. **Load into PostgreSQL** with validation
4. **Verify data integrity** and foreign key constraints
5. **Test application connectivity**
6. **Validate APPI compliance features**

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
- Compliance officer review of audit trails
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