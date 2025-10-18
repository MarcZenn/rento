/**
 * AWS Cognito PreSignUp Lambda Trigger
 *
 * This Lambda function is automatically invoked by AWS Cognito when a user
 * signs up (BEFORE email verification). It creates the user in PostgreSQL
 * immediately, allowing app access even for unverified users.
 *
 * Trigger: PreSignUp
 * Purpose: Create user record in PostgreSQL when Cognito user signs up
 *
 * Environment Variables Required:
 * - GRAPHQL_API_URL: The GraphQL API endpoint
 * - GRAPHQL_API_KEY: API key for authentication (or use IAM)
 * - ENVIRONMENT: deployment environment (production, development, etc.)
 */

import { PreSignUpTriggerHandler, PreSignUpTriggerEvent } from 'aws-lambda';

interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
  };
}

interface CreateUserData {
  createUser: {
    id: string;
    cognitoId: string;
    email: string;
    username: string;
    emailVerified: boolean;
    createdAt: string;
  };
}

interface GraphQLResponse {
  data?: CreateUserData;
  errors?: GraphQLError[];
}

// GraphQL mutation to create user in PostgreSQL
const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      cognitoId
      email
      username
      emailVerified
      createdAt
    }
  }
`;

/**
 * Main Lambda handler for PreSignUp trigger
 */
export const handler: PreSignUpTriggerHandler = async (event: PreSignUpTriggerEvent) => {
  console.log('PreSignUp trigger received:', {
    userPoolId: event.userPoolId,
    userName: event.userName,
    triggerSource: event.triggerSource,
  });

  const { sub, email, preferred_username } = event.request.userAttributes;

  // Validate required attributes
  if (!sub || !email) {
    console.error('Missing required user attributes:', { sub, email });
    throw new Error('Missing required user attributes (sub or email)');
  }

  const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL;
  const GRAPHQL_API_KEY = process.env.GRAPHQL_API_KEY;

  if (!GRAPHQL_API_URL || !GRAPHQL_API_KEY) {
    console.error('Missing required environment variables');
    throw new Error('GRAPHQL_API_URL or GRAPHQL_API_KEY not configured');
  }

  try {
    console.log(`Creating user in PostgreSQL database (unverified)`, {
      cognitoId: sub,
      email,
      username: preferred_username || email.split('@')[0],
      emailVerified: false,
    });

    // Call GraphQL API to create user in PostgreSQL
    // User starts with email_verified = false
    const response = await fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GRAPHQL_API_KEY,
        'User-Agent': 'AWS-Lambda-PreSignUp',
      },
      body: JSON.stringify({
        query: CREATE_USER_MUTATION,
        variables: {
          input: {
            cognitoId: sub,
            email,
            username: preferred_username || email.split('@')[0],
            emailVerified: false, // Explicitly set to false on signup
          },
        },
      }),
    });

    // Check if HTTP request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GraphQL API HTTP error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`GraphQL API returned ${response.status}: ${errorText}`);
    }

    const result = (await response.json()) as GraphQLResponse;

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('GraphQL mutation errors:', result.errors);

      // Check if user already exists (not a fatal error for idempotency)
      const userExistsError = result.errors.find(
        err =>
          err.message?.includes('User already exists') || err.extensions?.code === 'BAD_USER_INPUT'
      );

      if (userExistsError) {
        console.warn('User already exists in database, continuing...', { cognitoId: sub });
        // Auto-confirm the user in Cognito (allow signup to proceed)
        event.response.autoConfirmUser = false;
        event.response.autoVerifyEmail = false;
        return event;
      }

      // Other errors are fatal
      throw new Error(`GraphQL mutation failed: ${JSON.stringify(result.errors)}`);
    }

    console.log('User successfully created in PostgreSQL (unverified):', {
      userId: result.data?.createUser?.id,
      cognitoId: result.data?.createUser?.cognitoId,
      email: result.data?.createUser?.email,
      emailVerified: result.data?.createUser?.emailVerified,
    });

    // Do NOT auto-confirm user - let them verify their email
    event.response.autoConfirmUser = false;
    event.response.autoVerifyEmail = false;

    // Return the event to Cognito (required)
    return event;
  } catch (error) {
    console.error('Failed to sync user to PostgreSQL:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cognitoId: sub,
      email,
    });

    // IMPORTANT: Throwing an error here will prevent signup
    // This maintains data consistency - either both Cognito and DB succeed, or both fail
    throw error;
  }
};
