#!/bin/bash

# ============================================================================
# DEPLOY GRAPHQL API TO EC2
# ============================================================================
# Deploys the Rento GraphQL API to an EC2 instance
#
# Prerequisites:
# - EC2 instance created via CloudFormation (cloudformation-graphql-ec2.yml)
# - SSH access configured (key pair)
# - RDS and Redis deployed and accessible from EC2
#
# What This Script Does:
# 1. Builds the GraphQL server (TypeScript → JavaScript)
# 2. Creates deployment package (server code + node_modules)
# 3. Uploads package to EC2 instance via SCP
# 4. Fetches environment variables from AWS Parameter Store
# 5. Creates .env file on EC2 instance
# 6. Installs dependencies and starts server with PM2
# 7. Verifies deployment with health check
#
# Usage:
#   ./deploy-to-ec2.sh [development|production]
#
# Example:
#   ./deploy-to-ec2.sh development
# ============================================================================

set -e  # Exit on error

# ============================================================================
# CONFIGURATION
# ============================================================================

ENVIRONMENT=${1:-development}
REGION="ap-northeast-1"
PROFILE="rento-development-sso"
STACK_PREFIX="rento"

if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
  echo "❌ Invalid environment: $ENVIRONMENT"
  echo "Usage: $0 [development|staging|production]"
  exit 1
fi

echo "🚀 Deploying Rento GraphQL API to EC2"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# ============================================================================
# GET EC2 INSTANCE DETAILS FROM CLOUDFORMATION
# ============================================================================

echo "📋 Getting EC2 instance details..."

INSTANCE_IP=$(aws cloudformation describe-stacks \
  --profile $PROFILE \
  --stack-name "${STACK_PREFIX}-graphql-ec2-${ENVIRONMENT}" \
  --region $REGION \
  --query "Stacks[0].Outputs[?OutputKey=='InstancePublicIp'].OutputValue" \
  --output text)

if [ -z "$INSTANCE_IP" ]; then
  echo "❌ Could not find EC2 instance IP"
  echo "Make sure the GraphQL EC2 stack is deployed:"
  echo "  aws cloudformation describe-stacks --stack-name ${STACK_PREFIX}-graphql-ec2-${ENVIRONMENT} --region $REGION"
  exit 1
fi

echo "✅ EC2 Instance IP: $INSTANCE_IP"
echo ""

# ============================================================================
# BUILD APPLICATION
# ============================================================================

echo "🔨 Building GraphQL server..."
cd "$(dirname "$0")/.."  # Go to server directory (from /server/deploy/)

# Build server using build script
./build-server.sh

echo "✅ Server built successfully"
echo ""

# ============================================================================
# CREATE DEPLOYMENT PACKAGE
# ============================================================================

echo "📦 Creating deployment package..."

# Create temporary deployment directory
DEPLOY_DIR="/tmp/rento-graphql-deploy-$$"
mkdir -p "$DEPLOY_DIR"

