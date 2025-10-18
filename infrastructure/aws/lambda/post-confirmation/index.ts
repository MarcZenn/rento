/**
 * AWS Cognito Post-Confirmation Lambda Trigger
 *
 * This Lambda function is automatically invoked by AWS Cognito after a user
 * verifies their email. It updates the user's email_verified status in PostgreSQL.
 *
 * Trigger: PostConfirmation
 * Purpose: Update email_verified = true when user confirms their email
 *
 * Note: User creation happens in PreSignUp trigger, not here.
 *
 * Environment Variables Required:
 * - GRAPHQL_API_URL: The GraphQL API endpoint
 * - GRAPHQL_API_KEY: API key for authentication (or use IAM)
 * - ENVIRONMENT: deployment environment (production, development, etc.)
 */

import { PostConfirmationTriggerHandler, PostConfirmationTriggerEvent } from 'aws-lambda';

interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
  };
}

interface UpdateUserEmailVerifiedData {
  updateUserEmailVerified: {
    id: string;
    cognitoId: string;
    email: string;
    emailVerified: boolean;
    updatedAt: string;
  };
}

interface GraphQLResponse {
  data?: UpdateUserEmailVerifiedData;
  errors?: GraphQLError[];
}

// GraphQL mutation to update email verification status
const UPDATE_EMAIL_VERIFIED_MUTATION = `
  mutation UpdateUserEmailVerified($cognitoId: String!) {
    updateUserEmailVerified(cognitoId: $cognitoId) {
      id
      cognitoId
      email
      emailVerified
      updatedAt
    }
  }
`;

/**
 * Main Lambda handler for PostConfirmation trigger
 */
export const handler: PostConfirmationTriggerHandler = async (
  event: PostConfirmationTriggerEvent
) => {
  console.log('PostConfirmation trigger received:', {
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
    console.log(`Updating email_verified status in PostgreSQL database`, {
      cognitoId: sub,
      email,
    });

    // Call GraphQL API to update email verification status
    const response = await fetch(GRAPHQL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': GRAPHQL_API_KEY,
        'User-Agent': 'AWS-Lambda-PostConfirmation',
      },
      body: JSON.stringify({
        query: UPDATE_EMAIL_VERIFIED_MUTATION,
        variables: {
          cognitoId: sub,
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

    // const result = await response.json();
    const result = (await response.json()) as GraphQLResponse;

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('GraphQL mutation errors:', result.errors);

      // Check if user not found (user should exist from PreSignUp)
      const userNotFoundError = result.errors.find(
        err => err.message?.includes('User not found') || err.extensions?.code === 'NOT_FOUND'
      );

      if (userNotFoundError) {
        console.error('User not found in database - PreSignUp may have failed', {
          cognitoId: sub,
        });
        // This is a critical error - user should have been created in PreSignUp
        throw new Error(`User not found in database: ${sub}`);
      }

      // Other errors are also fatal
      throw new Error(`GraphQL mutation failed: ${JSON.stringify(result.errors)}`);
    }

    console.log('User email verification status updated successfully in PostgreSQL:', {
      userId: result.data?.updateUserEmailVerified?.id,
      cognitoId: result.data?.updateUserEmailVerified?.cognitoId,
      email: result.data?.updateUserEmailVerified?.email,
      emailVerified: result.data?.updateUserEmailVerified?.emailVerified,
    });

    // Return the event to Cognito (required)
    return event;
  } catch (error) {
    console.error('Failed to update email verification status in PostgreSQL:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cognitoId: sub,
      email,
    });

    // IMPORTANT: Throwing an error here will prevent email confirmation in Cognito
    // However, the user can still retry email verification
    // We throw the error to ensure DB stays in sync with Cognito
    throw error;
  }
};
