#!/bin/bash
# ============================================================================
# Deploy Public Networking to Existing VPC
# ============================================================================
# Adds Internet Gateway and public subnets to the VPC created by RDS stack
# ============================================================================

set -e

ENVIRONMENT="${1:-development}"
PROFILE="rento-${ENVIRONMENT}-sso"
REGION="ap-northeast-1"
STACK_NAME="rento-vpc-public-networking-${ENVIRONMENT}"
TEMPLATE_FILE="../cloudformation-vpc-public-networking.yml"

echo "========================================="
echo "Deploy VPC Public Networking"
echo "========================================="
echo "Environment: $ENVIRONMENT"
echo "Stack: $STACK_NAME"
echo "Region: $REGION"
echo ""

# Get VPC ID from RDS stack
echo "Getting VPC ID from RDS stack..."
VPC_ID=$(aws cloudformation describe-stacks \
  --profile "$PROFILE" \
  --stack-name "rento-postgres-${ENVIRONMENT}" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='VPCId'].OutputValue" \
  --output text)

echo "  VPC ID: $VPC_ID"
echo ""

# Deploy CloudFormation stack
echo "Deploying CloudFormation stack..."
echo ""

aws cloudformation deploy \
  --profile "$PROFILE" \
  --template-file "$TEMPLATE_FILE" \
  --stack-name "$STACK_NAME" \
  --parameter-overrides \
    Environment="$ENVIRONMENT" \
    VPCId="$VPC_ID" \
    EnableNATGateway=false \
  --region "$REGION" \
  --tags \
    Environment="$ENVIRONMENT" \
    APPICompliant=true \
    DataLocation=Japan-Tokyo

echo ""
echo "Getting deployment outputs..."
echo ""

# Get outputs
IGW_ID=$(aws cloudformation describe-stacks \
  --profile "$PROFILE" \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='InternetGatewayId'].OutputValue" \
  --output text)

PUBLIC_SUBNETS=$(aws cloudformation describe-stacks \
  --profile "$PROFILE" \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='PublicSubnetIds'].OutputValue" \
  --output text)

echo "========================================="
echo "✅ Public Networking Deployed"
echo "========================================="
echo ""
echo "Internet Gateway: $IGW_ID"
echo "Public Subnets: $PUBLIC_SUBNETS"
echo ""
