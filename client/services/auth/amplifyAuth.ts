/**
 * AWS Amplify Authentication Service uses AWS Cognito
 *
 */

import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthUser {
  userId: string;
  username: string;
  email?: string;
}

export interface AuthSession {
  accessToken: string;
  idToken: string;
  user: AuthUser;
}

/**
 * Get current auth session with tokens
 */
export async function amplifyGetSession(): Promise<AuthSession | null> {
  try {
    const session = await fetchAuthSession();
    const user = await getCurrentUser();

    if (!session.tokens) {
      return null;
    }

    return {
      accessToken: session.tokens.accessToken.toString(),
      idToken: session.tokens.idToken?.toString() || '',
      user: {
        userId: user.userId,
        username: user.username,
        email: user.signInDetails?.loginId,
      },
    };
  } catch (error) {
    // User not authenticated or session expired
    return null;
  }
}

/**
 * Get access token for GraphQL requests
 */
export async function amplifyGetAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken.toString() || null;
  } catch (error) {
    return null;
  }
}
