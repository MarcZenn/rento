/**
 * Profile Resolvers - PostgreSQL Implementation
 */

import { GraphQLError } from 'graphql';
import { postgresql, redis } from '@/server/database/connection';
import { AUDIT_EVENT_TYPES } from '@/server/database/auditEventTypes';
import type { PoolClient } from 'pg';

// ============================================================================
// TYPES
// ============================================================================

interface Profile {
  id: string;
  user_id: string;
  phone_number?: string;
  first_name?: string;
  surname?: string;
  employment_status_id?: string;
  user_type_id?: string;
  is_foreign_resident?: boolean;
  nationality_id?: string;
  has_guarantor?: boolean;
  consecutive_years_employed?: number;
  rental_readiness_score?: number;
  saved_properties?: string[];
  onboarding_completed?: boolean;
  last_active?: Date;
  updated_at?: Date;
  about?: string;
  created_at: Date;
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
  PROFILE: 300, // 5 minutes
};

async function getCachedProfile(userId: string): Promise<Profile | null> {
  const cached = await redis.get(`profile:${userId}`);
  return cached ? JSON.parse(cached) : null;
}

async function cacheProfile(profile: Profile): Promise<void> {
  await redis.set(`profile:${profile.user_id}`, JSON.stringify(profile), CACHE_TTL.PROFILE);
}

