#!/bin/bash
# ============================================================================
# CREATE AND VERIFY SSH KEY PAIR
# ============================================================================
# This script creates an AWS EC2 key pair and verifies the local file matches
# ============================================================================

set -e

ENVIRONMENT=${1:-development}
PROFILE="rento-${ENVIRONMENT}-sso"
REGION="ap-northeast-1"
KEY_NAME="rento-${ENVIRONMENT}"
KEY_PATH="$HOME/.ssh/${KEY_NAME}.pem"

echo "========================================="
echo "SSH Key Pair Creation & Verification"
echo "========================================="
echo "Environment: $ENVIRONMENT"
echo "Key Name: $KEY_NAME"
echo "Key Path: $KEY_PATH"
echo ""

# Step 1: Delete existing AWS key pair if it exists
echo "Step 1: Cleaning up existing AWS key pair..."
aws ec2 delete-key-pair \
  --profile "$PROFILE" \
  --region "$REGION" \
  --key-name "$KEY_NAME" 2>/dev/null || echo "  (No existing AWS key pair found)"

echo "✅ AWS key pair cleaned up"
echo ""

# Step 2: Remove local key file if it exists
echo "Step 2: Removing local key file..."
if [ -f "$KEY_PATH" ]; then
  rm "$KEY_PATH"
  echo "✅ Local key file removed"
else
  echo "  (No existing local key file found)"
fi
echo ""

# Step 3: Create new key pair and save it
echo "Step 3: Creating new AWS key pair..."

# Create a temporary file to capture the output
TEMP_FILE=$(mktemp)

# Create the key pair and save output to temp file using JSON + jq
aws ec2 create-key-pair \
  --profile "$PROFILE" \
  --region "$REGION" \
  --key-name "$KEY_NAME" \
  --output json | jq -r '.KeyMaterial' > "$TEMP_FILE"

# Check if we got valid key material
if ! grep -q "BEGIN RSA PRIVATE KEY" "$TEMP_FILE"; then
  echo "❌ ERROR: Key material doesn't contain valid RSA private key"
  echo "Temp file contents:"
  cat "$TEMP_FILE"
  rm "$TEMP_FILE"
  exit 1
fi

# Move temp file to final location
mv "$TEMP_FILE" "$KEY_PATH"

# Set correct permissions
chmod 400 "$KEY_PATH"

echo "✅ AWS key pair created and saved to $KEY_PATH"
echo ""

# Step 4: Wait a moment for AWS to propagate
echo "Step 4: Waiting for AWS propagation..."
sleep 2
echo "✅ Done waiting"
echo ""

# Step 5: Get AWS fingerprint
echo "Step 5: Getting AWS key fingerprint..."
AWS_FP=$(aws ec2 describe-key-pairs \
  --profile "$PROFILE" \
  --region "$REGION" \
  --key-names "$KEY_NAME" \
  --query 'KeyPairs[0].KeyFingerprint' \
  --output text)

echo "AWS Fingerprint: $AWS_FP"
echo ""

# Step 6: Get local key fingerprint (AWS uses SHA1 of PKCS8-encoded private key)
echo "Step 6: Getting local key fingerprint (AWS method)..."

# Check file exists and is readable
if [ ! -f "$KEY_PATH" ]; then
  echo "❌ ERROR: Key file doesn't exist at $KEY_PATH"
  exit 1
fi

if [ ! -r "$KEY_PATH" ]; then
  echo "❌ ERROR: Key file is not readable"
  exit 1
fi

# Calculate SHA1 of PKCS8-encoded private key (AWS method for generated keys)
LOCAL_FP=$(openssl pkcs8 -in "$KEY_PATH" -nocrypt -topk8 -outform DER | openssl sha1 -c | awk '{print $2}')

echo "Local Fingerprint (SHA1): $LOCAL_FP"
echo ""

# Step 7: Compare fingerprints
echo "Step 7: Comparing fingerprints..."
echo "========================================="

if [ "$LOCAL_FP" = "$AWS_FP" ]; then
  echo "✅ SUCCESS: Fingerprints match!"
  echo ""
  echo "Key pair is ready to use."
  echo "You can now deploy EC2 infrastructure with:"
  echo "  cd infrastructure/aws/deploy"
  echo "  ./deploy-ec2-infrastructure.sh $ENVIRONMENT"
  echo ""
  exit 0
else
  echo "❌ FAILURE: Fingerprints don't match!"
  echo ""
  echo "AWS:   $AWS_FP"
  echo "Local: $LOCAL_FP"
  echo ""
  echo "Diagnostic information:"
  echo "========================================="

  echo ""
  echo "1. Key file info:"
  ls -la "$KEY_PATH"

  echo ""
  echo "2. Key file head (first 3 lines):"
  head -3 "$KEY_PATH"

  echo ""
  echo "3. Key file tail (last 3 lines):"
  tail -3 "$KEY_PATH"

  echo ""
  echo "4. Full local key fingerprint output:"
  ssh-keygen -lf "$KEY_PATH" -E md5

  echo ""
  echo "5. SHA256 fingerprint:"
  ssh-keygen -lf "$KEY_PATH"

  echo ""
  echo "========================================="
  echo "This is unexpected. The key material from AWS"
  echo "should produce the same fingerprint."
  echo ""
  echo "Possible causes:"
  echo "  1. AWS CLI output format issue"
  echo "  2. File corruption during write"
  echo "  3. Encoding issue"
  echo ""

  exit 1
fi
