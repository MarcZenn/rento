/**
 * APPI Audit Event Types Registry
 *
 * This module provides type-safe access to audit event types and utilities
 * for adding new event types to the database.
 *
 * WHY THIS EXISTS:
 * - Provides TypeScript autocomplete for event types
 * - Prevents typos when logging audit events
 * - Centralized reference for all event types
 * - Easy way to add new event types programmatically
 */

import { postgresql } from './connection';

// ============================================================================
// EVENT TYPE CONSTANTS (TypeScript autocomplete support)
// ============================================================================

/**
 * All valid APPI audit event types
 * These match the event types in the appi_audit_event_types table
 */
export const AUDIT_EVENT_TYPES = {
  // Consent Management
  CONSENT_READ: 'consent_read',
  CONSENT_VALIDATION_FAILED: 'consent_validation_failed',
  CONSENT_VALIDATED: 'consent_validated',
  CONSENT_HISTORY_ACCESSED: 'consent_history_accessed',
  CONSENT_RECORDED: 'consent_recorded',
  CONSENT_UPDATED: 'consent_updated',
  CONSENT_WITHDRAWN: 'consent_withdrawn',
  CONSENT_CHANGE: 'consent_change',

  // User Management
  USER_DATA_ACCESS: 'user_data_access',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',

  // Profile Management
  PROFILE_DATA_ACCESS: 'profile_data_access',
  PROFILE_CREATED: 'profile_created',
  PROFILE_UPDATED: 'profile_updated',

  // Deletion Management
  DELETION_REQUEST: 'deletion_request',
  DELETION_PROCESSING: 'deletion_processing',
  DELETION_COMPLETED: 'deletion_completed',
  DELETION_CANCELLED: 'deletion_cancelled',

  // Data Access
  DATA_ACCESS: 'data_access',
  DATA_EXPORT: 'data_export',

  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',

  // Compliance
  AUDIT_TRAIL_GENERATED: 'audit_trail_generated',
  PRIVACY_POLICY_UPDATED: 'privacy_policy_updated',
  COMPLIANCE_REPORT_GENERATED: 'compliance_report_generated',
} as const;

/**
 * Event type categories for grouping
 */
export const EVENT_CATEGORIES = {
  DATA_ACCESS: 'data_access',
  CONSENT_MANAGEMENT: 'consent_management',
  USER_MANAGEMENT: 'user_management',
  PROFILE_MANAGEMENT: 'profile_management',
  DELETION_MANAGEMENT: 'deletion_management',
  AUTHENTICATION: 'authentication',
  COMPLIANCE: 'compliance',
  SYSTEM: 'system',
} as const;

// TypeScript types
export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[keyof typeof AUDIT_EVENT_TYPES];
export type EventCategory = (typeof EVENT_CATEGORIES)[keyof typeof EVENT_CATEGORIES];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Add a new audit event type to the database
 *
 * @example
 * await addAuditEventType({
 *   eventType: 'password_reset',
 *   category: 'authentication',
 *   description: 'User password reset requested'
 * });
 */
export async function addAuditEventType(params: {
  eventType: string;
  category: EventCategory;
  description: string;
}): Promise<void> {
  try {
    await postgresql.query(
      `INSERT INTO appi_audit_event_types (event_type, category, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_type) DO NOTHING`,
      [params.eventType, params.category, params.description]
    );
    console.log(`✅ Added audit event type: ${params.eventType}`);
  } catch (error) {
    console.error(`❌ Failed to add audit event type ${params.eventType}:`, error);
    throw error;
  }
}

/**
 * Get all active audit event types from database
 */
export async function getActiveEventTypes(): Promise<
  Array<{
    id: string;
    event_type: string;
    category: string;
    description: string;
  }>
> {
  const result = await postgresql.query(
    `SELECT id, event_type, category, description
     FROM appi_audit_event_types
     WHERE is_active = true
     ORDER BY category, event_type`
  );
  return result.rows;
}

/**
 * Get all event types grouped by category
 */
export async function getEventTypesByCategory(): Promise<
  Record<
    string,
    Array<{
      event_type: string;
      description: string;
    }>
  >
> {
  const result = await postgresql.query(
    `SELECT category, event_type, description
     FROM appi_audit_event_types
     WHERE is_active = true
     ORDER BY category, event_type`
  );

  const grouped: Record<string, Array<{ event_type: string; description: string }>> = {};

  for (const row of result.rows) {
    if (!grouped[row.category]) {
      grouped[row.category] = [];
    }
    grouped[row.category].push({
      event_type: row.event_type,
      description: row.description,
    });
  }

  return grouped;
}

/**
 * Deactivate an event type (soft delete)
 * This doesn't delete historical audit events, just prevents new ones
 */
export async function deactivateEventType(eventType: string): Promise<void> {
  await postgresql.query(
    `UPDATE appi_audit_event_types
     SET is_active = false, updated_at = NOW()
     WHERE event_type = $1`,
    [eventType]
  );
  console.log(`⏸️  Deactivated audit event type: ${eventType}`);
}

/**
 * Validate that an event type exists and is active
 * Useful for runtime validation
 */
export async function validateEventType(eventType: string): Promise<boolean> {
  const result = await postgresql.query(
    `SELECT id FROM appi_audit_event_types
     WHERE event_type = $1 AND is_active = true`,
    [eventType]
  );
  return result.rows.length > 0;
}
