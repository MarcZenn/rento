# Cognito PreSignUp Lambda Trigger

This Lambda function is automatically triggered by AWS Cognito when a user signs up (BEFORE email verification). It creates the user in PostgreSQL immediately, allowing unverified users to access the app with limited features.

## Purpose

Enables early app access while maintaining verification tracking:
- **AWS Cognito** (authentication provider)
- **PostgreSQL** (application database with email_verified status)

## How It Works

1. User signs up in the React Native app via AWS Cognito
2. **Cognito automatically invokes this Lambda** (PreSignUp trigger)
3. Lambda calls GraphQL API to create user in PostgreSQL with `email_verified = false`
4. User can now access the app (with limited features)
5. User confirms their email later
6. PostConfirmation trigger updates `email_verified = true`

## Architecture Flow

```
User Sign-Up
    ↓
[PreSignUp Trigger]
    ↓
This Lambda Function
    ↓
GraphQL API (createUser mutation)
    ↓
PostgreSQL Database (users table with email_verified = false)
    ↓
User Can Access App (limited features)
    ↓
User Confirms Email
    ↓
[PostConfirmation Trigger]
    ↓
Update email_verified = true
```

## Environment Variables

The Lambda function requires these environment variables (set via CloudFormation):

| Variable | Description | Example |
|----------|-------------|---------|
| `GRAPHQL_API_URL` | GraphQL API endpoint | `https://api.rento.app/graphql` |
| `GRAPHQL_API_KEY` | API key for authentication | `your-api-key-here` |
| `ENVIRONMENT` | Deployment environment | `production` or `development` |

## Local Development

### Build the Lambda

```bash
cd infrastructure/aws/lambda/pre-signup
npm install
npm run build
```

### Package for Deployment

```bash
npm run package
# Creates: ../pre-signup.zip
```

### Test Locally (requires AWS SAM CLI)

```bash
sam local invoke PreSignUpFunction --event test-event.json
```

## Deployment

The Lambda is deployed automatically via the CloudFormation template:

```bash
cd infrastructure/aws/deploy
./deploy.sh production
```

This will:
1. Build the Lambda function
2. Package it into a .zip file
3. Upload to S3 (managed by CloudFormation)
4. Create/update the Lambda function
5. Attach it to the Cognito User Pool PreSignUp trigger

## Error Handling

### User Already Exists

If a user already exists in PostgreSQL (e.g., from a previous attempt), the Lambda will:
- Log a warning
- **Allow sign-up to continue** (return successfully to Cognito)
- This prevents blocking users who are already in the database

### Other Errors

For any other error (network failure, database down, etc.):
- Lambda **throws an error**
- Cognito **prevents user signup**
- User must retry sign-up
- This maintains consistency (both systems succeed or both fail)

## Feature Gating

Users with `email_verified = false` should have limited access:

### Allowed Features (Unverified Users)
- Browse property listings
- View property details
- Access basic profile
- Browse neighborhoods/wards

### Restricted Features (Require Verification)
- Save favorites
- Contact agents
- Submit applications
- Post listings (for landlords)
- Messaging

**Feature gating is enforced in GraphQL resolvers based on `email_verified` field.**

## Monitoring

### CloudWatch Logs

Logs are sent to CloudWatch Logs:
```
/aws/lambda/production-rento-cognito-pre-signup
```

View logs:
```bash
aws logs tail /aws/lambda/production-rento-cognito-pre-signup --follow
```

### CloudWatch Metrics

Monitor these metrics:
- **Invocations**: How many users are signing up
- **Errors**: Failed database syncs
- **Duration**: How long syncs take
- **Throttles**: If Lambda is being rate-limited

### Alarms

Set up CloudWatch Alarms for:
- Error rate > 5%
- Duration > 5 seconds
- Throttles > 0

## Troubleshooting

### "User not created in database"

Check:
1. GraphQL API is accessible from Lambda (VPC configuration if needed)
2. API key is valid
3. GraphQL endpoint URL is correct
4. Check CloudWatch logs for detailed error

### "Cognito user created but not in database"

This indicates the Lambda failed during signup. To fix:
1. Check CloudWatch logs for the error
2. Manually create the user in PostgreSQL using the GraphQL mutation
3. Fix the underlying issue (API key, network, etc.)

### "Lambda timeout"

Increase timeout in CloudFormation template:
```yaml
Timeout: 30  # Increase from default
```

## Security

### IAM Permissions

The Lambda has minimal permissions:
- Write to CloudWatch Logs
- No database access (uses GraphQL API instead)
- No Cognito management permissions

### API Authentication

The Lambda authenticates to the GraphQL API using:
- **API Key** (stored in environment variables)
- Alternative: Use IAM authentication for better security

### Network Security

- Lambda runs in AWS managed VPC (no custom VPC needed unless GraphQL API is private)
- All traffic uses HTTPS
- No inbound connections required

## Cost Estimation

For 1,000 new users per month:
- Lambda invocations: 1,000
- Average duration: 500ms
- Memory: 256MB

**Monthly cost**: ~$0.20 (well within AWS free tier)

## Related Files

- CloudFormation: `infrastructure/aws/cloudformation-cognito-lambda.yml`
- Deployment script: `infrastructure/aws/deploy/deploy.sh`
- GraphQL resolver: `server/graphql/resolvers/userResolvers.ts`
- PostConfirmation Lambda: `infrastructure/aws/lambda/post-confirmation/` (updates email_verified)
