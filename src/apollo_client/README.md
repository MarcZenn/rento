# AWS Amplify + Apollo Client Configuration

This directory contains the configuration for AWS Amplify authentication and Apollo Client GraphQL integration.

## Overview

The configuration provides:
- ✅ AWS Cognito authentication (Tokyo region: `ap-northeast-1`)
- ✅ Apollo Client with automatic JWT token injection
- ✅ Automatic token refresh handling
- ✅ Error handling for authentication failures
- ✅ TypeScript support

## Setup

### 1. Environment Variables

The following need to be in respective `.env` file:

```bash
# AWS Cognito Configuration
EXPO_PUBLIC_COGNITO_USER_POOL_ID=ap-northeast-1_XXXXXXXXX
EXPO_PUBLIC_COGNITO_CLIENT_ID=your_client_id_here
EXPO_PUBLIC_AWS_REGION=ap-northeast-1

# GraphQL Endpoint
EXPO_PUBLIC_GRAPHQL_ENDPOINT=https://your-api-endpoint.com/graphql
```
Mappings:

| Purpose | Frontend Env Var | Backend Env Var |
|---------|------------------|-----------------|
| User Pool ID | `EXPO_PUBLIC_COGNITO_USER_POOL_ID` | `COGNITO_USER_POOL_ID` |
| Client ID | `EXPO_PUBLIC_COGNITO_CLIENT_ID` | `COGNITO_BACKEND_CLIENT_ID` |
| Region | `EXPO_PUBLIC_AWS_REGION` | `COGNITO_REGION` or `AWS_REGION` |
| GraphQL URL | `EXPO_PUBLIC_GRAPHQL_ENDPOINT` | N/A (backend is the endpoint) |

**Key Differences:**
- Frontend uses `EXPO_PUBLIC_*` prefix (accessible in React Native)
- Backend uses plain env vars (server-side only)
- **Client IDs might be different!** (Mobile app client vs Backend client)

⚠️ **IMPORTANT:** User pool id and client id must match the same Cognito User Pool on frontend and backend.

### 🔧 Configuration Requirements

#### Cognito User Pool Setup

Your Cognito User Pool needs **TWO App Clients:**

##### 1. **Mobile App Client** (Frontend)
```
Client ID: Used by React Native app
- Enable: User Password Auth flow
- Token validity:
  - Access Token: 60 minutes
  - ID Token: 60 minutes
  - Refresh Token: 30 days
- Advanced security: Optional (MFA, etc.)
```

Set as: `EXPO_PUBLIC_COGNITO_CLIENT_ID`

##### 2. **Backend Client** (Backend API)
```
Client ID: Used by GraphQL API
- Same User Pool as mobile client
- Used for token verification only
- No auth flows needed (just verification)
```

Set as: `COGNITO_BACKEND_CLIENT_ID`

⚠️ **Alternative:** You can use the same client ID for both if you configure it to support both user auth and backend verification.

## Usage

### Authentication with AWS Amplify

```tsx
import { signIn, signOut, signUp, fetchAuthSession } from 'aws-amplify/auth';

// Sign Up
await signUp({
  username: 'user@example.com',
  password: 'SecurePassword123!',
  options: {
    userAttributes: {
      email: 'user@example.com',
    },
  },
});

// Sign In
await signIn({
  username: 'user@example.com',
  password: 'SecurePassword123!',
});

// Sign Out
await signOut();

// Get Current Session
const session = await fetchAuthSession();
const token = session.tokens?.accessToken?.toString();
```

### GraphQL Queries with Apollo Client

```tsx
import { useQuery, useMutation, gql } from '@apollo/client';

// Define your query
const GET_USER_PROFILE = gql`
  query GetUserProfile {
    userProfile {
      id
      firstName
      lastName
      email
    }
  }
`;

// Use in component
function ProfileScreen() {
  const { data, loading, error } = useQuery(GET_USER_PROFILE);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>{data.userProfile.firstName}</Text>
      <Text>{data.userProfile.email}</Text>
    </View>
  );
}
```

### Mutations

```tsx
const UPDATE_CONSENT = gql`
  mutation UpdateConsent($input: UpdateConsentInput!) {
    updateConsent(input: $input) {
      success
      message
    }
  }
`;

function ConsentSettings() {
  const [updateConsent, { loading, error }] = useMutation(UPDATE_CONSENT);

  const handleUpdate = async () => {
    try {
      const result = await updateConsent({
        variables: {
          input: {
            dataProcessing: true,
            marketingCommunication: false,
          },
        },
      });
      console.log('Consent updated:', result.data);
    } catch (err) {
      console.error('Error updating consent:', err);
    }
  };

  return (
    <Button onPress={handleUpdate} disabled={loading}>
      Update Consent
    </Button>
  );
}
```

## Authentication Flow

### 1. User Signs In
```
User → AWS Cognito → JWT Tokens (Access, ID, Refresh)
```

### 2. GraphQL Request
```
Apollo Client → Auth Link → Fetch Session → Add JWT Header → API Server
```

### 3. Token Refresh (Automatic)
```
Token Expired → Error Link → Refresh Token → Retry Request
```

### 4. Authentication Failure
```
Refresh Failed → Sign Out User → Redirect to Login
```

