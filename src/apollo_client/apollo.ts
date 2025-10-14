/**
 * ============================================================================
 * Apollo Client Configuration
 * ============================================================================
 *
 * Configures Apollo Client for GraphQL API communication with:
 * - AWS Cognito JWT authentication
 * - Automatic token refresh handling
 * - Error handling for authentication failures
 * - TypeScript support
 *
 * This client automatically:
 * 1. Fetches current JWT token from Amplify
 * 2. Attaches token to every GraphQL request
 * 3. Handles token expiration and refresh
 * 4. Manages authentication errors
 */

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';

// TODO:: set up this endpoint in the backend
const { EXPO_PUBLIC_GRAPHQL_ENDPOINT } = process.env;

if (!EXPO_PUBLIC_GRAPHQL_ENDPOINT) {
  console.error('❌ EXPO_PUBLIC_GRAPHQL_ENDPOINT is not set in environment variables');
  throw new Error('Missing EXPO_PUBLIC_GRAPHQL_ENDPOINT - Please set in .env file');
}

/**
 * Custom HTTP Fetch
 *
 * By passing `fetch: customFetch` to `HttpLink`, you're telling Apollo Client:
 * > "Instead of using the browser's native `fetch()`, use MY custom function for ALL HTTP requests."
 *
 * This function:
 * 1. Fetches the current authentication session from Amplify
 * 2. Extracts the JWT access token
 * 3. Adds the token to the Authorization header
 * 4. Handles cases where user is not authenticated
 *
 * The token is fetched on EVERY request to ensure we always use the latest token.
 * Amplify handles token refresh automatically when the token is expired.
 */
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const unauthorizedUserResponse = fetch(input, init);
  try {
    // Fetch current authentication session
    // This will automatically refresh the token if it's expired
    const session = await fetchAuthSession();

    // Extract access token from session
    const token = session.tokens?.accessToken?.toString();

    if (!token) {
      console.warn('⚠️ No authentication token available - user may not be signed in');
      return unauthorizedUserResponse;
    }

    // Attach token to request headers
    const headers = {
      ...init?.headers,
      ...(token && { authorization: `Bearer ${token}` }),
    };

    return fetch(input, {
      ...init,
      headers,
    });
  } catch (error) {
    // If token fetch fails, log error and continue without token
    // This allows public GraphQL queries to work
    console.error('❌ Failed to fetch authentication token:', error);
    return unauthorizedUserResponse;
  }
};

// ============================================================================
// ERROR HANDLING LINK
// ============================================================================

/**
 * Error Link - Handles authentication and network errors
 *
 * This link intercepts errors and:
 * 1. Detects authentication failures (401, UNAUTHENTICATED)
 * 2. Detects token expiration
 * 3. Attempts to refresh token automatically
 * 4. Signs out user if refresh fails
 * 5. Logs errors for debugging
 *
 * Note: Apollo Client v4 uses CombinedGraphQLErrors.
 * Use CombinedGraphQLErrors.is(error) to check for GraphQL errors.
 */
const errorLink = new ErrorLink(({ error, operation, forward }) => {
  // Import CombinedGraphQLErrors check helper
  const CombinedGraphQLErrors = require('@apollo/client/errors').CombinedGraphQLErrors;

  // Handle GraphQL errors
  if (CombinedGraphQLErrors.is(error)) {
    for (const graphqlError of (error as any).errors) {
      const { message, extensions, path } = graphqlError;
      const code = extensions?.code as string | undefined;

      console.error('🔴 GraphQL Error:', {
        message,
        code,
        path,
      });

      // Handle authentication errors
      if (code === 'UNAUTHENTICATED' || code === 'FORBIDDEN') {
        console.warn('⚠️ Authentication error detected - attempting token refresh');

        // Return observable that attempts token refresh
        return new Observable(observer => {
          (async () => {
            try {
              // Force fetch new session (this triggers token refresh)
              const session = await fetchAuthSession({ forceRefresh: true });
              const newToken = session.tokens?.accessToken?.toString();

              if (!newToken) {
                throw new Error('Failed to refresh authentication token');
              }

              // Update operation headers with new token
              operation.setContext({
                headers: {
                  ...operation.getContext().headers,
                  authorization: `Bearer ${newToken}`,
                },
              });

              // Retry the request with new token
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              };

              forward(operation).subscribe(subscriber);
            } catch (refreshError) {
              // Token refresh failed - sign out user
              console.error('❌ Token refresh failed:', refreshError);
              console.log('🚪 Signing out user due to authentication failure');

              try {
                await signOut();
              } catch (signOutError) {
                console.error('❌ Sign out failed:', signOutError);
              }

              observer.error(refreshError);
            }
          })();
        });
      }

      // Handle token expiration specifically
      if (extensions?.reason === 'TOKEN_EXPIRED') {
        console.warn('⚠️ Token expired - user should sign in again');
      }
    }
  } else {
    // Handle network errors (non-GraphQL errors)
    console.error('🔴 Network Error:', {
      message: error.message,
      name: error.name,
    });

    // Check if error has statusCode property
    if ('statusCode' in error) {
      const statusCode = (error as any).statusCode;
      if (statusCode === 401) {
        console.warn('⚠️ 401 Unauthorized - authentication required');
      }
      if (statusCode === 403) {
        console.warn('⚠️ 403 Forbidden - insufficient permissions');
      }
    }
  }
});

// ============================================================================
// HTTP LINK
// ============================================================================

/**
 * HTTP Link - Connects to GraphQL API endpoint with custom fetch
 */
const httpLink = new HttpLink({
  uri: EXPO_PUBLIC_GRAPHQL_ENDPOINT,
  fetch: customFetch,
  credentials: 'include', // Include cookies if needed
});

// ============================================================================
// APOLLO CLIENT
// ============================================================================

/**
 * Apollo Client Instance
 *
 * Link Chain Order (executed in order):
 * 1. errorLink - Handles errors and token refresh
 * 2. httpLink - Sends request to GraphQL endpoint (with custom fetch for auth)
 *
 * Cache Configuration:
 * - InMemoryCache: Caches query results for performance
 * - Automatic cache updates on mutations
 * - Normalized cache for efficient data management
 */
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache({
    // Type policies can be configured here for custom cache behavior
    typePolicies: {
      Query: {
        fields: {
          // Configure field policies if needed
          // Example: pagination, cache redirects, etc.
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Try cache first, then network
      errorPolicy: 'all', // Return both data and errors
    },
    query: {
      fetchPolicy: 'network-only', // Always fetch from network for queries
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all', // Return both data and errors for mutations
    },
  },
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clear Apollo Client cache
 * Useful after sign out or when data needs to be refreshed
 */
export const clearApolloCache = async () => {
  try {
    await apolloClient.clearStore();
    console.log('✅ Apollo Client cache cleared');
  } catch (error) {
    console.error('❌ Failed to clear Apollo Client cache:', error);
  }
};

/**
 * Reset Apollo Client
 * Clears cache and refetches all active queries
 */
export const resetApolloClient = async () => {
  try {
    await apolloClient.resetStore();
    console.log('✅ Apollo Client reset successfully');
  } catch (error) {
    console.error('❌ Failed to reset Apollo Client:', error);
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default apolloClient;
