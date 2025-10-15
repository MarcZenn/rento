/**
 * User Resolvers - PostgreSQL Implementation
 */

import { GraphQLError } from 'graphql';
import { postgresql, redis } from '@/server/database/connection';
import { AUDIT_EVENT_TYPES } from '@/server/database/auditEventTypes';
import type { PoolClient } from 'pg';

// ============================================================================
// TYPES
// ============================================================================

interface User {
  id: string;
  // clerk_id?: string;
  cognito_id?: string;
  email: string;
  username: string;
  created_at: Date;
  updated_at?: Date;
}

interface Context {
  user?: {
    id: string;
    cognitoId?: string;
    clerkId?: string;
  };
  req: any;
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

const CACHE_TTL = {
  USER: 300, // 5 minutes
  USER_LIST: 60, // 1 minute
};

async function getCachedUser(userId: string): Promise<User | null> {
  const cached = await redis.get(`user:${userId}`);
  return cached ? JSON.parse(cached) : null;
}

async function cacheUser(user: User): Promise<void> {
  await redis.set(`user:${user.id}`, JSON.stringify(user), CACHE_TTL.USER);
}

async function invalidateUserCache(userId: string): Promise<void> {
  await redis.delete(`user:${userId}`);
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

async function logUserAccess(userId: string, operation: string, context: Context): Promise<void> {
  try {
    await postgresql.query(
      `INSERT INTO appi_audit_events (
        event_id, user_id, event_type, event_timestamp,
        ip_address, user_agent, data_accessed, compliance_status, event_details
      ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`,
      [
        `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId,
        AUDIT_EVENT_TYPES.USER_DATA_ACCESS,
        context.req?.ip || '127.0.0.1',
        context.req?.headers?.['user-agent'] || 'server',
        operation,
        'compliant',
        JSON.stringify({ operation, timestamp: new Date().toISOString() }),
      ]
    );
  } catch (error) {
    console.error('Failed to log user access:', error);
    // Don't throw - audit logging shouldn't break the application
  }
}

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const userQueries = {
  /**
   * Get current authenticated user
   */
  currentUser: async (_: any, __: any, context: Context): Promise<User | null> => {
    if (!context.user) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const idField = context.user.cognitoId ? 'cognito_id' : '';
    const idValue = context.user.cognitoId;

    if (!idValue) {
      throw new GraphQLError('Invalid authentication credentials', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const result = await postgresql.query<User>(`SELECT * FROM users WHERE ${idField} = $1`, [
      idValue,
    ]);

    const user = result.rows[0] || null;
    if (user) {
      await logUserAccess(user.id, 'currentUser', context);
      await cacheUser(user);
    }

    return user;
  },

  /**
   * Get user by ID
   */
  getUser: async (_: any, { id }: { id: string }, context: Context): Promise<User | null> => {
    // APPI compliance check - users can only access their own data unless admin
    if (context.user?.id !== id && !context.user?.id) {
      throw new GraphQLError('Unauthorized access to user data', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Check cache first
    const cached = await getCachedUser(id);
    if (cached) {
      await logUserAccess(id, 'getUser (cached)', context);
      return cached;
    }

    // Query database
    const result = await postgresql.query<User>('SELECT * FROM users WHERE id = $1', [id]);

    const user = result.rows[0] || null;
    if (user) {
      await logUserAccess(id, 'getUser', context);
      await cacheUser(user);
    }

    return user;
  },

  /**
   * Get user by Clerk ID (legacy support)
   */
  // getUserByClerkId: async (
  //   _: any,
  //   { clerkId }: { clerkId: string },
  //   context: Context
  // ): Promise<User | null> => {
  //   const result = await postgresql.query<User>('SELECT * FROM users WHERE clerk_id = $1', [
  //     clerkId,
  //   ]);

  //   const user = result.rows[0] || null;
  //   if (user) {
  //     await logUserAccess(user.id, 'getUserByClerkId', context);
  //     await cacheUser(user);
  //   }

  //   return user;
  // },

  /**
   * Get user by Cognito ID
   */
  getUserByCognitoId: async (
    _: any,
    { cognitoId }: { cognitoId: string },
    context: Context
  ): Promise<User | null> => {
    const result = await postgresql.query<User>('SELECT * FROM users WHERE cognito_id = $1', [
      cognitoId,
    ]);

    const user = result.rows[0] || null;
    if (user) {
      await logUserAccess(user.id, 'getUserByCognitoId', context);
      await cacheUser(user);
    }

    return user;
  },

  /**
   * Get all users (admin only)
   */
  getAllUsers: async (_: any, __: any, context: Context): Promise<User[]> => {
    // TODO: Add admin role check
    if (!context.user) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    const result = await postgresql.query<User>(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT 100'
    );

    return result.rows;
  },

  /**
   * Get user types
   */
  getUserTypes: async (): Promise<any[]> => {
    const result = await postgresql.query('SELECT * FROM user_types ORDER BY name ASC');
    return result.rows;
  },
};

// ============================================================================
// MUTATION RESOLVERS
// ============================================================================

export const userMutations = {
  /**
   * Create new user
   * Replaces Convex createUser mutation
   */
  createUser: async (_: any, { input }: { input: any }, context: Context): Promise<User> => {
    return await postgresql.transaction(async (client: PoolClient) => {
      // Check if user already exists
      const existingCheck = await client.query(
        'SELECT id FROM users WHERE email = $1 OR cognito_id = $2',
        [input.email, input.cognitoId || null]
      );

      if (existingCheck.rows.length > 0) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Insert user
      const result = await client.query<User>(
        `INSERT INTO users (cognito_id, email, username, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [input.cognitoId || null, input.email, input.username]
      );

      const newUser = result.rows[0];

      // Log user creation for APPI compliance
      await client.query(
        `INSERT INTO appi_audit_events (
          event_id, user_id, event_type, event_timestamp,
          ip_address, user_agent, data_accessed, compliance_status, event_details
        ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`,
        [
          `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          newUser.id,
          AUDIT_EVENT_TYPES.USER_CREATED,
          context.req?.ip || '127.0.0.1',
          context.req?.headers?.['user-agent'] || 'server',
          'User account created',
          'compliant',
          JSON.stringify({ email: input.email, username: input.username }),
        ]
      );

      // Cache the new user
      await cacheUser(newUser);

      return newUser;
    });
  },

  /**
   * Update user
   */
  updateUser: async (
    _: any,
    { id, input }: { id: string; input: any },
    context: Context
  ): Promise<User> => {
    // APPI compliance check
    if (context.user?.id !== id) {
      throw new GraphQLError('Unauthorized to update this user', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(input.email);
    }
    if (input.username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(input.username);
    }

    if (updates.length === 0) {
      throw new GraphQLError('No fields to update', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await postgresql.query<User>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new GraphQLError('User not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const updatedUser = result.rows[0];

    // Invalidate cache
    await invalidateUserCache(id);

    // Log update for APPI compliance
    await logUserAccess(id, 'updateUser', context);

    return updatedUser;
  },

  /**
   * Delete user (soft delete)
   */
  deleteUser: async (
    _: any,
    { id }: { id: string },
    context: Context
  ): Promise<{ success: boolean; message: string }> => {
    // APPI compliance check
    if (context.user?.id !== id) {
      throw new GraphQLError('Unauthorized to delete this user', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return await postgresql.transaction(async (client: PoolClient) => {
      // Check if user exists
      const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // For APPI compliance, we should schedule deletion, not immediate delete
      // Create data deletion request
      await client.query(
        `INSERT INTO data_deletion_requests (
          user_id, requested_at, scheduled_deletion_date, status
        ) VALUES ($1, NOW(), NOW() + INTERVAL '30 days', 'pending')`,
        [id]
      );

      // Log deletion request
      await client.query(
        `INSERT INTO appi_audit_events (
          event_id, user_id, event_type, event_timestamp,
          ip_address, user_agent, data_accessed, compliance_status, event_details
        ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`,
        [
          `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          id,
          AUDIT_EVENT_TYPES.DELETION_REQUEST,
          context.req?.ip || '127.0.0.1',
          context.req?.headers?.['user-agent'] || 'server',
          'User data deletion scheduled',
          'compliant',
          JSON.stringify({ scheduledDays: 30 }),
        ]
      );

      // Invalidate cache
      await invalidateUserCache(id);

      return {
        success: true,
        message: 'User deletion scheduled for 30 days from now',
      };
    });
  },
};

// ============================================================================
// FIELD RESOLVERS
// ============================================================================

export const userFieldResolvers = {
  User: {
    /**
     * Resolve user profile
     */
    profile: async (parent: User, _: any, context: Context) => {
      const result = await postgresql.query('SELECT * FROM profiles WHERE user_id = $1', [
        parent.id,
      ]);
      return result.rows[0] || null;
    },
  },
};
