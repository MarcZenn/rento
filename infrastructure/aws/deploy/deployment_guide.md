# Rento AWS Infrastructure Deployment Guide

## Overview

This guide walks you through deploying the complete Rento infrastructure to AWS Tokyo region (ap-northeast-1) for APPI compliance.

**Infrastructure Components**:
1. ✅ **PostgreSQL RDS** - Primary database (Multi-AZ) + VPC with private subnets
2. ✅ **Redis ElastiCache** - Caching & session storage
3. ✅ **VPC Public Networking** - Internet Gateway + public subnets (no cost)
4. ✅ **EC2 GraphQL API** - Application server in public subnet
5. ✅ **AWS Cognito** - User authentication & authorization

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

####  Step 1:  Deploy PostgreSQL RDS

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

**Time**: ~15-20 minutes | **What it creates**: VPC + PostgreSQL RDS

Verify Deployment: 

Output all

```bash
aws cloudformation describe-stacks --profile rento-<environment>-sso
```

Output VPC

```bash
aws ec2 describe-vpcs --profile rento-<environment>-sso
```

Output Security Group

```bash
aws ec2 describe-security-groups --profile rento-<environment>-sso
```

---

#### Step 2: Deploy Redis ElastiCache

```bash
./deploy-redis.sh development
```

**Time**: ~5-7 minutes | **What it creates**: Redis cluster

---

#### Step 3: Deploy VPC Public Networking

This enables EC2 instances to use Elastic IPs and be internet-accessible while keeping databases in private subnets (3-tier architecture for APPI compliance).

Development: 

```bash
./deploy-vpc-public-networking.sh development
```

Production: 

```bash
./deploy-vpc-public-networking.sh production
```

**Time**: ~2-3 minutes | **What it creates**: Internet Gateway + public subnets for EC2

---

#### Step 4: Deploy EC2 GraphQL API Infrastructure

```bash
./deploy-ec2-infrastructure.sh development
```

**Time**: ~5-10 minutes | **What it creates**: EC2 instance with Node.js + PM2 in public subnet

**Wait 2-3 minutes** after this step for EC2 to initialize before deploying code.

---

#### Step 5: Deploy GraphQL Application Code

```bash
cd ../../../server/deploy
./deploy-to-ec2.sh development
```

**Time**: ~2-3 minutes | **What it does**: Builds & deploys your GraphQL server

---

#### Step 6: Deploy AWS Cognito + Lambda Triggers

```bash
./deploy-cognito.sh development
```

**Time**: ~2-3 minutes | **What it creates**: Cognito User Pool + Lambda functions

---

#### Step 6: Deploy GitHub OIDC Provider & Roles

Development: 

```bash
cd ../../../server/deploy
./deploy-github-oidc.sh dev
```

Production: 

```bash
cd ../../../server/deploy
./deploy-github-oidc.sh prod
```

**Time**: ~2-3 minutes | **What it creates**: GitHub Open ID Connect Provider

#### Step 7: Deploy Codebuild

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

**Time**: ~2-3 minutes | **What it creates**: AWS Codebuild to allow GitHub Actions DB migrations

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

**WARNING**: This deletes all infrastructure and data!

```bash
# Delete in reverse order

# Delete Cognito
aws cloudformation delete-stack \
  --profile rento-development-sso \
  --stack-name rento-cognito-development \
  --region ap-northeast-1

# Delete EC2
aws cloudformation delete-stack \
  --profile rento-development-sso \
  --stack-name rento-graphql-ec2-development \
  --region ap-northeast-1

# Delete VPC Public Networking
aws cloudformation delete-stack \
  --profile rento-development-sso \
  --stack-name rento-vpc-public-networking-development \
  --region ap-northeast-1

# Delete Redis
aws cloudformation delete-stack \
  --profile rento-development-sso \
  --stack-name rento-redis-development \
  --region ap-northeast-1

# Delete PostgreSQL (takes longest due to deletion protection)
aws cloudformation delete-stack \
  --profile rento-development-sso \
  --stack-name rento-postgres-development \
  --region ap-northeast-1
```

---

## Support

- **Documentation**: See `infrastructure/aws/` directory
- **Issues**: Check CloudWatch Logs for errors
- **AWS Support**: Contact AWS support for infrastructure issues
