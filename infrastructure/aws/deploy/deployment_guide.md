# Rento AWS Infrastructure Deployment Guide

## Overview

The Rento infrastructure consists of multiple CloudFormation stacks with dependencies. This guide walks you through deploying the complete Rento infrastructure to AWS Tokyo region (ap-northeast-1) for APPI compliance.

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Order                         │
└─────────────────────────────────────────────────────────────┘

 1. GitHub OIDC Provider & Roles ← START HERE (NEW!)
    └─ Enables keyless GitHub Actions deployments

 2. VPC & Networking
    └─ Creates network foundation

 3. Security Groups & IAM
    └─ Sets up security boundaries

 4. RDS Database
    └─ Depends on: VPC, Security Groups
    └─ Creates: Database exports for other stacks

 5. Redis Cache
    └─ Depends on: VPC, Security Groups

 6. CodeBuild Migration Projects
    └─ Depends on: GitHub OIDC, VPC, RDS
    └─ Enables: Database migrations via GitHub Actions

 7. Cognito User Pools
    └─ User authentication

 8. EC2 / ECS (if applicable)
    └─ Application hosting

 9. Application Deployment
    └─ Depends on: All above
```

---

## Prerequisites

### 1. AWS SSO Configuration

You must use AWS SSO to manage and deploy AWS resources via AWS CLI. If SSO is not yet configured please follow `pre_deployment_checklist.md` Section 0.

```bash
# Verify AWS SSO is configured
aws sts get-caller-identity --profile rento-development-sso

### 2. IAM Permissions (Required for CloudFormation)

**Ask your AWS administrator to update these if needed**:

If new policies are added, refresh credentials:
```bash
aws sso logout --profile rento-development-sso
aws sso login --profile rento-development-sso
```

### 3. EC2 Key Pair (Required for EC2 deployment)

**Create a key pair for SSH access to EC2**:

```bash
cd infrastructure/aws/scripts
./create-ssh-key.sh development
```

**Verify key pair exists**:

Development: 

```bash
aws ec2 describe-key-pairs --profile rento-development-sso --region ap-northeast-1 --key-name rento-development
```

Production:

```bash
aws ec2 describe-key-pairs --profile rento-production-sso --region ap-northeast-1 --key-name rento-production
```

---

## Deployment Architecture

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                             │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐     ┌───▼────┐
    │ Lambda  │    │ Lambda  │     │  EC2   │
    │PreSignup│    │PostConf │     │GraphQL │
    └────┬────┘    └────┬────┘     └───┬────┘
         │               │              │
         └───────────────┼──────────────┘
                         │ HTTP POST
                         │
         ┌───────────────▼───────────────┐
         │      GraphQL API (EC2)        │
         │  http://[IP]:4000/graphql     │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐     ┌───▼────┐
    │Cognito  │    │PostgreSQL│     │ Redis  │
    │UserPool │    │   RDS    │     │ElastiC │
    └─────────┘    └──────────┘     └────────┘
         │               │                │
         └───────VPC─────┴────────────────┘
                (Tokyo Region)
