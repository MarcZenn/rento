#!/bin/bash

# ============================================================================
# DEPLOY POSTGRESQL RDS
# ============================================================================

set -e

ENVIRONMENT=${1:-development}
REGION="ap-northeast-1"
PROFILE="rento-development-sso"

echo "🐘 Deploying PostgreSQL RDS..."
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Generate secure database password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-24)
echo "🔐 Generated database password"
echo ""

# Deploy CloudFormation stack
aws cloudformation deploy \
  --profile $PROFILE \
  --template-file ../cloudformation-rds-postgres.yml \
  --stack-name rento-postgres-${ENVIRONMENT} \
  --parameter-overrides Environment=$ENVIRONMENT DBPassword=$DB_PASSWORD \
  --capabilities CAPABILITY_IAM \
  --region $REGION \
  --tags Environment=$ENVIRONMENT APPICompliant=true DataLocation=Japan-Tokyo

echo ""
echo "⏳ Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete \
  --profile $PROFILE \
  --stack-name rento-postgres-${ENVIRONMENT} \
  --region $REGION

echo ""
echo "✅ PostgreSQL RDS deployed successfully!"
echo ""

# Store password in Parameter Store
echo "🔐 Storing database password in Parameter Store..."
aws ssm put-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/postgres/password" \
  --value "$DB_PASSWORD" \
  --type "SecureString" \
  --region $REGION \
  --overwrite

# Get outputs
VPC_ID=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-postgres-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='VPCId'].OutputValue" \
  --output text)

APP_SG_ID=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-postgres-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='AppSecurityGroupId'].OutputValue" \
  --output text)

PRIVATE_SUBNETS=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-postgres-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='PrivateSubnetIds'].OutputValue" \
  --output text)

DB_ENDPOINT=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-postgres-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" \
  --output text)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DEPLOYMENT OUTPUTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "VPC ID: $VPC_ID"
echo "App Security Group: $APP_SG_ID"
echo "Private Subnets: $PRIVATE_SUBNETS"
echo "Database Endpoint: $DB_ENDPOINT"
echo ""
echo "💾 Save these values for next steps:"
echo ""
echo "export VPC_ID=$VPC_ID"
echo "export APP_SG_ID=$APP_SG_ID"
echo "export PRIVATE_SUBNETS=$PRIVATE_SUBNETS"
echo ""
