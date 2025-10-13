/**
// ============================================================================
// DEV NOTES
// ============================================================================
 * Authentication Middleware for GraphQL
 * Handles JWT verification for both AWS Cognito and Clerk (legacy)
 * 
 * Authenticates and authorizes users for the GraphQL API. It extracts 
 * JWT tokens from requests, verifies them, and injects user identity 
 * into your GraphQL resolvers for access control. Ensures request come 
 * from legitimate users. Prevents unauthorized access to user data.
 * 
 * 
 * The createAuthContext() function:
 * - This is the core authentication function called by Apollo Server on every request.
 * - Injects context.user into every resolver (no need to parse tokens manually
 * - Provides reusable authorization helpers (requireRole, requireAdmin, etc.)
 * 
 * Authorization Helpers:
 * - These are utility functions for your GraphQL resolvers to enforce access control.
 * 
 * Request Flow Through This Middleware:
 *  1. Client sends request with header: Authorization: Bearer <JWT_TOKEN>
 *  2. Apollo Server calls createAuthContext() 
 *  3. Extract token from header
 *  4. Try verifyCognitoToken(token)
 *          ↓ (if fails)
 *  5. Try verifyClerkToken(token)
 *  6. Decode token → Extract user ID, email, roles
 *  7. Build context object with user info
 *  8. Log authentication event (APPI compliance)
 *  9. Return context to Apollo Server
 *  10. GraphQL resolver receives context with user data
 *  11. Resolver calls requireRole() or requireAdmin() for authorization
 * 
 */

import { GraphQLError } from 'graphql';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import 'dotenv/config';

// ============================================================================
// TYPES
// ============================================================================

// Represents the decoded JWT payload structure from AWS Cognito.
interface DecodedToken {
  sub: string; // User ID
  email?: string;
  'cognito:username'?: string;
  'cognito:groups'?: string[];
  exp: number;
  iat: number;
  token_use?: string;
  client_id?: string;
}

// The context object passed to every GraphQL resolver, containing:
//   - user: Authenticated user info (undefined if not authenticated)
//   - req/res: Express request/response objects
interface Context {
  user?: {
    id: string;
    cognitoId?: string;
    clerkId?: string;
    email?: string;
    username?: string;
    roles?: string[];
  };
  req: any;
  res: any;
}

// ============================================================================
// JWT VERIFICATION SETUP
// ============================================================================

// Verify environment variables are set
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_BACKEND_CLIENT_ID = process.env.COGNITO_BACKEND_CLIENT_ID;
const COGNITO_REGION = process.env.COGNITO_REGION || process.env.AWS_REGION || 'ap-northeast-1';

if (!COGNITO_USER_POOL_ID) {
  console.warn('⚠️ COGNITO_USER_POOL_ID not set - Cognito authentication will fail');
}

if (!COGNITO_BACKEND_CLIENT_ID) {
  console.warn('⚠️ COGNITO_BACKEND_CLIENT_ID not set - Cognito authentication will fail');
}

/**
 * Create Cognito JWT Verifier for Access Tokens
 * Verifies JWT signatures against AWS Cognito public keys
 * - Validates token signature cryptographically
 * - Checks token expiration automatically
 * - Validates token issuer (user pool)
 * - Validates token audience (client ID)
 */
const accessTokenVerifier =
  COGNITO_USER_POOL_ID && COGNITO_BACKEND_CLIENT_ID
    ? CognitoJwtVerifier.create({
        userPoolId: COGNITO_USER_POOL_ID,
        tokenUse: 'access',
        clientId: COGNITO_BACKEND_CLIENT_ID,
      })
    : null;

/**
 * Create Cognito JWT Verifier for ID Tokens
 * ID tokens contain user profile information (email, username, etc.)
 */
const idTokenVerifier =
  COGNITO_USER_POOL_ID && COGNITO_BACKEND_CLIENT_ID
    ? CognitoJwtVerifier.create({
        userPoolId: COGNITO_USER_POOL_ID,
        tokenUse: 'id',
        clientId: COGNITO_BACKEND_CLIENT_ID,
      })
    : null;

// ============================================================================
// JWT VERIFICATION
// ============================================================================

/**
 * Verify AWS Cognito JWT token with proper cryptographic verification
 *
 * This function uses aws-jwt-verify to:
 * 1. Download and cache Cognito's public keys (JWKS)
 * 2. Verify the token's cryptographic signature
 * 3. Validate token expiration, issuer, and audience
 * 4. Return the verified payload
 *
 * @param token - JWT token from Authorization header
 * @returns Verified token payload or null if verification fails
 */
