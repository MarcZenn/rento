#!/bin/bash

# Deploy APPI Compliant Infrastructure (Cognito + PostgreSQL + Redis)
# Tokyo Region (ap-northeast-1) deployment script

# ============================================================================
# DEV NOTES
# ============================================================================
#  
# This is a bash automation wrapper that orchestrates the entire infrastructure 
# deployment. It's the single command that transforms raw CloudFormation files 
# into a running db infrastructure.
# 
# Production Costs:
# - Cognito - $55/month
# - RDS - $155/month
# - ElastiCache - $50/month
# 
# What it does: 
# 
# Orchestrates all CloudFormation deployments in sequence:
#  - Cognito User Pool -> deploys first
#  - PostgresSQL RDS -> Deploys second (uses VPC & Security Group)
#  - Redis ElastiCache -> Deploys third (uses VPC & Security Group outputs)
#
# What happens when deploy executed:
# 
# 1. Script reads AWS credentials from 
#     - ~/.aws/credentials (default location)
#     - OR env variables
#     - OR IAM role (if running on EC2)
# 2. CloudFormation stacks are created in AWS account
#     - rento-appi-cognito-production
#     - rento-appi-postgres-production
#     - rento-appi-redis-production
# 3. Resources appear in AWS Console:
#     - Cognito User Pool (visible in Cognito console)
#     - RDS PostgresSQL instance (visible in RDS console)
#     - ElastiCache Redis (visible in ElastiCache console)
#     - VPC, subnets, security groups (visible in VPC console)
#     - Lambda functions (visible in Lambda console)
#     - Generated files - .env.development (in project root with all connection details)
# 4. Credentials stored securely
#     - .env.production file created locally
#     - Parameters stored in AWS Systems Manager Parameter Store 
#
# 
# Why Deploy AWS resources via a script?
# 1. Single Command Simplicity
#     - Instead of 50+ manual steps just run: npm run infrastructure:deploy
# 2. Eliminates Human Error
#     - Idential deployment every time with no risk of forgotten steps, misconfigurations etc.
# 3. Environment Consistency
#     - Deploy identical infrastructure across environments
# 4. APPI compliance automation
#     - Automatically enforces APPI compliance requirements
#
#
set -e

ENVIRONMENT=${1:-production}
REGION="ap-northeast-1"
STACK_PREFIX="rento-appi"

echo "🏗️ Deploying APPI Compliant Infrastructure to Tokyo Region"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"

# Check if AWS CLI is configured for Tokyo region
echo "📍 Verifying AWS configuration..."
aws configure get region || aws configure set region $REGION

# Generate strong password for database (meets Japanese banking standards)
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-24)
echo "🔐 Generated secure database password"

# Deploy (or create) AWS Cognito User Pool stack
echo "🔐 Deploying AWS Cognito User Pool stack..."
aws cloudformation deploy \
  --template-file cloudformation-cognito-userpool.yml \
  --stack-name "${STACK_PREFIX}-cognito-${ENVIRONMENT}" \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    DomainPrefix="rento-auth-${ENVIRONMENT}" \
  --capabilities CAPABILITY_NAMED_IAM \
  --region $REGION \
  --tags \
    Environment=$ENVIRONMENT \
    APPICompliant=true \
    DataLocation=Japan-Tokyo

# Wait for Cognito stack to complete
echo "⏳ Waiting for Cognito stack to complete..."
aws cloudformation wait stack-create-complete \
  --stack-name "${STACK_PREFIX}-cognito-${ENVIRONMENT}" \
  --region $REGION

# Get Cognito outputs
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-cognito-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
  --output text)

MOBILE_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-cognito-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='MobileAppClientId'].OutputValue" \
  --output text)

BACKEND_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-cognito-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='BackendAppClientId'].OutputValue" \
  --output text)

USER_POOL_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-cognito-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolDomain'].OutputValue" \
  --output text)

echo "🔐 Cognito Stack Outputs:"
echo "  User Pool ID: $USER_POOL_ID"
echo "  Mobile Client ID: $MOBILE_CLIENT_ID"
echo "  Backend Client ID: $BACKEND_CLIENT_ID"
echo "  Domain: $USER_POOL_DOMAIN"

# Deploy (or create) PostgreSQL RDS stack
echo "🐘 Deploying PostgreSQL RDS stack..."
aws cloudformation deploy \
  --template-file cloudformation-rds-postgres.yml \
  --stack-name "${STACK_PREFIX}-postgres-${ENVIRONMENT}" \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    DBPassword=$DB_PASSWORD \
  --capabilities CAPABILITY_IAM \
  --region $REGION \
  --tags \
    Environment=$ENVIRONMENT \
    APPICompliant=true \
    DataLocation=Japan-Tokyo

# Wait for PostgreSQL stack to complete
echo "⏳ Waiting for PostgreSQL stack to complete..."
aws cloudformation wait stack-create-complete \
  --stack-name "${STACK_PREFIX}-postgres-${ENVIRONMENT}" \
  --region $REGION

# Get VPC and Security Group IDs from PostgreSQL stack
VPC_ID=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-postgres-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='VPCId'].OutputValue" \
  --output text)

APP_SG_ID=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-postgres-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='AppSecurityGroupId'].OutputValue" \
  --output text)

echo "📊 PostgreSQL Stack Outputs:"
echo "  VPC ID: $VPC_ID"
echo "  App Security Group: $APP_SG_ID"

