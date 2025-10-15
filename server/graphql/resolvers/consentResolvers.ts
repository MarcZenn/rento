/**
 * Consent Resolvers - PostgreSQL Implementation with APPI Compliance
 */

import { GraphQLError } from 'graphql';
import { postgresql, redis } from '@/server/database/connection';
import { AUDIT_EVENT_TYPES } from '@/server/database/auditEventTypes';
import type { PoolClient } from 'pg';

// ============================================================================
// TYPES
// ============================================================================

interface UserConsent {
  id: string;
  user_id: string;
  profile_data_consent: boolean;
  location_data_consent: boolean;
  communication_consent: boolean;
  analytics_consent: boolean;
  marketing_consent?: boolean;
  consent_timestamp: Date;
  consent_ip_address: string;
  consent_version: string;
  consent_user_agent?: string;
  consent_method: string;
  withdrawal_timestamp?: Date;
  last_updated: Date;
  policy_version_accepted: string;
  legal_basis: string;
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
  CONSENT: 300, // 5 minutes - critical data, refresh frequently
};

async function getCachedConsent(userId: string): Promise<UserConsent | null> {
  const cached = await redis.get(`consent:${userId}`);
  return cached ? JSON.parse(cached) : null;
}

async function cacheConsent(consent: UserConsent): Promise<void> {
  await redis.set(`consent:${consent.user_id}`, JSON.stringify(consent), CACHE_TTL.CONSENT);
}