async function verifyCognitoToken(token: string): Promise<DecodedToken | null> {
  if (!accessTokenVerifier || !idTokenVerifier) {
    console.error('Cognito verifiers not initialized - check environment variables');
    return null;
  }

  try {
    // Try to verify as access token first (most common for API requests)
    try {
      const payload = await accessTokenVerifier.verify(token, {
        // The aws-jwt-verify library requires the clientId parameter to be
        // passed both when creating the verifier instance AND when calling
        // the verify() method. This is by design - it allows for additional
        // flexibility in verification while maintaining type safety.
        clientId: COGNITO_BACKEND_CLIENT_ID!,
      });
      console.log('✅ Access token verified successfully');
      return payload as DecodedToken;
    } catch (accessError) {
      // If access token verification fails, try ID token
      // ID tokens are sometimes sent by mobile apps
      try {
        const payload = await idTokenVerifier.verify(token, {
          // The aws-jwt-verify library requires the clientId parameter to be
          // passed both when creating the verifier instance AND when calling
          // the verify() method. This is by design - it allows for additional
          // flexibility in verification while maintaining type safety.
          clientId: COGNITO_BACKEND_CLIENT_ID!,
        });
        console.log('✅ ID token verified successfully');
        return payload as DecodedToken;
      } catch (idError) {
        // Both verifications failed
        console.error('Token verification failed for both access and ID token types');
        throw accessError; // Throw the original access token error
      }
    }
  } catch (error: any) {
    // Handle specific JWT verification errors
    if (error.message?.includes('expired')) {
      throw new GraphQLError('Token expired - please refresh your session', {
        extensions: {
          code: 'UNAUTHENTICATED',
          reason: 'TOKEN_EXPIRED',
        },
      });
    }

    if (error.message?.includes('invalid signature')) {
      throw new GraphQLError('Invalid token signature', {
        extensions: {
          code: 'UNAUTHENTICATED',
          reason: 'INVALID_SIGNATURE',
        },
      });
    }

    if (error.message?.includes('issuer')) {
      console.error('Token issuer mismatch - token not from expected Cognito user pool');
      throw new GraphQLError('Invalid token issuer', {
        extensions: {
          code: 'UNAUTHENTICATED',
          reason: 'INVALID_ISSUER',
        },
      });
    }

    // Generic verification failure
    console.error('Cognito token verification failed:', error.message);
    throw new GraphQLError('Token verification failed', {
      extensions: {
        code: 'UNAUTHENTICATED',
        reason: 'VERIFICATION_FAILED',
      },
    });
  }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Create authentication context for GraphQL resolvers
 * This middleware extracts the JWT token and verifies it
 * core auth function called by Apollo server on every request
 */
export async function createAuthContext({ req, res }: { req: any; res: any }): Promise<Context> {
  // init context
  const context: Context = {
    req,
    res,
    user: undefined,
  };

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // No token provided - return context without user (public access)
    return context;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return context;
  }

  try {
    // Verify Cognito token with proper cryptographic verification
    const decoded = await verifyCognitoToken(token);

    if (!decoded) {
      throw new GraphQLError('Invalid token', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Build User Context
    // decoded token data is transformed into a
    // standardized user object available to all
    // resolvers
    context.user = {
      id: decoded.sub,
      cognitoId: decoded.sub,
      email: decoded.email,
      username: decoded['cognito:username'],
      roles: decoded['cognito:groups'] || [], // Role comes from here
    };

    // Log authentication for APPI compliance
    // Include timestamp, user ID, IP address for audit trail
    console.log('🔐 User authenticated:', {
      userId: context.user.id,
      username: context.user.username,
      email: context.user.email,
      provider: 'cognito',
      region: COGNITO_REGION,
      ip: req.ip || req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    // Re-throw GraphQLErrors (already formatted with proper error codes)
    if (error instanceof GraphQLError) {
      throw error;
    }

    // Handle unexpected errors
    console.error('❌ Authentication error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    throw new GraphQLError('Authentication failed', {
      extensions: {
        code: 'UNAUTHENTICATED',
        reason: 'UNEXPECTED_ERROR',
      },
    });
  }

  return context;
}

// ============================================================================
// AUTHORIZATION HELPERS
// These are utility functions for your GraphQL resolvers to enforce access control.
// ============================================================================

/**
 * Check if user has required role
 */
export function requireRole(context: Context, requiredRole: string): void {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  if (!context.user.roles?.includes(requiredRole)) {
    throw new GraphQLError('Insufficient permissions', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

/**
 * Check if user is admin
 */
export function requireAdmin(context: Context): void {
  requireRole(context, 'admin');
}

/**
 * Check if user is accessing their own data
 */
export function requireSelfOrAdmin(context: Context, userId: string): void {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  const isAdmin = context.user.roles?.includes('admin');
  const isSelf = context.user.id === userId;

  if (!isAdmin && !isSelf) {
    throw new GraphQLError('Unauthorized access', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}