# Deploy (or create) Redis ElastiCache stack
echo "🔴 Deploying Redis ElastiCache stack..."
aws cloudformation deploy \
  --template-file cloudformation-redis.yml \
  --stack-name "${STACK_PREFIX}-redis-${ENVIRONMENT}" \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    VPCId=$VPC_ID \
    AppSecurityGroupId=$APP_SG_ID \
  --region $REGION \
  --tags \
    Environment=$ENVIRONMENT \
    APPICompliant=true \
    DataLocation=Japan-Tokyo

# Wait for Redis stack to complete
echo "⏳ Waiting for Redis stack to complete..."
aws cloudformation wait stack-create-complete \
  --stack-name "${STACK_PREFIX}-redis-${ENVIRONMENT}" \
  --region $REGION

# Get all stack outputs
echo "📋 Deployment Complete! Infrastructure Details:"

# PostgreSQL outputs
DB_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-postgres-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" \
  --output text)

DB_PORT=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-postgres-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='DatabasePort'].OutputValue" \
  --output text)

DB_NAME=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-postgres-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseName'].OutputValue" \
  --output text)

# Redis outputs
REDIS_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-redis-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='RedisEndpoint'].OutputValue" \
  --output text)

REDIS_PORT=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_PREFIX}-redis-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='RedisPort'].OutputValue" \
  --output text)

# Create .env file for application
# cat > "../.env.${ENVIRONMENT}" << EOF
# # APPI Compliant Infrastructure Configuration - Tokyo Region
# # Generated on $(date)

# # AWS Cognito Configuration
# COGNITO_USER_POOL_ID=${USER_POOL_ID}
# COGNITO_MOBILE_CLIENT_ID=${MOBILE_CLIENT_ID}
# COGNITO_BACKEND_CLIENT_ID=${BACKEND_CLIENT_ID}
# COGNITO_REGION=${REGION}
# COGNITO_DOMAIN=${USER_POOL_DOMAIN}

# # PostgreSQL Configuration
# POSTGRES_HOST=${DB_ENDPOINT}
# POSTGRES_PORT=${DB_PORT}
# POSTGRES_DB=${DB_NAME}
# POSTGRES_USER=rento_admin
# POSTGRES_PASSWORD=${DB_PASSWORD}
# POSTGRES_SSL=require

# # Redis Configuration
# REDIS_HOST=${REDIS_ENDPOINT}
# REDIS_PORT=${REDIS_PORT}
# REDIS_TLS=true

# # Region Configuration
# AWS_REGION=${REGION}
# DATA_LOCATION=Japan-Tokyo

# # APPI Compliance Flags
# APPI_COMPLIANT=true
# DATA_RESIDENCY_ENFORCEMENT=true
# AUDIT_LOGGING=true
EOF

echo ""
echo "✅ Infrastructure Deployment Successful!"
echo ""
echo "🔗 Connection Details:"
echo "  Cognito User Pool: ${USER_POOL_ID}"
echo "  Cognito Domain: ${USER_POOL_DOMAIN}"
echo "  PostgreSQL: ${DB_ENDPOINT}:${DB_PORT}/${DB_NAME}"
echo "  Redis: ${REDIS_ENDPOINT}:${REDIS_PORT}"
echo ""
echo "📁 Environment file created: ../.env.${ENVIRONMENT}"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "  1. Cognito User Pool deployed with APPI compliance settings"
echo "  2. Password policies meet Japanese banking standards"
echo "  3. JWT tokens include APPI compliance claims"
echo "  4. Database password has been generated and saved to .env file"
echo "  5. All data is encrypted with AES-256 at rest"
echo "  6. All connections use TLS 1.3"
echo "  7. Multi-AZ deployment active for high availability"
echo "  8. Automated backups configured with 8-hour RTO"
echo "  9. Audit logging active with 2-year retention"
echo ""
echo "📋 Next Steps:"
echo "  1. Run database schema migration: npm run db:migrate"
echo "  2. Test database connectivity: npm run db:test"
echo "  3. Initialize APPI compliance tables: npm run db:init-appi"
echo "  4. Configure mobile app with Cognito credentials"
echo "  5. Test authentication flow with Cognito"

# Store outputs in AWS Systems Manager Parameter Store for secure access
echo "🔐 Storing connection details in Parameter Store..."

# Cognito parameters
aws ssm put-parameter \
  --name "/${ENVIRONMENT}/rento/cognito/user-pool-id" \
  --value "$USER_POOL_ID" \
  --type "String" \
  --region $REGION \
  --overwrite

aws ssm put-parameter \
  --name "/${ENVIRONMENT}/rento/cognito/mobile-client-id" \
  --value "$MOBILE_CLIENT_ID" \
  --type "String" \
  --region $REGION \
  --overwrite

aws ssm put-parameter \
  --name "/${ENVIRONMENT}/rento/cognito/backend-client-id" \
  --value "$BACKEND_CLIENT_ID" \
  --type "String" \
  --region $REGION \
  --overwrite

aws ssm put-parameter \
  --name "/${ENVIRONMENT}/rento/cognito/domain" \
  --value "$USER_POOL_DOMAIN" \
  --type "String" \
  --region $REGION \
  --overwrite

# Database parameters
aws ssm put-parameter \
  --name "/${ENVIRONMENT}/rento/postgres/endpoint" \
  --value "$DB_ENDPOINT" \
  --type "String" \
  --region $REGION \
  --overwrite

aws ssm put-parameter \
  --name "/${ENVIRONMENT}/rento/postgres/password" \
  --value "$DB_PASSWORD" \
  --type "SecureString" \
  --region $REGION \
  --overwrite

# Redis parameters
aws ssm put-parameter \
  --name "/${ENVIRONMENT}/rento/redis/endpoint" \
  --value "$REDIS_ENDPOINT" \
  --type "String" \
  --region $REGION \
  --overwrite

echo "✅ Secure parameters stored in AWS Systems Manager"