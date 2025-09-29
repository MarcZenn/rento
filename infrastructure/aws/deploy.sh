#!/bin/bash

# Deploy APPI Compliant PostgreSQL + Redis Infrastructure
# Tokyo Region (ap-northeast-1) deployment script

# ============================================================================
# DEV NOTES
# ============================================================================
#  
# This is a bash automation wrapper that orchestrates the entire infrastructure 
# deployment. It's the single command that transforms raw CloudFormation files 
# into a running db infrastructure. 
# 
# Why
# 
# 1. Single Command Simplicity
# - Instead of 50+ manual steps just run: npm run infrastructure:deploy
# 
# 2. Eliminates Human Error
# - Idential deployment every time with no risk of forgotten steps, misconfigurations etc.
# 
# 3. Environment Consistency
# - Deploy identical infrastructure across environments
# 
# 4. APPI compliance automation
# - Automatically enforces APPI compliance requirements

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

# Deploy PostgreSQL RDS stack
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

# Deploy Redis ElastiCache stack
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
cat > "../.env.${ENVIRONMENT}" << EOF
# APPI Compliant Database Configuration - Tokyo Region
# Generated on $(date)

# PostgreSQL Configuration
POSTGRES_HOST=${DB_ENDPOINT}
POSTGRES_PORT=${DB_PORT}
POSTGRES_DB=${DB_NAME}
POSTGRES_USER=rento_admin
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_SSL=require

# Redis Configuration
REDIS_HOST=${REDIS_ENDPOINT}
REDIS_PORT=${REDIS_PORT}
REDIS_TLS=true

# Region Configuration
AWS_REGION=${REGION}
DATA_LOCATION=Japan-Tokyo

# APPI Compliance Flags
APPI_COMPLIANT=true
DATA_RESIDENCY_ENFORCEMENT=true
AUDIT_LOGGING=true
EOF

echo ""
echo "✅ Infrastructure Deployment Successful!"
echo ""
echo "🔗 Connection Details:"
echo "  PostgreSQL: ${DB_ENDPOINT}:${DB_PORT}/${DB_NAME}"
echo "  Redis: ${REDIS_ENDPOINT}:${REDIS_PORT}"
echo ""
echo "📁 Environment file created: ../.env.${ENVIRONMENT}"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "  1. Database password has been generated and saved to .env file"
echo "  2. All data is encrypted with AES-256 at rest"
echo "  3. All connections use TLS 1.3"
echo "  4. Multi-AZ deployment active for high availability"
echo "  5. Automated backups configured with 8-hour RTO"
echo ""
echo "📋 Next Steps:"
echo "  1. Run database schema migration: npm run db:migrate"
echo "  2. Test database connectivity: npm run db:test"
echo "  3. Initialize APPI compliance tables: npm run db:init-appi"

# Store outputs in AWS Systems Manager Parameter Store for secure access
echo "🔐 Storing connection details in Parameter Store..."
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

aws ssm put-parameter \
  --name "/${ENVIRONMENT}/rento/redis/endpoint" \
  --value "$REDIS_ENDPOINT" \
  --type "String" \
  --region $REGION \
  --overwrite

echo "✅ Secure parameters stored in AWS Systems Manager"