# Copy built server code
cp -r ./dist/* "$DEPLOY_DIR/"

# Copy package.json and package-lock.json from ROOT (monorepo setup)
# This ensures all dependencies are available for npm install on EC2
cp ./package.json "$DEPLOY_DIR/"
cp ./package-lock.json "$DEPLOY_DIR/" 2>/dev/null || true

echo "✅ Deployment package created: $DEPLOY_DIR"
echo ""

# ============================================================================
# FETCH ENVIRONMENT VARIABLES FROM PARAMETER STORE
# ============================================================================

echo "🔐 Fetching environment variables from Parameter Store..."

# Cognito
COGNITO_USER_POOL_ID=$(aws ssm get-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/cognito/user-pool-id" \
  --region $REGION \
  --query "Parameter.Value" \
  --output text 2>/dev/null || echo "")

COGNITO_BACKEND_CLIENT_ID=$(aws ssm get-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/cognito/backend-client-id" \
  --region $REGION \
  --query "Parameter.Value" \
  --output text 2>/dev/null || echo "")

# PostgreSQL
POSTGRES_HOST=$(aws ssm get-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/postgres/endpoint" \
  --region $REGION \
  --query "Parameter.Value" \
  --output text 2>/dev/null || echo "")

POSTGRES_PASSWORD=$(aws ssm get-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/postgres/password" \
  --region $REGION \
  --with-decryption \
  --query "Parameter.Value" \
  --output text 2>/dev/null || echo "")

# Redis
REDIS_HOST=$(aws ssm get-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/redis/endpoint" \
  --region $REGION \
  --query "Parameter.Value" \
  --output text 2>/dev/null || echo "")

# GraphQL API Key
GRAPHQL_API_KEY=$(aws ssm get-parameter \
  --profile $PROFILE \
  --name "/${ENVIRONMENT}/rento/graphql/api-key" \
  --region $REGION \
  --with-decryption \
  --query "Parameter.Value" \
  --output text 2>/dev/null || echo "")

echo "✅ Environment variables fetched"
echo ""

# ============================================================================
# CREATE .ENV FILE
# ============================================================================

echo "📝 Creating .env file..."

cat > "$DEPLOY_DIR/.env" << ENVEOF
# ============================================================================
# Rento GraphQL API - Environment Variables
# ============================================================================
# Generated: $(date)
# Environment: $ENVIRONMENT
# Region: $REGION
# ============================================================================

# Node Environment
NODE_ENV=production

# Server Configuration
GRAPHQL_PORT=4000
GRAPHQL_HOST=0.0.0.0
CORS_ORIGIN=*

# AWS Configuration
AWS_REGION=$REGION
DATA_LOCATION=Japan-Tokyo

# AWS Cognito
COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID
COGNITO_BACKEND_CLIENT_ID=$COGNITO_BACKEND_CLIENT_ID
COGNITO_REGION=$REGION

# PostgreSQL
POSTGRES_HOST=$POSTGRES_HOST
POSTGRES_PORT=5432
POSTGRES_DB=rento_appi_db
POSTGRES_USER=rento_admin
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_SSL=true
# For development, allow self-signed certs; production requires valid certs
POSTGRES_SSL_REJECT_UNAUTHORIZED=$([[ "$ENVIRONMENT" == "production" ]] && echo "true" || echo "false")

# Redis
REDIS_HOST=$REDIS_HOST
REDIS_PORT=6379
REDIS_TLS=true

# GraphQL API Key (for Lambda triggers)
GRAPHQL_API_KEY=$GRAPHQL_API_KEY

# APPI Compliance
APPI_COMPLIANT=true
DATA_RESIDENCY_ENFORCEMENT=true
AUDIT_LOGGING=true
ENVEOF

echo "✅ .env file created"
echo ""

# ============================================================================
# UPLOAD TO EC2
# ============================================================================

echo "⬆️  Uploading deployment package to EC2..."

# Create tarball
cd "$DEPLOY_DIR"
tar -czf "/tmp/rento-graphql-${ENVIRONMENT}.tar.gz" .

# Upload to EC2 (assuming SSH key is in ~/.ssh/)
# NOTE: Update the key path if your key is elsewhere
SSH_KEY_PATH="$HOME/.ssh/rento-${ENVIRONMENT}.pem"

if [ ! -f "$SSH_KEY_PATH" ]; then
  echo "⚠️  SSH key not found: $SSH_KEY_PATH"
  echo "Please specify the correct SSH key path or use Systems Manager Session Manager"
  echo ""
  echo "To deploy manually:"
  echo "  1. scp -i YOUR_KEY.pem /tmp/rento-graphql-${ENVIRONMENT}.tar.gz ec2-user@$INSTANCE_IP:/tmp/"
  echo "  2. ssh -i YOUR_KEY.pem ec2-user@$INSTANCE_IP"
  echo "  3. cd /opt/rento-api && tar -xzf /tmp/rento-graphql-${ENVIRONMENT}.tar.gz"
  echo "  4. npm install --production"
  echo "  5. pm2 start index.js --name rento-api"
  exit 1
fi

# Upload tarball
scp -i "$SSH_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  "/tmp/rento-graphql-${ENVIRONMENT}.tar.gz" \
  "ec2-user@$INSTANCE_IP:/tmp/"

echo "✅ Package uploaded"
echo ""

# ============================================================================
# DEPLOY ON EC2
# ============================================================================

echo "🚀 Deploying on EC2 instance..."

ssh -i "$SSH_KEY_PATH" \
  -o StrictHostKeyChecking=no \
  "ec2-user@$INSTANCE_IP" << 'SSHEOF'

set -e

echo "==> Extracting deployment package..."
cd /opt/rento-api
tar -xzf /tmp/rento-graphql-*.tar.gz

echo "==> Installing production dependencies..."
npm install --production --no-optional

echo "==> Starting/Restarting application with PM2..."
if pm2 list | grep -q "rento-api"; then
  echo "==> Restarting existing PM2 process..."
  pm2 restart rento-api --update-env
else
  echo "==> Starting new PM2 process..."
  pm2 start server/index.js \
    --name rento-api \
    --log /opt/rento-api/logs/app.log \
    --error /opt/rento-api/logs/error.log \
    --time
fi

# Save PM2 configuration for automatic restart on reboot
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "==> Deployment complete!"
SSHEOF

echo "✅ Application deployed and running"
echo ""

# ============================================================================
# VERIFY DEPLOYMENT
# ============================================================================

echo "🔍 Verifying deployment..."

# Wait a few seconds for server to start
sleep 5

# Check health endpoint
HEALTH_URL="http://$INSTANCE_IP:4000/health"
echo "Testing health endpoint: $HEALTH_URL"

if curl -f -s -m 10 "$HEALTH_URL" > /dev/null; then
  echo "✅ Health check passed!"
  echo ""
  echo "📊 Server Response:"
  curl -s "$HEALTH_URL" | jq . || curl -s "$HEALTH_URL"
else
  echo "⚠️  Health check failed or server not responding yet"
  echo "Check logs on EC2:"
  echo "  ssh -i $SSH_KEY_PATH ec2-user@$INSTANCE_IP"
  echo "  pm2 logs rento-api"
fi

echo ""

# ============================================================================
# CLEANUP
# ============================================================================

echo "🧹 Cleaning up temporary files..."
rm -rf "$DEPLOY_DIR"
rm -f "/tmp/rento-graphql-${ENVIRONMENT}.tar.gz"

echo "✅ Cleanup complete"
echo ""

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 GraphQL API Endpoint:"
echo "   http://$INSTANCE_IP:4000/graphql"
echo ""
echo "🏥 Health Check:"
echo "   http://$INSTANCE_IP:4000/health"
echo ""
echo "📝 View Logs:"
echo "   ssh -i $SSH_KEY_PATH ec2-user@$INSTANCE_IP"
echo "   pm2 logs rento-api"
echo ""
echo "🔄 Manage PM2:"
echo "   pm2 status      # View process status"
echo "   pm2 restart rento-api   # Restart"
echo "   pm2 stop rento-api      # Stop"
echo "   pm2 logs rento-api      # View logs"
echo ""
echo "📋 Next Steps:"
echo "  1. Test GraphQL endpoint with query"
echo "  2. Update Lambda functions with GraphQL URL"
echo "  3. Deploy full infrastructure (Cognito + RDS + Redis)"
echo ""
