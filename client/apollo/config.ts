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
import { ENV } from '@/client/config/env';

const { userPoolClientId, userPoolId, region } = ENV.cognito;

if (!userPoolId) {
  console.error('❌ Cognito User Pool ID is not set in environment variables');
  throw new Error('Missing Cognito User Pool ID - Please set in .env file');
}

if (!userPoolClientId) {
  console.error('❌ Cognito Client ID is not set in environment variables');
  throw new Error('Missing Cognito Client ID - Please set in .env file');
}

if (!region) {
  console.error('❌ Cognito AWS Region is not set in environment variables');
  throw new Error('Missing Cognito AWS Region - Please set in .env file');
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
          userPoolId: ENV.cognito.userPoolId,

          // App Client ID - identifies this mobile app
          userPoolClientId: ENV.cognito.userPoolClientId,

          // Login configuration
          loginWith: {
            email: true,
            username: false, // We use email as username
          },
        },
      },
    });

    console.log('✅ AWS Amplify configured successfully');
    console.log(`   Region: ${region}`);
    console.log(`   User Pool: ${userPoolId}`);
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
    region: region,
    userPoolId: userPoolId,
    clientId: userPoolClientId,
  };
};

export default configureAmplify;
