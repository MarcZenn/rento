# Post-Deployment Checklist

## Overview

After successfully deploying AWS infrastructure, complete these steps to verify and integrate the resources with your application.

---

## 1. Verify Deployment Success ✅

### Confirm All Stacks Created

```bash
# List all Rento CloudFormation stacks
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --region ap-northeast-1 | grep rento

# Expected output:
# rento-appi-cognito-development
# rento-appi-postgres-development
# rento-appi-redis-development
```

- [ ] Cognito stack: `CREATE_COMPLETE`
- [ ] PostgreSQL stack: `CREATE_COMPLETE`
- [ ] Redis stack: `CREATE_COMPLETE`

### Verify Generated Environment File

```bash
# Check .env file was created
ls -la .env.development

# View contents (secure terminal only!)
cat .env.development
```

- [ ] `.env.development` file exists in project root
- [ ] Contains `COGNITO_USER_POOL_ID`
- [ ] Contains `POSTGRES_HOST` and `POSTGRES_PASSWORD`
- [ ] Contains `REDIS_HOST`

### Verify AWS Console Resources

**Cognito (Tokyo Region):**
- [ ] Navigate to: https://ap-northeast-1.console.aws.amazon.com/cognito/v2/idp/user-pools
- [ ] Find: `development-rento-appi-users`
- [ ] Status: Active

**RDS (Tokyo Region):**
- [ ] Navigate to: https://ap-northeast-1.console.aws.amazon.com/rds/home?region=ap-northeast-1#databases:
- [ ] Find: `development-rento-postgres`
- [ ] Status: Available

**ElastiCache (Tokyo Region):**
- [ ] Navigate to: https://ap-northeast-1.console.aws.amazon.com/elasticache/home?region=ap-northeast-1#/redis
- [ ] Find Redis cluster
- [ ] Status: Available

**Parameter Store:**
```bash
# Verify parameters stored
aws ssm describe-parameters \
  --region ap-northeast-1 \
  --filters "Key=Name,Values=/development/rento/"
```

- [ ] Cognito parameters stored
- [ ] Database parameters stored
- [ ] Redis parameters stored

---

## 2. Database Setup 🐘

### Test Database Connection

```bash
# Verify connection to RDS PostgreSQL
npm run db:test
```

- [ ] Connection successful
- [ ] No SSL/TLS errors
- [ ] Correct database name confirmed

### Run Database Migrations

```bash
# Run initial schema migrations
npm run db:migrate

# Expected output: Migrations applied successfully
```

- [ ] Migrations completed without errors
- [ ] Schema version recorded

### Initialize APPI Compliance Tables

```bash
# Create APPI compliance-specific tables
npm run db:init-appi

# Expected: Creates tables for:
# - user_consent
# - consent_history
# - appi_audit_events
# - privacy_policy_versions
```

- [ ] APPI tables created
- [ ] Audit logging table operational
- [ ] Consent tracking tables ready

### Verify Database Schema

```bash
# Connect to database
npm run db:psql

# List all tables
\dt

# Check APPI tables exist
\d user_consent
\d appi_audit_events

# Exit
\q
```

- [ ] All expected tables exist
- [ ] APPI compliance tables have correct structure
- [ ] Indexes created properly

---

## 3. AWS Cognito Configuration 🔐

### Verify User Pool Settings

```bash
# Get User Pool details
aws cognito-idp describe-user-pool \
  --user-pool-id $(grep COGNITO_USER_POOL_ID .env.development | cut -d '=' -f2) \
  --region ap-northeast-1
```

- [ ] Password policy: 12+ characters, complexity requirements
- [ ] MFA: Optional (SOFTWARE_TOKEN_MFA, SMS_MFA)
- [ ] Custom attributes visible: `custom:consent_version`, etc.
- [ ] Advanced security: ENFORCED

### Verify App Clients

```bash
# List app clients
aws cognito-idp list-user-pool-clients \
  --user-pool-id $(grep COGNITO_USER_POOL_ID .env.development | cut -d '=' -f2) \
  --region ap-northeast-1
```

- [ ] Mobile app client exists
- [ ] Backend app client exists
- [ ] Both clients active

