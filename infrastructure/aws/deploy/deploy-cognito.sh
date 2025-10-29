#!/bin/bash

# ============================================================================
# DEPLOY AWS COGNITO USER POOL + LAMBDA TRIGGERS
# ============================================================================

set -e

ENVIRONMENT=${1:-development}
REGION="ap-northeast-1"
PROFILE="rento-development-sso"
GRAPHQL_API_URL=${2:-}

echo "🔐 Deploying AWS Cognito User Pool..."
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Check if GraphQL API URL is provided
if [ -z "$GRAPHQL_API_URL" ]; then
  echo "⚠️  GraphQL API URL not provided"
  echo ""
  echo "Attempting to get from EC2 stack..."
  GRAPHQL_API_URL=$(aws cloudformation describe-stacks \
    --profile $PROFILE \
    --stack-name rento-graphql-ec2-${ENVIRONMENT} \
    --region $REGION \
    --query "Stacks[0].Outputs[?OutputKey=='GraphQLEndpoint'].OutputValue" \
    --output text 2>/dev/null || echo "")

  if [ -z "$GRAPHQL_API_URL" ]; then
    echo "❌ Error: Could not determine GraphQL API URL"
    echo ""
    echo "Please provide it as an argument:"
    echo "  ./deploy-cognito.sh $ENVIRONMENT http://YOUR_IP:4000/graphql"
    echo ""
    echo "Or deploy EC2 infrastructure first:"
    echo "  ./deploy-ec2-infrastructure.sh $ENVIRONMENT"
    exit 1
  fi
fi

echo "✅ GraphQL API URL: $GRAPHQL_API_URL"
echo ""

# Generate GraphQL API key
GRAPHQL_API_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "🔑 Generated GraphQL API key"
echo ""

# Build Lambda functions
echo "🔨 Building Lambda functions..."

# PreSignUp Lambda
echo "  Building PreSignUp Lambda..."
cd ../lambda/pre-signup
npm install --production --silent
npm run build --silent
npm run package --silent

# PostConfirmation Lambda
echo "  Building PostConfirmation Lambda..."
cd ../post-confirmation
npm install --production --silent
npm run build --silent
npm run package --silent

cd ../../deploy

echo "✅ Lambda functions built"
echo ""

# Deploy CloudFormation stack
echo "🚀 Deploying Cognito stack..."
aws cloudformation deploy \
  --profile $PROFILE \
  --template-file ../cloudformation-cognito-userpool.yml \
  --stack-name rento-cognito-${ENVIRONMENT} \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    DomainPrefix="rento-auth-${ENVIRONMENT}" \
    GraphQLApiUrl=$GRAPHQL_API_URL \
    GraphQLApiKey=$GRAPHQL_API_KEY \
  --capabilities CAPABILITY_NAMED_IAM \
  --region $REGION \
  --tags Environment=$ENVIRONMENT APPICompliant=true DataLocation=Japan-Tokyo

echo ""
echo "⏳ Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete \
  --profile $PROFILE \
  --stack-name rento-cognito-${ENVIRONMENT} \
  --region $REGION 2>/dev/null || \
aws cloudformation wait stack-update-complete \
  --profile $PROFILE \
  --stack-name rento-cognito-${ENVIRONMENT} \
  --region $REGION

echo ""
echo "✅ Cognito stack deployed"
echo ""

# Get Lambda function names
PRE_SIGNUP_FUNCTION=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-cognito-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='PreSignUpFunctionName'].OutputValue" \
  --output text)

POST_CONFIRMATION_FUNCTION=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-cognito-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='PostConfirmationFunctionName'].OutputValue" \
  --output text)

# Upload Lambda code
echo "⬆️  Uploading Lambda function code..."

echo "  Uploading PreSignUp Lambda..."
aws lambda update-function-code \
  --profile $PROFILE \
  --function-name $PRE_SIGNUP_FUNCTION \
  --zip-file fileb://../lambda/pre-signup.zip \
  --region $REGION \
  --no-cli-pager > /dev/null

echo "  Uploading PostConfirmation Lambda..."
aws lambda update-function-code \
  --profile $PROFILE \
  --function-name $POST_CONFIRMATION_FUNCTION \
  --zip-file fileb://../lambda/post-confirmation.zip \
  --region $REGION \
  --no-cli-pager > /dev/null

echo "✅ Lambda functions uploaded"
echo ""

# Get Cognito outputs
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-cognito-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
  --output text)

MOBILE_CLIENT_ID=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-cognito-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='MobileAppClientId'].OutputValue" \
  --output text)

BACKEND_CLIENT_ID=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-cognito-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='BackendAppClientId'].OutputValue" \
  --output text)

USER_POOL_DOMAIN=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name rento-cognito-${ENVIRONMENT} \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolDomain'].OutputValue" \
  --output text)

# Store in Parameter Store
echo "🔐 Storing Cognito details in Parameter Store..."
aws ssm put-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/cognito/user-pool-id" \
  --value "$USER_POOL_ID" \
  --type "String" \
  --region $REGION \
  --overwrite > /dev/null

aws ssm put-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/cognito/mobile-client-id" \
  --value "$MOBILE_CLIENT_ID" \
  --type "String" \
  --region $REGION \
  --overwrite > /dev/null

aws ssm put-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/cognito/backend-client-id" \
  --value "$BACKEND_CLIENT_ID" \
  --type "String" \
  --region $REGION \
  --overwrite > /dev/null

aws ssm put-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/cognito/domain" \
  --value "$USER_POOL_DOMAIN" \
  --type "String" \
  --region $REGION \
  --overwrite > /dev/null

aws ssm put-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/graphql/api-key" \
  --value "$GRAPHQL_API_KEY" \
  --type "SecureString" \
  --region $REGION \
  --overwrite > /dev/null

echo "✅ Parameters stored"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DEPLOYMENT OUTPUTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "User Pool ID: $USER_POOL_ID"
echo "Mobile Client ID: $MOBILE_CLIENT_ID"
echo "Backend Client ID: $BACKEND_CLIENT_ID"
echo "Domain: $USER_POOL_DOMAIN"
echo ""
echo "GraphQL API URL: $GRAPHQL_API_URL"
echo "GraphQL API Key: $GRAPHQL_API_KEY"
echo ""
echo "✅ All values stored in Parameter Store"
echo ""
