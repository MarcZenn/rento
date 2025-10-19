# AWS Cognito User Pool Deployment Guide

## Overview

This document describes the infrastructure, manual deployment steps, configuration and app integration for the AWS Cognito setup for this project.

## Architecture

### Components

1. **User Pool**: Main authentication directory
   - Region: Tokyo (ap-northeast-1)
   - Username options: Email, Phone Number
   - Auto-verified attributes: Email

2. **Password Policies** (Japanese Banking Standards)
   - Minimum length: 12 characters
   - Requires: Uppercase, Lowercase, Numbers, Symbols
   - Temporary password validity: 7 days
   - Compromised credentials protection: ENABLED
   - Advanced security mode: ENFORCED

3. **Multi-Factor Authentication (MFA)**
   - Configuration: OPTIONAL
   - Methods: SOFTWARE_TOKEN_MFA, SMS_MFA
   - SMS via AWS SNS with dedicated IAM role

4. **Custom Attributes for APPI Compliance**
   - `custom:consent_version` - Version of privacy policy accepted
   - `custom:consent_timestamp` - When consent was given
   - `custom:data_residency_confirmed` - User confirmed data stays in Japan
   - `custom:privacy_policy_accepted` - Boolean flag for acceptance

5. **App Clients**
   - **Mobile App Client**: For React Native application
     - Auth flows: USER_SRP_AUTH, USER_PASSWORD_AUTH, REFRESH_TOKEN_AUTH
     - OAuth flows: code, implicit
     - Token validity: 60 min (access/ID), 30 days (refresh)

   - **Backend App Client**: For GraphQL server
     - Auth flows: ADMIN_USER_PASSWORD_AUTH, REFRESH_TOKEN_AUTH, USER_SRP_AUTH
     - Client secret: ENABLED
     - Token validity: 60 min (access/ID), 30 days (refresh)

6. **Lambda Triggers**
   - **Post Authentication**: Audit logging to CloudWatch
   - **Pre Token Generation**: Add APPI compliance claims to JWT

7. **User Pool Groups**
   - `administrators`: Full access (precedence: 1)
   - `users`: Standard access (precedence: 10)

## Deployment

### Prerequisites

- AWS CLI configured with Tokyo region (ap-northeast-1)
- IAM permissions for CloudFormation, Cognito, Lambda, IAM, CloudWatch
- Valid callback/logout URLs for your application

### Deploy Command

```bash
# Deploy to production
# npm run infrastructure:deploy:prod-profile

# Deploy to development
# npm run infrastructure:deploy:dev-profile
```

### Manual Deployment

```bash
cd infrastructure/aws

aws cloudformation deploy \
  --template-file cloudformation-cognito-userpool.yml \
  --stack-name rento-appi-cognito-production \
  --parameter-overrides \
    Environment=production \
    DomainPrefix=rento-auth-production \
    CallbackURLs=rentoapp://auth/callback,http://localhost:19006/auth/callback \
    LogoutURLs=rentoapp://auth/logout,http://localhost:19006/auth/logout \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-northeast-1
```

## Configuration

### Environment Variables

After deployment, the following variables are added to `.env.{ENVIRONMENT}`:

```bash
# AWS Cognito Configuration
COGNITO_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
EXPO_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_BACKEND_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_REGION=ap-northeast-1
COGNITO_DOMAIN=rento-auth-production.auth.ap-northeast-1.amazoncognito.com
```

### AWS Systems Manager Parameters

Secure parameters are stored in Parameter Store:

- `/${ENVIRONMENT}/rento/cognito/user-pool-id`
- `/${ENVIRONMENT}/rento/cognito/mobile-client-id`
- `/${ENVIRONMENT}/rento/cognito/backend-client-id`
- `/${ENVIRONMENT}/rento/cognito/domain`

## Integration

### Mobile App (React Native)

React Native Apollo Client configuration with AWS Amplify.

```typescript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      region: process.env.COGNITO_REGION,
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
    }
  }
});
```

### Backend (GraphQL Server)

AWS Cognito JWT verification implementation.

```typescript
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: 'access',
  clientId: process.env.COGNITO_BACKEND_CLIENT_ID,
  region: process.env.COGNITO_REGION
});
```

## JWT Token Structure

