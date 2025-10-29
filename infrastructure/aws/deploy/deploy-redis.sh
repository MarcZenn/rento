#!/bin/bash

# ============================================================================
# DEPLOY REDIS ELASTICACHE
# ============================================================================

set -e

ENVIRONMENT=${1:-development}
REGION="ap-northeast-1"
PROFILE="rento-development-sso"

echo "🔴 Deploying Redis ElastiCache..."
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Get VPC and Security Group from PostgreSQL stack
echo "📋 Getting VPC details from PostgreSQL stack..."
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

if [ -z "$VPC_ID" ] || [ -z "$APP_SG_ID" ]; then
  echo "❌ Error: Could not get VPC details from PostgreSQL stack"
  echo "Make sure PostgreSQL RDS is deployed first:"
  echo "  ./deploy-rds.sh $ENVIRONMENT"
  exit 1
fi

echo "✅ VPC ID: $VPC_ID"
echo "✅ App Security Group: $APP_SG_ID"
echo ""

# Deploy CloudFormation stack
echo "🚀 Deploying Redis stack..."
aws cloudformation deploy \
  --profile $PROFILE \
  --template-file ../cloudformation-redis.yml \
  --stack-name rento-redis-${ENVIRONMENT} \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    VPCId=$VPC_ID \
    AppSecurityGroupId=$APP_SG_ID \
  --region $REGION \
  --tags Environment=$ENVIRONMENT APPICompliant=true DataLocation=Japan-Tokyo

echo ""
echo "⏳ Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete \
  --profile $PROFILE \
  --stack-name rento-redis-${ENVIRONMENT} \
  --region $REGION

echo ""
echo "✅ Redis ElastiCache deployed successfully!"
echo ""

# Get outputs
REDIS_ENDPOINT=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-redis-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='RedisEndpoint'].OutputValue" \
  --output text)

REDIS_PORT=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-redis-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='RedisPort'].OutputValue" \
  --output text)

# Store in Parameter Store
echo "🔐 Storing Redis endpoint in Parameter Store..."
aws ssm put-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/redis/endpoint" \
  --value "$REDIS_ENDPOINT" \
  --type "String" \
  --region $REGION \
  --overwrite

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DEPLOYMENT OUTPUTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Redis Endpoint: $REDIS_ENDPOINT"
echo "Redis Port: $REDIS_PORT"
echo ""
