#!/bin/bash

# ============================================================================
# DEPLOY EC2 GRAPHQL API INFRASTRUCTURE
# ============================================================================
# This deploys the EC2 instance infrastructure (not the application code)
# Use server/deploy/deploy-to-ec2.sh to deploy the actual GraphQL application
# ============================================================================

set -e

ENVIRONMENT=${1:-development}
REGION="ap-northeast-1"
PROFILE="rento-development-sso"
KEY_PAIR_NAME=${2:-rento-${ENVIRONMENT}}

echo "🖥️  Deploying EC2 GraphQL API Infrastructure..."
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "Key Pair: $KEY_PAIR_NAME"
echo ""

# Verify key pair exists
echo "🔑 Verifying EC2 key pair exists..."
if ! aws ec2 describe-key-pairs \
  --profile $PROFILE \
  --key-names $KEY_PAIR_NAME \
  --region $REGION &>/dev/null; then
  echo ""
  echo "❌ Error: Key pair '$KEY_PAIR_NAME' not found!"
  echo ""
  echo "Create it with:"
  echo "  aws ec2 create-key-pair \\"
  echo "    --profile $PROFILE \\"
  echo "    --key-name $KEY_PAIR_NAME \\"
  echo "    --region $REGION \\"
  echo "    --query 'KeyMaterial' \\"
  echo "    --output text > ~/.ssh/$KEY_PAIR_NAME.pem"
  echo ""
  echo "  chmod 400 ~/.ssh/$KEY_PAIR_NAME.pem"
  echo ""
  exit 1
fi
echo "✅ Key pair exists"
echo ""

# Get VPC details from PostgreSQL stack
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

# Get subnets - prefer public subnets from networking stack
echo ""
echo "📋 Getting subnet details..."

PUBLIC_SUBNETS=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-vpc-public-networking-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='PublicSubnetIds'].OutputValue" \
  --output text 2>/dev/null || echo "")

if [ -n "$PUBLIC_SUBNETS" ]; then
  echo "✅ Using Public Subnets: $PUBLIC_SUBNETS"
  SUBNET_IDS="$PUBLIC_SUBNETS"
else
  echo "⚠️  Public networking stack not found"
  echo "⚠️  Deploy public networking first:"
  echo "    ./deploy-vpc-public-networking.sh $ENVIRONMENT"
  echo ""
  exit 1
fi

echo ""

# Deploy CloudFormation stack
echo "🚀 Deploying EC2 infrastructure stack..."
aws cloudformation deploy \
  --profile $PROFILE \
  --template-file ../cloudformation-graphql-ec2.yml \
  --stack-name rento-graphql-ec2-${ENVIRONMENT} \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    InstanceType=t3.micro \
    VPCId=$VPC_ID \
    PrivateSubnetIds=$SUBNET_IDS \
    AppSecurityGroupId=$APP_SG_ID \
    KeyPairName=$KEY_PAIR_NAME \
    AllowedSSHCIDR=0.0.0.0/0 \
    NodeVersion=20 \
  --capabilities CAPABILITY_NAMED_IAM \
  --region $REGION \
  --tags Environment=$ENVIRONMENT APPICompliant=true DataLocation=Japan-Tokyo

echo ""
echo "⏳ Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete \
  --profile $PROFILE \
  --stack-name rento-graphql-ec2-${ENVIRONMENT} \
  --region $REGION

echo ""
echo "✅ EC2 infrastructure deployed successfully!"
echo ""

# Get outputs
INSTANCE_ID=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-graphql-ec2-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='InstanceId'].OutputValue" \
  --output text)

INSTANCE_IP=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-graphql-ec2-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='InstancePublicIp'].OutputValue" \
  --output text)

GRAPHQL_ENDPOINT=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-graphql-ec2-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='GraphQLEndpoint'].OutputValue" \
  --output text)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DEPLOYMENT OUTPUTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Instance ID: $INSTANCE_ID"
echo "Instance IP: $INSTANCE_IP"
echo "GraphQL Endpoint: $GRAPHQL_ENDPOINT"
echo ""
echo "SSH Command:"
echo "  ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$INSTANCE_IP"
echo ""
echo "📝 Next Steps:"
echo "  1. Wait 2-3 minutes for EC2 instance to fully initialize"
echo "  2. If you need to deploy GraphQL application code:"
echo "     cd ../../../server/deploy && ./deploy-to-ec2.sh $ENVIRONMENT"
echo ""
