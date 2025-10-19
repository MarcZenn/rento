# Pre-Deployment Checklist

## Overview

This checklist ensures you're ready to deploy APPI-compliant infrastructure to AWS Tokyo region. Complete all items before running deploy script `deploy.sh`

**IMPORTANT: This project uses AWS SSO (IAM Identity Center) for credential management. If you do not yet have access to AWS Identity Center Access Portal please ask your AWS administrator for access.** 

### Why AWS SSO?

✅ **Security Benefits:**
- Temporary credentials that auto-expire
- Built-in MFA enforcement
- No long-term access keys to rotate
- Centralized access management
- Complete audit trails

---

## 0. Configure AWS SSO (One-Time Setup - Required)

### Initial SSO Configuration

**Step 1: Configure SSO Profile**

Development Environment

```bash
# Configure development environment
aws configure sso --profile rento-development-sso

# You'll be prompted for:
# SSO session name: rento-dev
# SSO start URL: https://<your-org>.awsapps.com/start - ask your AWS Admin for this value
# SSO region: ap-northeast-1
# SSO registration scopes: sso:account:access
# CLI default region: ap-northeast-1
# CLI output format: json

# Then select:
# - Your AWS account (rento-development)
# - Role: RentoDeveloper
```

Production Environment

```bash
# Configure production environment
aws configure sso --profile rento-production-sso

# Use same SSO start URL, but select:
# - Production AWS account
# - Appropriate production role
```

**Step 2: Verify SSO Configuration**

```bash
# Login to development
aws sso login --profile rento-development-sso

# Login to production
aws sso login --profile rento-production-sso

# Verify access
aws sts get-caller-identity --profile rento-development-sso

# Expected output:
# {
#     "UserId": "AROAI...:user@example.com",
#     "Account": "123456789012",
#     "Arn": "arn:aws:sts::123456789012:assumed-role/RoleName/user@example.com"
# }
```

**Step 3: Set Default Profile (Optional)**

```bash
# Set environment variable for your session (dev)
export AWS_PROFILE=rento-development-sso

# Set environment variable for your session (prod)
export AWS_PROFILE=rento-production-sso

# Or add to your shell profile (~/.zshrc or ~/.bashrc)
echo 'export AWS_PROFILE=rento-development-sso' >> ~/.zshrc
```

**Step 4: Pre-deployment Checklist**

- [ ] SSO profiles configured for both development and production
- [ ] Successfully logged in with `aws sso login`
- [ ] Verified access with `aws sts get-caller-identity`
- [ ] Default profile set (optional but recommended)

### SSO Session Management

**Login before each deployment session:**

```bash
# Login to development
aws sso login --profile rento-development-sso

# Login to production
aws sso login --profile rento-production-sso

# Check session status
aws sts get-caller-identity --profile rento-development-sso
```

**Session expires after 12 hours** - you'll need to re-login:

```bash
# If you see "Token has expired", just login again
aws sso login --profile rento-development-sso
```

---

## 1. AWS Account Setup

### ✅ AWS Account Verification

```bash
# Verify which AWS account you're using depending on which env you are working with

# dev
aws sts get-caller-identity --profile rento-development-sso

# prod
aws sts get-caller-identity --profile rento-production-sso

# Expected output shows your AWS account ID

```
**Expected output:**
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

### ✅ AWS CLI Configuration

```bash
# Check AWS CLI version (minimum: 2.x)
aws --version

# Check configured region
aws configure get region

# If not set to Tokyo, configure it
aws configure set region ap-northeast-1
```

- [ ] AWS CLI version 2.x or higher installed
- [ ] Region set to `ap-northeast-1` (Tokyo)

---

## 2. AWS Credentials Verification

### ✅ Verify Active SSO Session

**You should have completed Section 0 (SSO Configuration) before this step.**

```bash
# Verify you're using the correct SSO profile
aws sts get-caller-identity --profile rento-development-sso

# Expected output shows assumed role (not IAM user):
# {
#     "UserId": "AROAI...:user@example.com",
#     "Account": "123456789012",
#     "Arn": "arn:aws:sts::123456789012:assumed-role/RoleName/user@example.com"
# }
```