```

---

## Deployment Steps

Deploys are handled via individual deployment scripts for each AWS resource.

#### Step 1: Deploy GitHub OIDC Provider & Roles 🔐

**Purpose:** Enable GitHub Actions to authenticate with AWS without long-lived credentials

**Command:**

Development: 

```bash
cd infrastructure/aws/deploy
./deploy-github-oidc.sh dev
```

Production: 

```bash
cd infrastructure/aws/deploy
./deploy-github-oidc.sh prod
```

**What it creates:**
- GitHub OIDC Provider (once per AWS account)
- IAM Role: `GitHubActionsRole-development`
- IAM Role: `GitHubActionsRole-production`
- Policies for CodeBuild triggering

**Post-deployment:**
1. Copy the role ARNs from the output
2. Add to GitHub Secrets:
   - `AWS_ROLE_ARN_DEVELOPMENT`
   - `AWS_ROLE_ARN_PRODUCTION`
   - `AWS_ACCOUNT_ID_DEVELOPMENT`
   - `AWS_ACCOUNT_ID_PRODUCTION`

**Time:** ~2-3 minutes per environment

---

#### Step 2: Deploy VPC & Networking 🌐

**Purpose:** Create the network foundation for all resources

Development: 

```bash
./deploy-vpc-public-networking.sh development
```

Production: 

```bash
./deploy-vpc-public-networking.sh production
```

**What it creates:**
- VPC with public and private subnets for EC2
- Internet Gateway
- NAT Gateway
- Route Tables
- Network ACLs

**Exports:**
- `{environment}-rento-vpc-id`
- `{environment}-rento-public-subnet-ids`
- `{environment}-rento-private-subnet-ids`

**Time:** ~5-7 minutes per environment

---

####  Step 3:  Deploy PostgreSQL RDS Database 🗄️

**Purpose:** PostgreSQL database for application data

**Command:**

Development: 

```bash
cd infrastructure/aws/deploy
./deploy-rds.sh development
```

Production: 

```bash
cd infrastructure/aws/deploy
./deploy-rds.sh production
```

**What it creates:**
- RDS PostgreSQL instance
- Security groups
- KMS encryption key
- SSM parameters for credentials
- Automated backups

**Exports:**
- `{environment}-rento-db-endpoint`
- `{environment}-rento-kms-key-id`
- `{environment}-rento-app-sg-id`

**Dependencies:**
- ✅ VPC (Step 2)

**Time:** ~10-15 minutes per environment

---

#### Step 4: Deploy Redis ElastiCache 📦

**Purpose:** ElastiCache Redis for session storage and caching

**Command:**

Development: 

```bash
./deploy-redis.sh development
```

Production:
```bash
./deploy-redis.sh production
```

**What it creates:**
- ElastiCache Redis cluster
- Security groups
- Subnet groups

**Exports:**
- `{environment}-rento-redis-endpoint`

**Dependencies:**
- ✅ VPC (Step 2)

**Time:** ~5-10 minutes per environment

---

#### Step 5: Deploy Codebuild Migration Projects 🚀

**Purpose:** Automated database migration execution via GitHub Actions

Development: 

```bash
cd ../../../server/deploy
./deploy-codebuild.sh dev
```

Production: 

```bash
cd ../../../server/deploy
./deploy-codebuild.sh prod
```

**What it creates:**
- CodeBuild project for migrations
- IAM role for CodeBuild
- CloudWatch Log Groups
- VPC configuration for private RDS access

**Exports:**
- `{environment}-rento-migration-codebuild-name`
- `{environment}-rento-migration-codebuild-arn`

**Dependencies:**
- ✅ GitHub OIDC (Step 1) - for GitHub Actions to trigger
- ✅ VPC (Step 2) - for VPC access
- ✅ RDS (Step 3) - for database access

**Time:** ~3-5 minutes per environment

---

#### Step 6: Deploy EC2 GraphQL API Infrastructure

```bash
./deploy-ec2-infrastructure.sh development
```

**Time**: ~5-10 minutes | **What it creates**: EC2 instance with Node.js + PM2 in public subnet

**Wait 2-3 minutes** after this step for EC2 to initialize before deploying code.

---

#### Step 7: Deploy GraphQL Application Code

```bash
cd ../../../server/deploy
./deploy-to-ec2.sh development
```

**Time**: ~2-3 minutes | **What it does**: Builds & deploys your GraphQL server

---

#### Step 8: Deploy AWS Cognito + Lambda Triggers 👤

**Purpose:** User authentication and authorization

**Command:**

Development: 

```bash
./deploy-cognito.sh development
```

Production: 

```bash
./deploy-cognito.sh production
```

**What it creates:**
- Cognito User Pool
- User Pool Client
- Lambda triggers (pre-signup, post-confirmation)
- IAM roles for Lambda functions

**Exports:**
- `{environment}-rento-user-pool-id`
- `{environment}-rento-user-pool-client-id`

**Time:** ~3-5 minutes per environment

---


## Deployment Summary

After completing all steps, you should have:

✅ **PostgreSQL RDS** - Running and accessible from VPC
✅ **Redis ElastiCache** - Running and accessible from VPC
✅ **EC2 GraphQL API** - Running at `http://[IP]:4000/graphql`
✅ **AWS Cognito** - User pool with Lambda triggers
✅ **Database Schema** - Migrated and ready

---

## Verification Checklist

### Test Database Connectivity
```bash
cd server
npm run db:dev:test
```

### Test GraphQL API
```bash
curl http://$GRAPHQL_API_IP:4000/health

# GraphQL query
curl -X POST http://$GRAPHQL_API_IP:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

### Test Cognito User Creation
```bash
# Create test user
aws cognito-idp admin-create-user \
  --profile rento-development-sso \
  --user-pool-id <USER_POOL_ID> \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com \
  --temporary-password "TempPass123!" \
  --region ap-northeast-1

# Check if user was created in PostgreSQL
# (Lambda trigger should have created user record)
```

### Check CloudWatch Logs
```bash
# EC2 application logs
aws logs tail /aws/ec2/development-rento-graphql --follow \
  --profile rento-development-sso \
  --region ap-northeast-1

