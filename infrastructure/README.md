# APPI Compliant Database Infrastructure

This directory contains the complete infrastructure setup for migrating Rento from Convex to self-hosted PostgreSQL + Redis with full APPI (Act on Protection of Personal Information) compliance for the Japanese market.

## 🏗️ Architecture Overview

### Core Components
- **PostgreSQL 15+** on AWS RDS (Tokyo region ap-northeast-1)
- **Redis 7+** on AWS ElastiCache for caching and session management
- **AES-256 encryption** for data at rest with AWS KMS
- **TLS 1.3** with certificate pinning for all connections
- **Multi-AZ deployment** within Tokyo region for high availability
- **Row Level Security (RLS)** for fine-grained access control
- **PII encryption** using pgcrypto for application-level protection

### APPI Compliance Features
- **Geographic data residency** enforcement (Japan-only)
- **Comprehensive audit logging** for all data access
- **Consent tracking** with full history
- **Data retention policies** with automated compliance
- **Incident tracking** and regulatory notification workflows
- **Encrypted PII fields** with decrypt functions for authorized access

## 📁 Directory Structure

```
infrastructure/
├── aws/
│   ├── cloudformation-rds-postgres.yml  # PostgreSQL RDS infrastructure
│   ├── cloudformation-redis.yml         # Redis ElastiCache setup
│   └── deploy.sh                        # Deployment script
├── database/
│   ├── 001_initial_schema.sql           # Complete PostgreSQL schema
│   ├── migrate.ts                       # Migration management
│   └── test-connection.ts               # Connection testing
└── README.md                            # This file
```

## 🚀 Deployment Instructions

### Prerequisites

1. **AWS CLI** configured with Tokyo region access
2. **Node.js 18+** with TypeScript support
3. **AWS IAM permissions** for RDS, ElastiCache, KMS, and VPC management

### Step 1: Deploy AWS Infrastructure

```bash
# Deploy to production
npm run infrastructure:deploy

# Deploy to development
npm run infrastructure:deploy:dev
```

This will:
- Create VPC with private subnets in Tokyo AZ-1a and AZ-1c
- Deploy PostgreSQL RDS with Multi-AZ and encryption
- Deploy Redis ElastiCache cluster with TLS
- Set up KMS keys for encryption
- Configure security groups and network isolation
- Generate secure passwords and store in Parameter Store

### Step 2: Install Dependencies

```bash
npm install
```

New dependencies added:
- `pg`: PostgreSQL client library
- `ioredis`: Redis client with TLS support
- `@types/pg`: TypeScript definitions

### Step 3: Configure Environment

The deployment script creates `.env.production` or `.env.development` with:

```env
# PostgreSQL Configuration
POSTGRES_HOST=<rds-endpoint>
POSTGRES_PORT=5432
POSTGRES_DB=rento_appi_db
POSTGRES_USER=rento_admin
POSTGRES_PASSWORD=<generated-password>
POSTGRES_SSL=require

# Redis Configuration
REDIS_HOST=<elasticache-endpoint>
REDIS_PORT=6379
REDIS_TLS=true

# Encryption Key for PII (generate securely)
APP_ENCRYPTION_KEY=<your-encryption-key>
```

### Step 4: Run Database Migrations

```bash
# Check migration status
npm run db:status

# Apply all migrations
npm run db:migrate

# Initialize APPI compliance data
npm run db:init-appi
```

### Step 5: Test Connections

```bash
npm run db:test
```

This comprehensive test suite validates:
- Basic database connectivity
- PostgreSQL functionality and extensions
- Redis caching and sessions
- APPI compliance features
- Performance benchmarks

## 📊 Database Schema

### Core Tables
- `users` - User accounts (PII encrypted)
- `profiles` - User profiles with RLS
- `user_consent` - APPI consent tracking
- `consent_history` - Full audit trail
- `privacy_policy_versions` - Policy version management

### APPI Compliance Tables
- `appi_audit_events` - All data access events
- `appi_data_residency_log` - Geographic compliance tracking
- `appi_incident_tracking` - Security incident management

### Property & Location Tables
- `properties` - Rental properties
- `agencies` - Real estate agencies
- `agents` - Individual agents
- `wards` - Japanese administrative divisions
- `prefectures` - Japanese prefectures