### Standard Claims
- `sub`: User ID
- `email`: User email address
- `email_verified`: Email verification status
- `phone_number`: User phone number
- `phone_number_verified`: Phone verification status
- `cognito:groups`: User groups (administrators, users)

### Custom APPI Compliance Claims
- `custom:environment`: Deployment environment
- `custom:data_region`: Always "ap-northeast-1" for data residency
- `custom:compliance_framework`: Always "APPI"
- `custom:consent_version`: Privacy policy version accepted
- `custom:privacy_accepted`: Boolean consent flag

## Security Features

### Advanced Security
- **Account Takeover Protection**: ENFORCED
- **Compromised Credentials Check**: ENABLED
- **Risk-Based Authentication**: Analyzes sign-in patterns
- **Impossible Travel Detection**: Geographic distance analysis

### Audit Logging
- All authentication events logged to CloudWatch
- Log retention: 730 days (2 years) for APPI compliance
- Log group: `/aws/cognito/{ENVIRONMENT}-rento-audit-logs`

### Data Residency
- User pool created exclusively in Tokyo region
- Email routing: Same region or custom SES configuration
- SMS routing: Tokyo region via SNS
- All user data stored in ap-northeast-1

## User Management

### Creating Users

#### Via AWS Console
1. Navigate to Cognito console in Tokyo region
2. Select user pool: `{ENVIRONMENT}-rento-appi-users`
3. Click "Create user"
4. Set email, temporary password
5. Assign to appropriate group

#### Via AWS CLI

```bash
aws cognito-idp admin-create-user \
  --user-pool-id ap-northeast-1_xxxxxxxxx \
  --username user@example.com \
  --user-attributes Name=email,Value=user@example.com \
  --temporary-password "TempPassword123!" \
  --region ap-northeast-1
```

### Setting Custom Attributes

```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id ap-northeast-1_xxxxxxxxx \
  --username user@example.com \
  --user-attributes \
    Name=custom:consent_version,Value=1.0 \
    Name=custom:consent_timestamp,Value=2025-09-30T00:00:00Z \
    Name=custom:data_residency_confirmed,Value=true \
    Name=custom:privacy_policy_accepted,Value=true \
  --region ap-northeast-1
```

### Adding Users to Groups

```bash
# Add to administrators group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-northeast-1_xxxxxxxxx \
  --username user@example.com \
  --group-name administrators \
  --region ap-northeast-1

# Add to standard users group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-northeast-1_xxxxxxxxx \
  --username user@example.com \
  --group-name users \
  --region ap-northeast-1
```

## Monitoring & Compliance

### CloudWatch Metrics
- Sign-in success/failure rates
- MFA usage statistics
- Risk score distributions
- Geographic sign-in patterns

### Audit Logs
```bash
# View recent audit logs
aws logs tail /aws/cognito/production-rento-audit-logs --follow
```

### Compliance Checks
- Password policies meet Japanese banking standards ✓
- Data residency enforced in Tokyo region ✓
- Audit logging with 2-year retention ✓
- JWT tokens include APPI compliance claims ✓
- MFA available for enhanced security ✓

## Troubleshooting

### Common Issues

#### 1. Token Validation Failures
- Verify `userPoolId` and `clientId` match
- Check token hasn't expired (60 min validity)
- Ensure correct region (ap-northeast-1)

#### 2. SMS MFA Not Working
- Verify SNS IAM role has correct permissions
- Check SNS service quotas for SMS
- Ensure phone numbers are in E.164 format

#### 3. Lambda Trigger Failures
- Check CloudWatch logs for Lambda functions
- Verify IAM execution role permissions
- Ensure Lambda functions have network access

#### 4. Custom Attributes Not Appearing
- Confirm attributes were created in user pool schema
- Verify app client has read/write permissions
- Check attribute names use `custom:` prefix

## Costs

Estimated monthly costs (1,000 MAU):

- User Pool: Free tier (50,000 MAU)
- Advanced Security: $0.05/MAU = $50/month
- Lambda invocations: ~$0.20/month (minimal)
- CloudWatch Logs: ~$5/month (2GB ingestion)
- **Total**: ~$55/month

## TODO:: Next Steps

After deploying Cognito:

3. **Task 10**: Create APPI Consent Modal Component (frontend)

## Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [APPI Compliance Guide](https://www.ppc.go.jp/en/legal/)
- [JWT Verify Library](https://github.com/awslabs/aws-jwt-verify)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