## Features

### Automatic Token Management
- Tokens are fetched automatically on every request
- Amplify handles token refresh when expired
- No manual token management required

### Error Handling
- Detects authentication errors (UNAUTHENTICATED, FORBIDDEN)
- Detects token expiration
- Automatically retries requests after token refresh
- Signs out user if refresh fails

### Type Safety
- Full TypeScript support
- Type definitions for GraphQL operations
- Strongly typed query and mutation results

## How the Apollo client works internally:

### What Happens Internally:

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Component mounts → useQuery executes                          │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. Apollo Client checks cache (cache-and-network policy)         │
│    - Returns cached data if available (loading still true)       │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. Apollo Client initiates network request                       │
│    - Builds operation object                                     │
│    - Passes through link chain                                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. errorLink receives operation                                  │
│    - No error yet, passes through                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. httpLink receives operation                                   │
│    - Converts to HTTP request                                    │
│    - CALLS: customFetch(url, requestOptions)                     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. customFetch EXECUTES                                          │
│    - await fetchAuthSession()                                    │
│    - Extract token: 'eyJhbGciOiJSUzI1NiIs...'                   │
│    - Add to headers: { authorization: 'Bearer eyJ...' }          │
│    - Call native fetch with updated headers                      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. Browser sends HTTP request                                    │
│    POST https://api.rento.app/graphql                            │
│    Headers: {                                                    │
│      'Content-Type': 'application/json',                         │
│      'authorization': 'Bearer eyJhbGciOiJSUzI1NiIs...'          │
│    }                                                             │
│    Body: { query: '...', variables: {} }                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 8. Backend receives request                                      │
│    - Express middleware                                          │
│    - Apollo Server                                               │
│    - createAuthContext() extracts token                          │
│    - Verifies with Cognito                                       │
│    - Executes resolver                                           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 9. Backend returns response                                      │
│    { data: { userProfile: { id: '...', name: 'John' } } }      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 10. customFetch returns response                                 │
│     - Native fetch() promise resolves                            │
│     - Returns Response object to httpLink                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 11. httpLink parses response                                     │
│     - Converts to JSON                                           │
│     - Returns result up the chain                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 12. errorLink receives response (inbound)                        │
│     - No errors, passes through                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 13. Apollo Client updates                                        │
│     - Updates cache                                              │
│     - Notifies useQuery hook                                     │
│     - Component re-renders with data                             │
└──────────────────────────────────────────────────────────────────┘
```

## 🔐 Security Flow

### Token Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                     TOKEN LIFECYCLE                           │
└──────────────────────────────────────────────────────────────┘

1. TOKEN CREATION (Sign In)
   └─ Cognito issues: Access Token (1h), ID Token (1h), Refresh Token (30d)

2. TOKEN STORAGE (Frontend)
   └─ Amplify stores in Expo SecureStore (encrypted)

3. TOKEN USAGE (Every Request)
   ├─ Frontend: Apollo authLink fetches from Amplify
   └─ Backend: auth.ts verifies with Cognito public keys

4. TOKEN REFRESH (Automatic)
   ├─ Amplify detects expiration
   ├─ Uses refresh token to get new tokens
   └─ Transparent to the user

5. TOKEN EXPIRATION (Final)
   ├─ Refresh token expires (30 days default)
   ├─ Frontend error link catches failure
   └─ User must sign in again
```
# Security Notes

- Never commit `.env` files to version control
- Store sensitive credentials in secure storage
- Use HTTPS for all API endpoints
- Implement proper CORS policies on the server
- Follow AWS Cognito security best practices

## Troubleshooting

### "Missing COGNITO_USER_POOL_ID" Error
- Ensure `.env` file contains `EXPO_PUBLIC_COGNITO_USER_POOL_ID`
- Restart the development server after updating `.env`

### "UNAUTHENTICATED" Error
- User may not be signed in
- Token may have expired
- Check that user has valid session

### Network Errors
- Verify `EXPO_PUBLIC_GRAPHQL_ENDPOINT` is correct
- Check network connectivity
- Ensure API server is running

## 🚨 Common Integration Issues

### Issue 1: "Invalid token signature"
**Cause:** Client ID mismatch between frontend and backend
**Fix:** Ensure both use clients from the same Cognito User Pool

### Issue 2: "Token expired" on every request
**Cause:** Amplify not refreshing tokens automatically
**Fix:** Ensure `fetchAuthSession()` is called (not caching old tokens)

### Issue 3: "CORS errors"
**Cause:** Backend not allowing requests from mobile app
**Fix:** Configure CORS in backend to allow your app's origin

### Issue 4: Infinite refresh loop
**Cause:** Error link keeps retrying even after refresh fails
**Fix:** Error link now signs out user after refresh failure (already implemented)

## APPI Compliance

This configuration is designed for APPI compliance:
- ✅ Data residency in Tokyo region (`ap-northeast-1`)
- ✅ Secure authentication with AWS Cognito
- ✅ JWT tokens for API authorization
- ✅ Audit logging in auth middleware
- ✅ Automatic token refresh for session management

## Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [AWS Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)
- [React Native + Amplify Guide](https://docs.amplify.aws/react-native/)
