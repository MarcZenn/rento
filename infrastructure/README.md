# APPI Compliant Database Infrastructure

This directory contains the complete infrastructure setup for the self-hosted PostgreSQL + Redis & Lambda triggers with full APPI (Act on Protection of Personal Information) compliance for the Japanese market.

## 🏗️ Architecture Overview

### Core Components
- **PostgreSQL 15+** on AWS RDS (Tokyo region ap-northeast-1)
- **Redis 7+** on AWS ElastiCache for caching and session management
- **PreSignup Lambda+** AWS Lambda for keeping Cognito + DB synced
- **PostConfirmation Lambda+** AWS Lambda for keeping Cognito + DB synced
- **AES-256 encryption** for data at rest with AWS KMS
- **TLS 1.3** with certificate pinning for all connections
- **Multi-AZ deployment** within Tokyo region for high availability
- **Row Level Security (RLS)** for fine-grained access control
- **PII encryption** using pgcrypto for application-level protection
- **GitHub OIDC Provider & Roles** enables keyless GitHub Actions deployments
- **AWS Codebuild Migration Projects** enables database migrations via GitHub Actions

**3-Tier Architecture**:
- Security Layers (3-Tier Architecture):
- Public Tier:   EC2 GraphQL API (public subnet, internet-facing)
                 ↓
  Private Tier:  RDS + Redis (private subnet, NO internet access)
- Least Privilege: Databases should NEVER be in public subnets -
  they should only be accessible from application servers
- APPI Compliance: Separating tiers is actually BETTER for
  compliance (defense in depth)
- Flexibility: You can tear down/rebuild the public networking
  without touching your databases

### APPI Compliance Features
- **Geographic data residency** enforcement (Japan-only)
- **Comprehensive audit logging** for all data access
- **Consent tracking** with full history
- **Data retention policies** with automated compliance
- **Incident tracking** and regulatory notification workflows
- **Encrypted PII fields** with decrypt functions for authorized access

Industry Standard Architecture

  ┌─────────────────────────────────────────────┐
  │           Internet (Public)                 │
  └──────────────────┬──────────────────────────┘
                     │ HTTPS/TLS
           ┌─────────▼─────────┐
           │  Internet Gateway │
           └─────────┬─────────┘
                     │
      ┌──────────────┴──────────────┐
      │   Public Subnet (10.0.10/24)│  ← EC2 GraphQL API
      │   - EC2 with Elastic IP     │    (APPI Compliant)
      │   - Security Group: 443,4000│
      └──────────────┬──────────────┘
                     │ Internal VPC routing
      ┌──────────────▼──────────────┐
      │  Private Subnet (10.0.1/24) │  ← RDS + Redis
      │   - PostgreSQL RDS          │    (APPI Compliant)
      │   - Redis ElastiCache       │
      │   - NO Internet Access      │
      └─────────────────────────────┘

### Prerequisites

Ensure you have:

- AWS CLI v2.x installed
- AWS SSO configured with profiles:
  - `rento-development-sso`
  - `rento-production-sso`
- Admin access to GitHub repository: `marczenn/rento`
- Appropriate AWS IAM permissions

**Verify AWS CLI:**
```bash
aws --version
# Should show: aws-cli/2.x.x or higher
```

**Verify AWS SSO:**
```bash
aws sts get-caller-identity --profile rento-development-sso
aws sts get-caller-identity --profile rento-production-sso
```

### Step 1: Deploy AWS Infrastructure

Reference the `deployment_guide.md` in /deploy to understand how to manage and deploy all AWS resources.

### Step 2: Run Database Migrations

Reference the `README.md` file in the `/server/database/` directory for database migrations instructions.

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