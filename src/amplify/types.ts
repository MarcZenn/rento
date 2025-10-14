/**
 * ============================================================================
 * GraphQL Types & Interfaces
 * ============================================================================
 *
 * TypeScript types for GraphQL operations.
 * These types ensure type safety when using Apollo Client hooks.
 *
 * NOTE: For production apps, consider using GraphQL Code Generator
 * to automatically generate these types from your GraphQL schema.
 * See: https://www.graphql-code-generator.com/
 */

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * Generic Query Result type
 */
export interface QueryResult<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}

/**
 * Generic Mutation Result type
 */
export interface MutationResult<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
}

// ============================================================================
// CONSENT TYPES (APPI Compliance)
// ============================================================================

export interface ConsentPreferences {
  dataProcessing: boolean;
  marketingCommunication: boolean;
  analyticsTracking: boolean;
  thirdPartySharing: boolean;
}

export interface UserConsent {
  id: string;
  userId: string;
  consentType: string;
  consentGiven: boolean;
  consentDate: string;
  policyVersion: string;
  locale: string;
}

// ============================================================================
// MUTATION INPUT TYPES
// ============================================================================

export interface UpdateConsentPreferencesInput {
  dataProcessing?: boolean;
  marketingCommunication?: boolean;
  analyticsTracking?: boolean;
  thirdPartySharing?: boolean;
}

export interface UpdateUserProfileInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface UpdateConsentResponse {
  success: boolean;
  message?: string;
  consent?: UserConsent;
}

export interface DataDeletionResponse {
  success: boolean;
  requestId: string;
  estimatedCompletionDate: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface GraphQLErrorExtensions {
  code?: string;
  reason?: string;
  statusCode?: number;
}

export interface GraphQLErrorDetails {
  message: string;
  extensions?: GraphQLErrorExtensions;
  path?: string[];
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  roles?: string[];
}
