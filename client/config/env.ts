/**
 * Client Environment Configuration
 *
 * Centralized, type-safe access to environment variables.
 * All client environment variables MUST use EXPO_PUBLIC_ prefix.
 *
 * Why have an env.ts file?
 *
 * Without this file we have scattered env var declarations. For example:
 *
 * -> const endpoint = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT
 *
 * This could result in potentially undefined variables without proper
 * type checking. It also serves as a single source of truth for env vars.
 *
 *
 * Benefits:
 * - Type safety and autocomplete
 * - Runtime validation
 * - Single source of truth
 * - Easy to mock in tests
 * - Clean, short variable names
 */

/**
 * Validates that a required environment variable exists
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Please check your client/.env file and ensure ${key} is set.`
    );
  }

  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Environment Configuration
 *
 * These values are loaded from client/.env at build time.
 * They are embedded into the app bundle and visible to users.
 * NEVER put secrets here - only public configuration.
 */
export const ENV = {
  // GraphQL API Configuration
  graphqlEndpoint: getRequiredEnv('EXPO_PUBLIC_GRAPHQL_ENDPOINT'),
  // Authentication - AWS Cognito
  cognito: {
    region: getRequiredEnv('EXPO_PUBLIC_AWS_REGION'),
    userPoolId: getRequiredEnv('EXPO_PUBLIC_COGNITO_USER_POOL_ID'),
    userPoolClientId: getRequiredEnv('EXPO_PUBLIC_COGNITO_CLIENT_ID'),
  },
  // Application Configuration
  app: {
    environment: getOptionalEnv('EXPO_PUBLIC_APP_ENV', 'development') as
      | 'development'
      | 'staging'
      | 'production',
    apiTimeout: parseInt(getOptionalEnv('EXPO_PUBLIC_API_TIMEOUT', '30000'), 10),
  },
  // Feature Flags
  features: {
    enableDevMenu: getOptionalEnv('EXPO_PUBLIC_ENABLE_DEV_MENU', 'true') === 'true',
    enableAnalytics: getOptionalEnv('EXPO_PUBLIC_ENABLE_ANALYTICS', 'false') === 'true',
  },
  // Localization
  i18n: {
    defaultLanguage: getOptionalEnv('EXPO_PUBLIC_DEFAULT_LANGUAGE', 'en-US'),
    supportedLanguages: getOptionalEnv('EXPO_PUBLIC_SUPPORTED_LANGUAGES', 'en-US,ja-JP').split(','),
  },
} as const;

/**
 * Type-safe environment configuration
 * Use this type when you need to reference the environment config
 */
export type Environment = typeof ENV;

/**
 * Helper to check if we're in development mode
 */
export const isDevelopment = ENV.app.environment === 'development';

/**
 * Helper to check if we're in production mode
 */
export const isProduction = ENV.app.environment === 'production';

/**
 * Log environment info on startup (development only)
 */
if (isDevelopment && __DEV__) {
  console.log('📋 Environment Configuration:', {
    environment: ENV.app.environment,
    graphqlEndpoint: ENV.graphqlEndpoint,
    cognitoRegion: ENV.cognito.region,
    hasCognitoUserPool: !!ENV.cognito.userPoolId,
    defaultLanguage: ENV.i18n.defaultLanguage,
  });
}