**Important indicators:**
- ✅ Arn contains `assumed-role` (SSO is working)
- ❌ Arn contains `user` (you're using access keys - not recommended)

- [ ] SSO session active and verified
- [ ] Correct AWS account confirmed
- [ ] Assumed role (not IAM user) confirmed

### Alternative Credential Methods (Not Recommended for Local Development)

<details>
<summary>⚠️ Legacy Method: IAM User with Access Keys (CI/CD Only)</summary>

**Only use for automated CI/CD pipelines where SSO is not available.**

```bash
# Configure access keys
aws configure --profile rento-cicd

# Store in GitHub Actions secrets or similar
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
```

**Cons:**
- ❌ Long-term credentials (security risk if leaked)
- ❌ Must manually rotate keys every 90 days
- ❌ No MFA enforcement
- ❌ Harder to revoke access

</details>

<details>
<summary>Alternative: IAM Role (EC2/Container Deployments)</summary>

If deploying from EC2 or ECS/Fargate, attach IAM role to instance.

**Pros:**
- ✅ No credentials to manage
- ✅ Automatic credential rotation
- ✅ Scoped to instance

**Cons:**
- ⚠️ Only works on AWS compute resources

</details>

**Credential Priority Order (AWS CLI):**
1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. SSO credentials (`~/.aws/sso/cache/`)
3. AWS credentials file (`~/.aws/credentials`)
4. Container credentials (ECS)
5. Instance profile credentials (EC2)

---

## 3. IAM Permissions Verification

### ✅ Required IAM Permissions

Your IAM user/role must have these permissions:

```bash
# Test CloudFormation access
aws cloudformation list-stacks --region ap-northeast-1

# Test Cognito access
aws cognito-idp list-user-pools --max-results 10 --region ap-northeast-1

# Test RDS access
aws rds describe-db-instances --region ap-northeast-1

# Test ElastiCache access
aws elasticache describe-cache-clusters --region ap-northeast-1

# Test Lambda access
aws lambda list-functions --region ap-northeast-1

# Test Systems Manager Parameter Store access
aws ssm describe-parameters --region ap-northeast-1
```

**Required IAM Policy (Minimum):**

Policy Name=`rentodevopspolicy`

- Ask AWS admin for policy definition

---

## 4. Cost Awareness

### ✅ AWS Billing Setup

```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=2025-09-01,End=2025-09-30 \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --region us-east-1
```

- [ ] AWS billing alerts configured
- [ ] Budget set (recommended: $300/month for production)
- [ ] Cost allocation tags understood
- [ ] Team aware of monthly costs

---

## 5. Deployment Parameters

### ✅ Environment Configuration

```bash
# Review deployment parameters
cat infrastructure/aws/cloudformation-cognito-userpool.yml | grep -A 10 "Parameters:"
```

**Key Parameters to Review:**
- **Environment**: `production` or `development`
- **DomainPrefix**: `rento-auth-production` (must be globally unique)
- **CallbackURLs**: Update for your app scheme
- **LogoutURLs**: Update for your app scheme

- [ ] Callback URLs updated for your app
- [ ] Domain prefix is unique (no conflicts with existing Cognito domains)
- [ ] Environment parameter matches intent (prod vs dev)

---

## 6. Network & Security Review

### ✅ VPC & Networking

The deployment creates:
- New VPC (10.0.0.0/16)
- 2 Private subnets (Multi-AZ: 1a, 1c)
- Security groups with restrictive rules

**Conflicts to check:**
```bash
# List existing VPCs
aws ec2 describe-vpcs --region ap-northeast-1

# Check for CIDR conflicts
# Make sure 10.0.0.0/16 is not already in use
```

- [ ] No VPC CIDR conflicts (10.0.0.0/16 available)
- [ ] Understand security group rules
- [ ] Reviewed network architecture

### ✅ Security Considerations

- [ ] Deployment creates DeletionProtection=true for RDS (prevents accidental deletion)
- [ ] All data encrypted at rest (AES-256)
- [ ] All connections use TLS 1.3
- [ ] Audit logging enabled (2-year retention)
- [ ] Password policies meet Japanese banking standards

---

## 7. Backup & Rollback Plan

### ✅ Existing Infrastructure (if updating)

```bash
# List existing CloudFormation stacks
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --region ap-northeast-1 | grep rento

# Export existing stack templates (backup)
aws cloudformation get-template \
  --stack-name rento-appi-cognito-production \
  --region ap-northeast-1 > backup-cognito-template.json
```

- [ ] Existing stacks documented
- [ ] Stack templates backed up
- [ ] Rollback procedure understood

### ✅ Rollback Strategy

If deployment fails:

1. **CloudFormation automatic rollback**: Enabled by default
2. **Manual rollback**:
   ```bash
   aws cloudformation delete-stack \
     --stack-name rento-appi-cognito-production \
     --region ap-northeast-1
   ```
3. **Restore from backup**: Use backed-up templates

---

## 8. Monitoring & Logging

### ✅ Post-Deployment Monitoring

Prepare monitoring tools:

```bash
# Install AWS CLI plugins for real-time monitoring
pip install awslogs

# Prepare CloudWatch dashboard
# (manual setup in AWS Console after deployment)
```

- [ ] CloudWatch dashboard prepared
- [ ] Log monitoring tools ready
- [ ] Team assigned to monitor deployment

---

## 9. Communication & Documentation

### ✅ Team Communication

- [ ] Team notified of deployment window
- [ ] Deployment scheduled during low-traffic period
- [ ] Point person assigned for deployment
- [ ] Escalation contacts identified

### ✅ Documentation

- `cognito_documentation.md`
- `deploy.sh`
- Post-deployment tasks identified:
  - `post_deployment_checklist.md`
  - Database schema migration
  - APPI compliance table initialization
  - Mobile app configuration
  - Backend JWT verification setup

---

## 10. Final Pre-Flight Checks

### ✅ Dry Run (Optional but Recommended)

```bash
# Deploy to development environment first
npm run infrastructure:deploy:dev

# Verify resources created successfully
aws cloudformation describe-stacks \
  --stack-name rento-appi-cognito-development \
  --region ap-northeast-1

# Test connectivity and functionality
# Then tear down dev environment if successful
```

- [ ] Development deployment tested successfully
- [ ] All resources verified in AWS Console
- [ ] Connectivity tests passed

### ✅ Production Deployment Go/No-Go

**Go Criteria:**
- ✅ All checklist items completed
- ✅ AWS credentials configured and tested
- ✅ IAM permissions verified
- ✅ Costs approved
- ✅ Team ready to monitor
- ✅ Rollback plan in place

**No-Go Criteria:**
- ❌ Missing IAM permissions
- ❌ Budget not approved
- ❌ Team not available to monitor
- ❌ Deployment window conflicts with high traffic

---

## 11. Deployment Execution

### ✅ Run Deployment

```bash
# Ensure SSO session is active
aws sso login --profile rento-production-sso

# Verify AWS account one final time
aws sts get-caller-identity --profile rento-production-sso

# Execute deployment with SSO profile
AWS_PROFILE=rento-production-sso npm run infrastructure:deploy

# Monitor CloudFormation events in separate terminal
AWS_PROFILE=rento-production-sso watch -n 5 'aws cloudformation describe-stack-events \
  --stack-name rento-appi-cognito-production \
  --region ap-northeast-1 \
  --max-items 10'
```

**Expected Duration:**
- Cognito: ~2-3 minutes
- RDS PostgreSQL: ~15-20 minutes (Multi-AZ)
- Redis ElastiCache: ~5-7 minutes
- **Total**: ~25-30 minutes

### ✅ During Deployment

- [ ] Monitor CloudFormation console for errors
- [ ] Watch script output for failures
- [ ] Keep terminal open (don't interrupt)
- [ ] Document any errors or warnings

---

## 12. Post-Deployment Verification

### ✅ Verify Resources Created

```bash
# Verify Cognito User Pool
aws cognito-idp describe-user-pool \
  --user-pool-id <USER_POOL_ID> \
  --region ap-northeast-1

# Verify RDS instance
aws rds describe-db-instances \
  --db-instance-identifier production-rento-postgres \
  --region ap-northeast-1

# Verify Redis cluster
aws elasticache describe-cache-clusters \
  --cache-cluster-id <CLUSTER_ID> \
  --region ap-northeast-1

# Verify Parameters in Parameter Store
aws ssm get-parameter \
  --name "/production/rento/cognito/user-pool-id" \
  --region ap-northeast-1
```

- [ ] Cognito User Pool created and healthy
- [ ] RDS instance available
- [ ] Redis cluster available
- [ ] Parameters stored in Parameter Store
- [ ] `.env.production` file created locally

### ✅ Next Steps

1. **Run database migrations**:
   ```bash
   npm run db:migrate
   npm run db:init-appi
   ```

2. **Configure mobile app** with Cognito credentials (Task 9)

3. **Implement backend JWT verification** (Task 5)

4. **Test authentication flow** end-to-end

---

## Troubleshooting Common Issues

### Issue: "Access Denied" during deployment

**Solution:**
```bash
# Verify IAM permissions
aws iam get-user
aws iam list-attached-user-policies --user-name <USERNAME>
```

### Issue: Stack already exists

**Solution:**
```bash
# Update existing stack instead
aws cloudformation update-stack \
  --stack-name rento-appi-cognito-production \
  --template-body file://cloudformation-cognito-userpool.yml \
  --region ap-northeast-1
```

### Issue: Cognito domain already taken

**Solution:**
Update `DomainPrefix` parameter in deployment:
```bash
# Use different prefix
aws cloudformation deploy \
  --parameter-overrides DomainPrefix="rento-auth-prod-v2"
```

### Issue: VPC CIDR conflict

**Solution:**
Edit `cloudformation-rds-postgres.yml` and change VPC CIDR block:
```yaml
CidrBlock: '10.1.0.0/16'  # Instead of 10.0.0.0/16
```

---

## Quick Reference Commands

```bash
# SSO Login
aws sso login --profile rento-development-sso
aws sso login --profile rento-production-sso

# Check AWS account (verify SSO)
aws sts get-caller-identity --profile rento-development-sso

# Deploy production
AWS_PROFILE=rento-production-sso npm run infrastructure:deploy

# Deploy development
AWS_PROFILE=rento-development-sso npm run infrastructure:deploy:dev

# Monitor deployment
aws cloudformation describe-stacks --region ap-northeast-1 --profile rento-production-sso

# View logs
aws logs tail /aws/cognito/production-rento-audit-logs --follow --profile rento-production-sso

# Get parameter
aws ssm get-parameter --name "/production/rento/cognito/user-pool-id" --region ap-northeast-1 --profile rento-production-sso

# Delete stack (rollback)
aws cloudformation delete-stack --stack-name rento-appi-cognito-production --region ap-northeast-1 --profile rento-production-sso
```

---

## Contact & Support

- **Deployment Issues**: [Your team contact]
- **AWS Support**: [Support tier/contact]
- **Emergency Rollback**: [Point person contact]

---

**✅ CHECKLIST COMPLETE - READY TO DEPLOY** 🚀
