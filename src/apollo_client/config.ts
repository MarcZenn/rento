/**
 * ============================================================================
 * AWS Amplify Configuration
 * ============================================================================
 *
 * Configures AWS Amplify for authentication with AWS Cognito in Tokyo region.
 * This configuration is used across the React Native application to:
 * - Authenticate users via AWS Cognito
 * - Manage JWT tokens for API requests
 * - Handle token refresh automatically
 */

import { Amplify } from 'aws-amplify';

const { EXPO_PUBLIC_COGNITO_USER_POOL_ID, EXPO_PUBLIC_COGNITO_CLIENT_ID, AWS_REGION } = process.env;

if (!EXPO_PUBLIC_COGNITO_USER_POOL_ID) {
  console.error('❌ EXPO_PUBLIC_COGNITO_USER_POOL_ID is not set in environment variables');
  throw new Error('Missing EXPO_PUBLIC_COGNITO_USER_POOL_ID - Please set in .env file');
}

if (!EXPO_PUBLIC_COGNITO_CLIENT_ID) {
  console.error('❌ EXPO_PUBLIC_COGNITO_CLIENT_ID is not set in environment variables');
  throw new Error('Missing EXPO_PUBLIC_COGNITO_CLIENT_ID - Please set in .env file');
}

/**
 * Configure AWS Amplify for Cognito Authentication
 *
 * This configuration:
 * 1. Sets up connection to Tokyo region Cognito User Pool
 * 2. Configures the app client for authentication flows
 * 3. Enables automatic token refresh
 *
 * Token Validity:
 * - Access Token: Typically 1 hour (configured in Cognito User Pool)
 * - ID Token: Typically 1 hour (configured in Cognito User Pool)
 * - Refresh Token: Typically 30 days (configured in Cognito User Pool)
 */
export const configureAmplify = async () => {
  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          // User Pool ID - identifies your Cognito User Pool
          // Region is automatically inferred from the User Pool ID
          // (e.g., ap-northeast-1_XXXXXXXXX -> ap-northeast-1)
          userPoolId: EXPO_PUBLIC_COGNITO_USER_POOL_ID,

          // App Client ID - identifies this mobile app
          userPoolClientId: EXPO_PUBLIC_COGNITO_CLIENT_ID,

          // Login configuration
          loginWith: {
            email: true,
            username: false, // We use email as username
          },
        },
      },
    });

    console.log('✅ AWS Amplify configured successfully');
    console.log(`   Region: ${AWS_REGION}`);
    console.log(`   User Pool: ${EXPO_PUBLIC_COGNITO_USER_POOL_ID}`);
  } catch (error) {
    console.error('❌ Failed to configure AWS Amplify:', error);
    throw error;
  }
};

/**
 * Get the current Amplify configuration
 * Useful for debugging and verification
 */
export const getAmplifyConfig = () => {
  return {
    region: AWS_REGION,
    userPoolId: EXPO_PUBLIC_COGNITO_USER_POOL_ID,
    clientId: EXPO_PUBLIC_COGNITO_CLIENT_ID,
  };
};

export default configureAmplify;