### Messaging Tables
- `chats` - User-agent conversations
- `messages` - Individual messages with translation

## 🔐 Security Features

### Encryption
- **AES-256 at rest** via AWS RDS encryption with KMS
- **TLS 1.3 in transit** for all connections
- **Application-level PII encryption** using pgcrypto
- **Key rotation** enabled on KMS keys

### Access Control
- **Row Level Security** on all user data tables
- **Database roles** with minimal privileges
- **Connection pooling** with secure session management
- **IP-based access control** via security groups

### APPI Compliance
- **Data residency validation** ensuring Japan-only storage
- **Consent granularity** with purpose-specific tracking
- **Audit logging** for all data operations
- **Automated retention** policies
- **Incident response** workflows

## 🧪 Testing & Validation

### Automated Tests
Run `npm run db:test` to execute comprehensive validation:

1. **Connection Health** - PostgreSQL and Redis connectivity
2. **Functionality Tests** - Basic operations and transactions
3. **APPI Compliance** - Audit logging, RLS, and encryption
4. **Performance Benchmarks** - Sub-100ms response time validation

### Manual Verification
1. Check AWS Console for resource deployment
2. Verify data residency in Tokyo region only
3. Test encryption/decryption of PII fields
4. Validate audit log generation

## 📈 Performance Targets

### APPI Compliance Requirements
- **<100ms** consent validation queries
- **<200ms** audit log queries
- **1-hour** data deletion processing (SLA)
- **8-hour** backup recovery (RTO)

### Infrastructure Specifications
- **Multi-AZ** deployment for 99.95% availability
- **Connection pooling** for efficient resource usage
- **Read replicas** (can be added later for read-heavy workloads)
- **Automated backups** with 14-day retention

## 🔄 Migration from Convex

The migration process involves:

1. **Schema Conversion** - Convex documents → PostgreSQL tables
2. **Data Migration** - Export/transform/import existing data
3. **Function Migration** - Convex functions → PostgreSQL procedures/Node.js
4. **GraphQL Integration** - Update resolvers to use PostgreSQL
5. **Testing & Validation** - Comprehensive functionality testing

### Key Changes
- **Document IDs** - Convex IDs → PostgreSQL UUIDs
- **Schema Enforcement** - Flexible documents → Structured tables
- **Relationships** - References via foreign keys
- **Indexes** - Optimized for common query patterns
- **Transactions** - Full ACID compliance

## 🚨 Monitoring & Alerts

### CloudWatch Metrics
- Database connection counts
- Query execution times
- Error rates and failed connections
- Memory and CPU utilization

### APPI Compliance Monitoring
- Data residency violations
- Consent compliance rates
- Audit log completeness
- Incident response times

## 📚 Operational Procedures

### Daily Operations
- Monitor connection health via `npm run db:test`
- Review audit logs for compliance
- Check backup completion status

### Weekly Operations
- Review query performance metrics
- Validate encryption key rotation
- Test disaster recovery procedures

### Monthly Operations
- Compliance reporting generation
- Security audit of access logs
- Performance optimization review

## 🆘 Troubleshooting

### Common Issues

**Connection Timeouts**
```bash
# Check security group configuration
# Verify VPC connectivity
# Test from application server
```

**High Latency**
```bash
# Review connection pooling configuration
# Check for long-running queries
# Verify network routing
```

**Migration Failures**
```bash
npm run db:status  # Check applied migrations
npm run db:test    # Validate connections
# Review migration logs
```

### Emergency Procedures
1. **Data Breach Response** - Follow incident tracking procedures
2. **Service Outage** - Multi-AZ failover should be automatic
3. **Compliance Violation** - Immediate audit log review and remediation

## 📞 Support

For issues with this infrastructure:
1. Check CloudWatch logs for AWS resources
2. Run `npm run db:test` for connectivity validation
3. Review PostgreSQL logs for database-specific issues
4. Monitor Redis ElastiCache metrics for cache performance

---

**⚠️ IMPORTANT**: This infrastructure handles sensitive personal data under APPI regulations. All operations must maintain audit trails and comply with Japanese data protection laws.