### Test User Creation (Optional)

```bash
# Create test user
aws cognito-idp admin-create-user \
  --user-pool-id $(grep COGNITO_USER_POOL_ID .env.development | cut -d '=' -f2) \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com \
  --temporary-password "TempPass123!" \
  --region ap-northeast-1
```

- [ ] Test user created successfully
- [ ] Temporary password generated
- [ ] User in `FORCE_CHANGE_PASSWORD` status

### Verify Lambda Triggers

```bash
# Check Lambda functions exist
aws lambda list-functions \
  --region ap-northeast-1 | grep rento

# Expected:
# development-rento-post-auth-audit
# development-rento-pre-token-gen
```

- [ ] Post-authentication trigger deployed
- [ ] Pre-token generation trigger deployed
- [ ] Lambda execution roles created

### Test Audit Logging

```bash
# View CloudWatch logs for audit events
aws logs tail /aws/cognito/development-rento-audit-logs \
  --region ap-northeast-1 \
  --follow
```

- [ ] Log group exists
- [ ] Can view logs
- [ ] 2-year retention configured

---

## 8. Testing & Validation 🧪

### End-to-End Authentication Test

**Full Flow:**
1. [ ] New user signs up via mobile app
2. [ ] Email verification received and confirmed
3. [ ] APPI consent modal appears
4. [ ] User provides consent
5. [ ] Consent saved to database and Cognito
6. [ ] User can sign in
7. [ ] JWT token received
8. [ ] GraphQL queries authenticated successfully
9. [ ] User data appears in PostgreSQL
10. [ ] Audit logs recorded in CloudWatch

### Security Validation

```bash
# Verify password policy enforcement
# Try creating user with weak password - should fail

# Verify JWT claims
# Decode token and check for APPI compliance claims
```

- [ ] Weak passwords rejected
- [ ] JWT includes custom APPI claims
- [ ] Tokens expire after 60 minutes
- [ ] Refresh tokens work correctly

### Performance Testing

```bash
# Test concurrent sign-ups/sign-ins
# Monitor Cognito throttling limits
```

- [ ] No throttling errors
- [ ] Response times acceptable (<200ms)
- [ ] Database connections stable

---

## 11. Cost Monitoring 💰

### Set Up Billing Alerts

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=2025-09-01,End=2025-09-30 \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --region us-east-1
```

- [ ] Billing alerts configured in AWS Console
- [ ] Budget set (~$60/month for development)
- [ ] Cost allocation tags applied to resources

### Review Resource Usage

- [ ] Cognito: Monitor MAU (Monthly Active Users)
- [ ] RDS: Check storage usage and IOPS
- [ ] ElastiCache: Monitor memory utilization
- [ ] Lambda: Track invocation count

---

## 12. Security Hardening 🔒

### Review Security Groups

```bash
# List security groups
aws ec2 describe-security-groups \
  --region ap-northeast-1 \
  --filters "Name=tag:Environment,Values=development"
```

- [ ] Only necessary ports open
- [ ] Database only accessible from app security group
- [ ] No public internet access to RDS
- [ ] Redis only accessible within VPC

### Enable MFA for IAM Users

- [ ] MFA enabled for all IAM users with deployment access
- [ ] Hardware or virtual MFA configured
- [ ] Backup MFA codes stored securely

### Rotate Access Keys

```bash
# Check key age
aws iam list-access-keys --user-name your-username

# Create rotation reminder
# Best practice: Rotate every 90 days
```

- [ ] Access key rotation schedule documented
- [ ] Calendar reminders set for key rotation
- [ ] Old keys deleted after new ones verified

---

## 13. Backup & Disaster Recovery 🔄

### Verify RDS Automated Backups

```bash
# Check backup retention
aws rds describe-db-instances \
  --db-instance-identifier development-rento-postgres \
  --query 'DBInstances[0].BackupRetentionPeriod'

# Expected: 14 days
```

- [ ] Automated backups enabled
- [ ] 14-day retention confirmed
- [ ] Backup window acceptable

### Test Database Restore (Optional but Recommended)

```bash
# Restore to point-in-time (test only - creates new instance)
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier development-rento-postgres \
  --target-db-instance-identifier development-rento-postgres-restore-test \
  --restore-time 2025-09-30T00:00:00Z \
  --region ap-northeast-1