async function invalidateProfileCache(userId: string): Promise<void> {
  await redis.delete(`profile:${userId}`);
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

async function logProfileAccess(
  userId: string,
  operation: string,
  context: Context
): Promise<void> {
  try {
    await postgresql.query(
      `INSERT INTO appi_audit_events (
        event_id, user_id, event_type, event_timestamp,
        ip_address, user_agent, data_accessed, compliance_status, event_details
      ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`,
      [
        `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId,
        AUDIT_EVENT_TYPES.PROFILE_DATA_ACCESS,
        context.req?.ip || '127.0.0.1',
        context.req?.headers?.['user-agent'] || 'server',
        operation,
        'compliant',
        JSON.stringify({ operation, timestamp: new Date().toISOString() }),
      ]
    );
  } catch (error) {
    console.error('Failed to log profile access:', error);
  }
}

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const profileQueries = {
  /**
   * Get user profile by user ID
   */
  getUserProfile: async (
    _: any,
    { userId }: { userId: string },
    context: Context
  ): Promise<Profile | null> => {
    // APPI compliance check
    if (context.user?.id !== userId) {
      throw new GraphQLError('Unauthorized access to profile data', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Check cache first
    const cached = await getCachedProfile(userId);
    if (cached) {
      await logProfileAccess(userId, 'getUserProfile (cached)', context);
      return cached;
    }

    // Query database
    const result = await postgresql.query<Profile>('SELECT * FROM profiles WHERE user_id = $1', [
      userId,
    ]);

    const profile = result.rows[0] || null;
    if (profile) {
      await logProfileAccess(userId, 'getUserProfile', context);
      await cacheProfile(profile);
    }

    return profile;
  },

  /**
   * Get profile by ID
   */
  getProfile: async (_: any, { id }: { id: string }, context: Context): Promise<Profile | null> => {
    const result = await postgresql.query<Profile>('SELECT * FROM profiles WHERE id = $1', [id]);

    const profile = result.rows[0] || null;

    // APPI compliance check
    if (profile && context.user?.id !== profile.user_id) {
      throw new GraphQLError('Unauthorized access to profile data', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    if (profile) {
      await logProfileAccess(profile.user_id, 'getProfile', context);
      await cacheProfile(profile);
    }

    return profile;
  },
};

// ============================================================================
// MUTATION RESOLVERS
// ============================================================================

export const profileMutations = {
  /**
   * Create user profile
   * Replaces Convex createUserProfile mutation
   */
  createProfile: async (_: any, { input }: { input: any }, context: Context): Promise<Profile> => {
    // APPI compliance check
    if (context.user?.id !== input.userId) {
      throw new GraphQLError('Unauthorized to create profile for this user', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return await postgresql.transaction(async (client: PoolClient) => {
      // Check if profile already exists
      const existingCheck = await client.query('SELECT id FROM profiles WHERE user_id = $1', [
        input.userId,
      ]);

      if (existingCheck.rows.length > 0) {
        throw new GraphQLError('Profile already exists for this user', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Insert profile
      const result = await client.query<Profile>(
        `INSERT INTO profiles (
          user_id, phone_number, first_name, surname,
          employment_status_id, user_type_id, is_foreign_resident,
          nationality_id, has_guarantor, consecutive_years_employed,
          about, created_at, onboarding_completed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), false)
        RETURNING *`,
        [
          input.userId,
          input.phoneNumber || null,
          input.firstName || null,
          input.surname || null,
          input.employmentStatusId || null,
          input.userTypeId || null,
          input.isForeignResident || false,
          input.nationalityId || null,
          input.hasGuarantor || false,
          input.consecutiveYearsEmployed || 0,
          input.about || null,
        ]
      );

      const newProfile = result.rows[0];

      // Log profile creation for APPI compliance
      await client.query(
        `INSERT INTO appi_audit_events (
          event_id, user_id, event_type, event_timestamp,
          ip_address, user_agent, data_accessed, compliance_status, event_details
        ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`,
        [
          `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          input.userId,
          AUDIT_EVENT_TYPES.PROFILE_CREATED,
          context.req?.ip || '127.0.0.1',
          context.req?.headers?.['user-agent'] || 'server',
          'User profile created',
          'compliant',
          JSON.stringify({ profileId: newProfile.id }),
        ]
      );

      // Cache the new profile
      await cacheProfile(newProfile);

      return newProfile;
    });
  },

  /**
   * Update user profile
   * Replaces Convex updateUserProfile mutation
   */
  updateProfile: async (
    _: any,
    { id, input }: { id: string; input: any },
    context: Context
  ): Promise<Profile> => {
    return await postgresql.transaction(async (client: PoolClient) => {
      // Get existing profile to check ownership
      const existingProfile = await client.query<Profile>('SELECT * FROM profiles WHERE id = $1', [
        id,
      ]);

      if (existingProfile.rows.length === 0) {
        throw new GraphQLError('Profile not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const profile = existingProfile.rows[0];

      // APPI compliance check
      if (context.user?.id !== profile.user_id) {
        throw new GraphQLError('Unauthorized to update this profile', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.phoneNumber !== undefined) {
        updates.push(`phone_number = $${paramIndex++}`);
        values.push(input.phoneNumber);
      }
      if (input.firstName !== undefined) {
        updates.push(`first_name = $${paramIndex++}`);
        values.push(input.firstName);
      }
      if (input.surname !== undefined) {
        updates.push(`surname = $${paramIndex++}`);
        values.push(input.surname);
      }
      if (input.employmentStatusId !== undefined) {
        updates.push(`employment_status_id = $${paramIndex++}`);
        values.push(input.employmentStatusId);
      }
      if (input.userTypeId !== undefined) {
        updates.push(`user_type_id = $${paramIndex++}`);
        values.push(input.userTypeId);
      }
      if (input.isForeignResident !== undefined) {
        updates.push(`is_foreign_resident = $${paramIndex++}`);
        values.push(input.isForeignResident);
      }
      if (input.nationalityId !== undefined) {
        updates.push(`nationality_id = $${paramIndex++}`);
        values.push(input.nationalityId);
      }
      if (input.hasGuarantor !== undefined) {
        updates.push(`has_guarantor = $${paramIndex++}`);
        values.push(input.hasGuarantor);
      }
      if (input.consecutiveYearsEmployed !== undefined) {
        updates.push(`consecutive_years_employed = $${paramIndex++}`);
        values.push(input.consecutiveYearsEmployed);
      }
      if (input.about !== undefined) {
        updates.push(`about = $${paramIndex++}`);
        values.push(input.about);
      }
      if (input.onboardingCompleted !== undefined) {
        updates.push(`onboarding_completed = $${paramIndex++}`);
        values.push(input.onboardingCompleted);
      }

      if (updates.length === 0) {
        throw new GraphQLError('No fields to update', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Add updated_at timestamp
      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query<Profile>(
        `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      const updatedProfile = result.rows[0];

      // Invalidate cache
      await invalidateProfileCache(profile.user_id);

      // Log update for APPI compliance
      await logProfileAccess(profile.user_id, 'updateProfile', context);

      return updatedProfile;
    });
  },
};

// ============================================================================
// FIELD RESOLVERS
// ============================================================================

export const profileFieldResolvers = {
  Profile: {
    /**
     * Resolve user from profile
     */
    user: async (parent: Profile, _: any, context: Context) => {
      const result = await postgresql.query('SELECT * FROM users WHERE id = $1', [parent.user_id]);
      return result.rows[0] || null;
    },

    /**
     * Resolve employment status
     */
    employmentStatus: async (parent: Profile) => {
      if (!parent.employment_status_id) return null;
      const result = await postgresql.query('SELECT * FROM employment_statuses WHERE id = $1', [
        parent.employment_status_id,
      ]);
      return result.rows[0] || null;
    },

    /**
     * Resolve user type
     */
    userType: async (parent: Profile) => {
      if (!parent.user_type_id) return null;
      const result = await postgresql.query('SELECT * FROM user_types WHERE id = $1', [
        parent.user_type_id,
      ]);
      return result.rows[0] || null;
    },

    /**
     * Resolve nationality
     */
    nationality: async (parent: Profile) => {
      if (!parent.nationality_id) return null;
      const result = await postgresql.query('SELECT * FROM countries WHERE id = $1', [
        parent.nationality_id,
      ]);
      return result.rows[0] || null;
    },
  },
};
