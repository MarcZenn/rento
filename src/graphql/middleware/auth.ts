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
    roles?: string[];
  };
  req: any;
  res: any;
}

// ============================================================================
// JWT VERIFICATION
// ============================================================================

/**
 * Decode JWT token (basic implementation)
 * In production, use proper JWT verification libraries like:
 * - aws-jwt-verify for AWS Cognito Tokens
 */
function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));

    return decoded;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * Verify AWS Cognito JWT token
 * 1. Decodes the token
 * 2. Checks if token is expired (compares exp claim to current time)
 * 3. Throws UNAUTHENTICATED error if expired
 * TODO: Implement proper verification using aws-jwt-verify
 */
async function verifyCognitoToken(token: string): Promise<DecodedToken | null> {
  // For now, just decode - in production, use aws-jwt-verify
  const decoded = decodeJWT(token);

  if (!decoded) {
    return null;
  }

  // Check token expiration
  if (decoded.exp * 1000 < Date.now()) {
    throw new GraphQLError('Token expired', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  return decoded;
}

/**
 * Verify Clerk JWT token (legacy support)
 * TODO: Implement proper verification using @clerk/backend
 */
// async function verifyClerkToken(token: string): Promise<DecodedToken | null> {
//   // For now, just decode - in production, use @clerk/backend
//   const decoded = decodeJWT(token);

//   if (!decoded) {
//     return null;
//   }

//   // Check token expiration
//   if (decoded.exp * 1000 < Date.now()) {
//     throw new GraphQLError('Token expired', {
//       extensions: { code: 'UNAUTHENTICATED' },
//     });
//   }

//   return decoded;
// }

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
    // Try Cognito verification (preferred for APPI compliance)
    let decoded = await verifyCognitoToken(token);
    let authProvider: 'cognito' | 'clerk' = 'cognito';

    // Fallback to Clerk for backward compatibility
    // if (!decoded) {
    //   decoded = await verifyClerkToken(token);
    //   authProvider = 'clerk';
    // }

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
      email: decoded.email,
      roles: decoded['cognito:groups'] || [],
    };

    if (authProvider === 'cognito') {
      context.user.cognitoId = decoded.sub;
    } else {
      context.user.clerkId = decoded.sub;
    }

    // Log authentication for APPI compliance
    console.log('User authenticated:', {
      userId: context.user.id,
      provider: authProvider,
      ip: req.ip,
    });
  } catch (error) {
    if (error instanceof GraphQLError) {
      throw error;
    }
    console.error('Authentication error:', error);
    throw new GraphQLError('Authentication failed', {
      extensions: { code: 'UNAUTHENTICATED' },
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