```

- [ ] Understand restore procedure
- [ ] RTO (Recovery Time Objective) documented
- [ ] RPO (Recovery Point Objective) acceptable

---

## 14. Performance Optimization 🚀

### Enable Query Performance Insights

- [ ] Navigate to RDS console
- [ ] Enable Performance Insights for development instance
- [ ] Set retention to 7 days (free tier)

### Review Slow Queries

```bash
# Connect to database
npm run db:psql

# Enable slow query logging
SET log_min_duration_statement = 100;

# Run queries and monitor
```

- [ ] Identify slow queries
- [ ] Add indexes where needed
- [ ] Optimize N+1 query problems

---

## 15. Compliance Verification ✅

### APPI Compliance Checklist

- [ ] All data stored in Tokyo region (ap-northeast-1)
- [ ] User consent collected and tracked
- [ ] Audit logging operational
- [ ] Data encryption at rest (AES-256)
- [ ] Data encryption in transit (TLS 1.3)
- [ ] Password policies meet Japanese standards
- [ ] 2-year audit log retention
- [ ] Data deletion procedures documented

### Test Data Subject Rights

**Test these workflows:**
- [ ] Data access request (retrieve all user data)
- [ ] Data deletion request (1-hour SLA)
- [ ] Consent withdrawal
- [ ] Data portability (export user data)

---

## 16. Team Onboarding 👥

### Share Access

- [ ] Team members have AWS IAM accounts
- [ ] Development database credentials shared securely
- [ ] Cognito admin access granted
- [ ] CloudWatch dashboard shared

### Documentation

- [ ] Share `COGNITO_DEPLOYMENT.md`
- [ ] Share `PRE_DEPLOYMENT_CHECKLIST.md`
- [ ] Share `POST_DEPLOYMENT_CHECKLIST.md`
- [ ] Conduct team walkthrough of infrastructure

---

## Final Checklist ✅

### Infrastructure
- [ ] All CloudFormation stacks: `CREATE_COMPLETE`
- [ ] All resources accessible in AWS Console
- [ ] `.env.development` file generated
- [ ] Parameters stored in Parameter Store

### Database
- [ ] Connection successful
- [ ] Migrations completed
- [ ] APPI tables created
- [ ] Audit logging functional

### Authentication
- [ ] Cognito User Pool operational
- [ ] App clients configured
- [ ] Lambda triggers working
- [ ] JWT verification implemented

### Application
- [ ] Backend authentication integrated
- [ ] Mobile app configured with Amplify
- [ ] Consent modal implemented
- [ ] Clerk dependency removed

### Monitoring
- [ ] CloudWatch dashboards created
- [ ] Alarms configured
- [ ] Logs accessible
- [ ] Billing alerts set

### Documentation
- [ ] README updated
- [ ] Team onboarded
- [ ] `.env.sample` committed
- [ ] Runbooks created

---

## 🎉 Deployment Complete!

Your APPI-compliant infrastructure is now deployed and operational!

**Next Steps:**
1. Continue with remaining Archon tasks
2. Conduct security review
3. Plan production deployment
4. Schedule team training

---

## Quick Reference Commands

```bash
# View infrastructure
aws cloudformation list-stacks --region ap-northeast-1 | grep rento

# Test database
npm run db:test

# Run migrations
npm run db:migrate

# View logs
aws logs tail /aws/cognito/development-rento-audit-logs --follow

# Check costs
aws ce get-cost-and-usage --time-period Start=2025-09-01,End=2025-09-30 --granularity MONTHLY --metrics "BlendedCost"

# List Cognito users
aws cognito-idp list-users --user-pool-id <USER_POOL_ID> --region ap-northeast-1
```

---

## Support

- **Documentation**: `infrastructure/aws/COGNITO_DEPLOYMENT.md`
- **Troubleshooting**: Check CloudWatch Logs
- **AWS Support**: [Your support tier/contact]
- **Team Contact**: [Engineering lead contact]