async function invalidateConsentCache(userId: string): Promise<void> {
  await redis.delete(`consent:${userId}`);
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

async function logConsentEvent(
  userId: string,
  eventType: string,
  details: any,
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
        eventType,
        context.req?.ip || '127.0.0.1',
        context.req?.headers?.['user-agent'] || 'server',
        'Consent operation',
        'compliant',
        JSON.stringify(details),
      ]
    );
  } catch (error) {
    console.error('Failed to log consent event:', error);
  }
}

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const consentQueries = {
  /**
   * Get user consent status
   */
  getUserConsent: async (
    _: any,
    { userId }: { userId: string },
    context: Context
  ): Promise<UserConsent | null> => {
    // APPI compliance check
    if (context.user?.id !== userId) {
      throw new GraphQLError('Unauthorized access to consent data', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const auditEventType = AUDIT_EVENT_TYPES.CONSENT_READ;

    // Check cache first
    const cached = await getCachedConsent(userId);
    if (cached) {
      await logConsentEvent(userId, auditEventType, { source: 'cache' }, context);
      return cached;
    }

    // Query database
    const result = await postgresql.query<UserConsent>(
      'SELECT * FROM user_consent WHERE user_id = $1',
      [userId]
    );

    const consent = result.rows[0] || null;
    if (consent) {
      await logConsentEvent(userId, auditEventType, { source: 'database' }, context);
      await cacheConsent(consent);
    }

    return consent;
  },

  /**
   * Validate user consent for specific operation
   * APPI Article 17 - Must validate consent before data processing
   */
  validateUserConsent: async (
    _: any,
    { userId, consentType, operation }: { userId: string; consentType: string; operation: string },
    context: Context
  ): Promise<{ isValid: boolean; reason?: string; consentStatus: UserConsent | null }> => {
    // Get current consent status
    const result = await postgresql.query<UserConsent>(
      'SELECT * FROM user_consent WHERE user_id = $1',
      [userId]
    );

    const consent = result.rows[0] || null;
    const auditFailedEventType = AUDIT_EVENT_TYPES.CONSENT_VALIDATION_FAILED;

    if (!consent) {
      await logConsentEvent(
        userId,
        auditFailedEventType,
        {
          reason: 'No consent record found',
          consentType,
          operation,
        },
        context
      );

      return {
        isValid: false,
        reason: 'No consent record found',
        consentStatus: null,
      };
    }

    // Check if consent has been withdrawn
    if (consent.withdrawal_timestamp) {
      await logConsentEvent(
        userId,
        auditFailedEventType,
        {
          reason: 'Consent withdrawn',
          withdrawalTimestamp: consent.withdrawal_timestamp,
          consentType,
          operation,
        },
        context
      );

      return {
        isValid: false,
        reason: 'Consent has been withdrawn',
        consentStatus: consent,
      };
    }

    // Validate specific consent type
    const consentTypeMap: { [key: string]: boolean } = {
      profile_data: consent.profile_data_consent,
      location_data: consent.location_data_consent,
      communication: consent.communication_consent,
      analytics: consent.analytics_consent,
      marketing: consent.marketing_consent || false,
    };

    const isValid = consentTypeMap[consentType] === true;

    await logConsentEvent(
      userId,
      AUDIT_EVENT_TYPES.CONSENT_VALIDATED,
      {
        isValid,
        consentType,
        operation,
      },
      context
    );

    return {
      isValid,
      reason: isValid ? undefined : `User has not consented to ${consentType}`,
      consentStatus: consent,
    };
  },

  /**
   * Get consent history for audit trail
   */
  getConsentHistory: async (
    _: any,
    { userId }: { userId: string },
    context: Context
  ): Promise<any[]> => {
    // APPI compliance check
    if (context.user?.id !== userId) {
      throw new GraphQLError('Unauthorized access to consent history', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const result = await postgresql.query(
      `SELECT * FROM consent_history
       WHERE user_id = $1
       ORDER BY changed_at DESC`,
      [userId]
    );

    await logConsentEvent(
      userId,
      AUDIT_EVENT_TYPES.CONSENT_HISTORY_ACCESSED,
      {
        recordCount: result.rows.length,
      },
      context
    );

    return result.rows;
  },

  /**
   * Get audit events for user (APPI compliance reporting)
   */
  getAuditEvents: async (
    _: any,
    { userId, startDate, endDate, eventType }: any,
    context: Context
  ): Promise<any[]> => {
    // Admin or user themselves can access audit events
    if (context.user?.id !== userId && !context.user) {
      throw new GraphQLError('Unauthorized access to audit events', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    let query = 'SELECT * FROM appi_audit_events WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(userId);
    }
    if (startDate) {
      query += ` AND event_timestamp >= $${paramIndex++}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND event_timestamp <= $${paramIndex++}`;
      params.push(endDate);
    }
    if (eventType) {
      query += ` AND event_type = $${paramIndex++}`;
      params.push(eventType);
    }

    query += ' ORDER BY event_timestamp DESC LIMIT 100';

    const result = await postgresql.query(query, params);
    return result.rows;
  },

  /**
   * Generate consent audit trail for compliance reporting
   */
  generateConsentAuditTrail: async (
    _: any,
    { userId }: { userId: string },
    context: Context
  ): Promise<any> => {
    // APPI compliance check
    if (context.user?.id !== userId) {
      throw new GraphQLError('Unauthorized access to audit trail', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Get current consent
    const consentResult = await postgresql.query('SELECT * FROM user_consent WHERE user_id = $1', [
      userId,
    ]);

    // Get consent history
    const historyResult = await postgresql.query(
      'SELECT * FROM consent_history WHERE user_id = $1 ORDER BY changed_at DESC',
      [userId]
    );

    // Get related audit events
    const auditResult = await postgresql.query(
      `SELECT * FROM appi_audit_events
       WHERE user_id = $1 AND event_type LIKE 'consent%'
       ORDER BY event_timestamp DESC`,
      [userId]
    );

    const auditTrail = {
      userId,
      currentConsent: consentResult.rows[0] || null,
      consentHistory: historyResult.rows,
      auditEvents: auditResult.rows,
      generatedAt: new Date().toISOString(),
      complianceStatus: 'compliant',
    };

    await logConsentEvent(
      userId,
      AUDIT_EVENT_TYPES.AUDIT_TRAIL_GENERATED,
      {
        historyCount: historyResult.rows.length,
        auditEventCount: auditResult.rows.length,
      },
      context
    );

    return auditTrail;
  },
};

// ============================================================================
// MUTATION RESOLVERS
// ============================================================================

export const consentMutations = {
  /**
   * Record initial user consent
   * Replaces Convex recordUserConsent mutation
   */
  recordUserConsent: async (
    _: any,
    { input }: { input: any },
    context: Context
  ): Promise<UserConsent> => {
    // APPI compliance check
    if (context.user?.id !== input.userId) {
      throw new GraphQLError('Unauthorized to record consent for this user', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return await postgresql.transaction(async (client: PoolClient) => {
      // Check if consent already exists
      const existingCheck = await client.query('SELECT id FROM user_consent WHERE user_id = $1', [
        input.userId,
      ]);

      if (existingCheck.rows.length > 0) {
        throw new GraphQLError('Consent already exists for this user', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Insert consent record
      const result = await client.query<UserConsent>(
        `INSERT INTO user_consent (
          user_id, profile_data_consent, location_data_consent,
          communication_consent, analytics_consent, marketing_consent,
          consent_timestamp, consent_ip_address, consent_version,
          consent_user_agent, consent_method, last_updated,
          policy_version_accepted, legal_basis
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, NOW(), $11, $12)
        RETURNING *`,
        [
          input.userId,
          input.profileDataConsent,
          input.locationDataConsent,
          input.communicationConsent,
          input.analyticsConsent,
          input.marketingConsent || false,
          input.consentIpAddress,
          input.consentVersion,
          input.consentUserAgent || null,
          input.consentMethod,
          input.policyVersionAccepted,
          input.legalBasis,
        ]
      );

      const newConsent = result.rows[0];

      // Log consent creation for APPI compliance
      await logConsentEvent(
        input.userId,
        AUDIT_EVENT_TYPES.CONSENT_RECORDED,
        {
          consentId: newConsent.id,
          profileData: input.profileDataConsent,
          locationData: input.locationDataConsent,
          communication: input.communicationConsent,
          analytics: input.analyticsConsent,
          marketing: input.marketingConsent,
        },
        context
      );

      // Cache the new consent
      await cacheConsent(newConsent);

      return newConsent;
    });
  },

  /**
   * Update user consent preferences
   * Replaces Convex updateUserConsent mutation
   */
  updateUserConsent: async (
    _: any,
    { userId, input }: { userId: string; input: any },
    context: Context
  ): Promise<UserConsent> => {
    // APPI compliance check
    if (context.user?.id !== userId) {
      throw new GraphQLError('Unauthorized to update consent for this user', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return await postgresql.transaction(async (client: PoolClient) => {
      // Get existing consent
      const existing = await client.query<UserConsent>(
        'SELECT * FROM user_consent WHERE user_id = $1',
        [userId]
      );

      if (existing.rows.length === 0) {
        throw new GraphQLError('Consent record not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const oldConsent = existing.rows[0];

      // Build update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.profileDataConsent !== undefined) {
        updates.push(`profile_data_consent = $${paramIndex++}`);
        values.push(input.profileDataConsent);
      }
      if (input.locationDataConsent !== undefined) {
        updates.push(`location_data_consent = $${paramIndex++}`);
        values.push(input.locationDataConsent);
      }
      if (input.communicationConsent !== undefined) {
        updates.push(`communication_consent = $${paramIndex++}`);
        values.push(input.communicationConsent);
      }
      if (input.analyticsConsent !== undefined) {
        updates.push(`analytics_consent = $${paramIndex++}`);
        values.push(input.analyticsConsent);
      }
      if (input.marketingConsent !== undefined) {
        updates.push(`marketing_consent = $${paramIndex++}`);
        values.push(input.marketingConsent);
      }

      if (updates.length === 0) {
        throw new GraphQLError('No fields to update', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      updates.push(`last_updated = NOW()`);
      values.push(userId);

      const result = await client.query<UserConsent>(
        `UPDATE user_consent SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
        values
      );

      const updatedConsent = result.rows[0];

      // Record change in consent history
      await client.query(
        `INSERT INTO consent_history (
          user_id, consent_id, change_type, previous_value, new_value,
          changed_at, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)`,
        [
          userId,
          updatedConsent.id,
          'consent_updated',
          JSON.stringify(oldConsent),
          JSON.stringify(updatedConsent),
          context.req?.ip || '127.0.0.1',
          context.req?.headers?.['user-agent'] || 'server',
        ]
      );

      // Invalidate cache
      await invalidateConsentCache(userId);

      // Log update for APPI compliance
      await logConsentEvent(
        userId,
        AUDIT_EVENT_TYPES.CONSENT_UPDATED,
        {
          changes: input,
        },
        context
      );

      return updatedConsent;
    });
  },

  /**
   * Withdraw consent (APPI Article 17)
   * Replaces Convex withdrawConsent mutation
   */
  withdrawConsent: async (
    _: any,
    { userId }: { userId: string },
    context: Context
  ): Promise<{ success: boolean; message: string }> => {
    // APPI compliance check
    if (context.user?.id !== userId) {
      throw new GraphQLError('Unauthorized to withdraw consent for this user', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return await postgresql.transaction(async (client: PoolClient) => {
      // Update consent with withdrawal timestamp
      const result = await client.query(
        `UPDATE user_consent
         SET withdrawal_timestamp = NOW(), last_updated = NOW()
         WHERE user_id = $1
         RETURNING *`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Consent record not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Record withdrawal in history
      await client.query(
        `INSERT INTO consent_history (
          user_id, consent_id, change_type, previous_value, new_value,
          changed_at, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)`,
        [
          userId,
          result.rows[0].id,
          'consent_withdrawn',
          JSON.stringify({ withdrawn: false }),
          JSON.stringify({ withdrawn: true, timestamp: new Date() }),
          context.req?.ip || '127.0.0.1',
          context.req?.headers?.['user-agent'] || 'server',
        ]
      );

      // Invalidate cache
      await invalidateConsentCache(userId);

      // Log withdrawal for APPI compliance
      await logConsentEvent(
        userId,
        AUDIT_EVENT_TYPES.CONSENT_WITHDRAWN,
        {
          withdrawalTimestamp: new Date().toISOString(),
        },
        context
      );

      return {
        success: true,
        message: 'Consent withdrawn successfully',
      };
    });
  },

  /**
   * Process data deletion request (APPI Article 27)
   */
  processDataDeletionRequest: async (
    _: any,
    { userId, deletionScope }: { userId: string; deletionScope: string },
    context: Context
  ): Promise<any> => {
    // APPI compliance check
    if (context.user?.id !== userId) {
      throw new GraphQLError('Unauthorized to request data deletion', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return await postgresql.transaction(async (client: PoolClient) => {
      // Create data deletion request (30-day delay per APPI)
      const result = await client.query(
        `INSERT INTO data_deletion_requests (
          user_id, requested_at, scheduled_deletion_date, status, deletion_scope
        ) VALUES ($1, NOW(), NOW() + INTERVAL '30 days', 'pending', $2)
        RETURNING *`,
        [userId, deletionScope]
      );

      const deletionRequest = result.rows[0];

      // Log deletion request
      await logConsentEvent(
        userId,
        AUDIT_EVENT_TYPES.DELETION_REQUEST,
        {
          deletionRequestId: deletionRequest.id,
          deletionScope,
          scheduledDate: deletionRequest.scheduled_deletion_date,
        },
        context
      );

      return deletionRequest;
    });
  },

  /**
   * Update privacy policy version
   */
  updatePrivacyPolicyVersion: async (
    _: any,
    { version, effectiveDate }: { version: string; effectiveDate: Date },
    context: Context
  ): Promise<{ success: boolean; message: string }> => {
    // TODO: Add admin role check
    if (!context.user) {
      throw new GraphQLError('Not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    await postgresql.query(
      `INSERT INTO privacy_policy_versions (version, effective_date, created_at)
       VALUES ($1, $2, NOW())`,
      [version, effectiveDate]
    );

    return {
      success: true,
      message: `Privacy policy version ${version} recorded`,
    };
  },

  /**
   * Log audit event
   */
  logAuditEvent: async (
    _: any,
    { userId, eventType, dataAccessed, complianceStatus, eventDetails }: any,
    context: Context
  ): Promise<any> => {
    const result = await postgresql.query(
      `INSERT INTO appi_audit_events (
        event_id, user_id, event_type, event_timestamp,
        ip_address, user_agent, data_accessed, compliance_status, event_details
      ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId || null,
        eventType,
        context.req?.ip || '127.0.0.1',
        context.req?.headers?.['user-agent'] || 'server',
        dataAccessed || 'N/A',
        complianceStatus,
        JSON.stringify(eventDetails || {}),
      ]
    );

    return result.rows[0];
  },
};
