/**
 * ============================================================================
 * Configuration Exports
 * ============================================================================
 *
 * Central export point for all configuration modules.
 * Import from this file to access Amplify, Apollo, and type definitions.
 */

// Amplify configuration
export { configureAmplify, getAmplifyConfig } from './config';
export { default as configureAmplifyDefault } from './config';

// Apollo Client
export { apolloClient, clearApolloCache, resetApolloClient } from './apollo';
export { default as apolloClientDefault } from './apollo';

// Apollo Provider
export { ApolloProvider } from './ApolloProvider';
export { default as ApolloProviderDefault } from './ApolloProvider';

// Types
export type {
  QueryResult,
  MutationResult,
  User,
  UserProfile,
  ConsentPreferences,
  UserConsent,
  UpdateConsentPreferencesInput,
  UpdateUserProfileInput,
  UpdateConsentResponse,
  DataDeletionResponse,
  GraphQLErrorExtensions,
  GraphQLErrorDetails,
  AuthSession,
  AuthUser,
} from './types';