# Lambda logs
aws logs tail /aws/lambda/development-rento-pre-signup --follow \
  --profile rento-development-sso \
  --region ap-northeast-1
```

---

## Common Issues & Troubleshooting

### Issue: EC2 instance can't connect to RDS

**Solution**: Verify security groups
```bash
# EC2 must be in App Security Group
aws ec2 describe-instances \
  --profile rento-development-sso \
  --instance-ids <INSTANCE_ID> \
  --region ap-northeast-1 \
  --query 'Reservations[0].Instances[0].SecurityGroups'

# Should include the App Security Group from RDS stack
```

### Issue: Lambda functions can't reach GraphQL API

**Solution**: Check GraphQL API URL
```bash
# Get Lambda environment variables
aws lambda get-function-configuration \
  --profile rento-development-sso \
  --function-name $PRE_SIGNUP_FUNCTION \
  --region ap-northeast-1 \
  --query 'Environment.Variables.GRAPHQL_API_URL'

# Should be: http://[EC2_IP]:4000/graphql
```

### Issue: SSH to EC2 fails

**Solution**: Check key pair and security group
```bash
# Verify key pair exists
aws ec2 describe-key-pairs \
  --profile rento-development-sso \
  --key-names rento-development \
  --region ap-northeast-1

# Verify security group allows SSH from your IP
aws ec2 describe-security-groups \
  --profile rento-development-sso \
  --group-ids <SECURITY_GROUP_ID> \
  --region ap-northeast-1
```

---

## Cost Monitoring

### Check Current Month Costs
```bash
aws ce get-cost-and-usage \
  --profile rento-development-sso \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --region us-east-1
```

### Set Up Billing Alerts
1. Go to AWS Console → CloudWatch → Alarms
2. Create alarm for estimated charges > $100/month
3. Send notification to email

---

## Next Steps

1. **Configure Mobile App** with Cognito credentials
2. **Test End-to-End Authentication Flow**
3. **Set Up CI/CD Pipeline** for automatic deployments
4. **Configure Custom Domain** for GraphQL API (optional)
5. **Set Up Monitoring & Alerts** for production readiness

---

## Common Deployment Issues

### CloudWatch LogGroup Creation Failed

**Error**: `The specified log group does not exist` during CREATE operation

**Cause**: Invalid retention value (730 is not valid, must use 731 for 2 years)

**Solution**: CloudFormation template uses `RetentionInDays: 731` (already fixed)

### IAM Permission Errors

**Error**: `User is not authorized to perform: logs:PutRetentionPolicy`

**Solution**: Add CloudWatchLogsManagement and IAMInstanceProfileManagement policies to RentoDeveloper role (see Prerequisites section)

### Elastic IP Creation Failed

**Error**: `Network vpc-xxx is not attached to any internet gateway`

**Cause**: VPC lacks public networking components

**Solution**: Deploy VPC public networking stack first: `./deploy-vpc-public-networking.sh development`

### Orphaned Resources After Failed Deployment

**Solution**: Use cleanup scripts:
```bash
./complete-cleanup.sh development      # Clean up all orphaned resources
./cleanup-orphaned-iam.sh development  # Clean up IAM roles/profiles
```

---

## Cleanup (Delete All Resources)

To remove all infrastructure (in reverse order):

```bash
# 1. Delete Cognito
aws cloudformation delete-stack \
  --stack-name rento-cognito-dev \
  --profile rento-development-sso

# 2. Delete CodeBuild
aws cloudformation delete-stack \
  --stack-name rento-codebuild-migrations-dev \
  --profile rento-development-sso

# 3. Delete Redis
aws cloudformation delete-stack \
  --stack-name rento-redis-dev \
  --profile rento-development-sso

# 4. Delete RDS (WARNING: This deletes your database!)
aws cloudformation delete-stack \
  --stack-name rento-postgres-dev \
  --profile rento-development-sso

# 5. Delete VPC
aws cloudformation delete-stack \
  --stack-name rento-vpc-dev \
  --profile rento-development-sso

# 6. Delete GitHub OIDC (last - shared across environments)
aws cloudformation delete-stack \
  --stack-name rento-github-oidc-dev \
  --profile rento-development-sso
```

**⚠️  WARNING:** Always take RDS snapshots before deleting production stacks!

---

## Support

- **Documentation**: See `infrastructure/aws/` directory
- **Issues**: Check CloudWatch Logs for errors
- **AWS Support**: Contact AWS support for infrastructure issues
