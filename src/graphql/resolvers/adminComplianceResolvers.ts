/**
 * Admin Compliance Dashboard Resolvers - PostgreSQL Implementation
 * Backend-only admin endpoints for APPI compliance monitoring
 *
 *
 * This file provides admin-only backend endpoints for monitoring APPI
 * compliance across the entire platform. Akin to a "control panel" for
 * compliance admins.
 *
 *  Example of how Frontend Will Use This:
  const { data } = useQuery(GET_COMPLIANCE_METRICS, {
    variables: { timeRange: "7d" }
  });
 *
 *
 */
import { GraphQLError } from 'graphql';
import { postgresql } from '@/src/lib/database/connection';
import { requireAdmin } from '@/src/graphql/middleware/auth';

// ============================================================================
// TYPES
// ============================================================================

// Every GraphQL resolver receives this context object. It contains the
// authenticated user (from JWT token) and the HTTP request/response.
// role is checked to verify admin access.
interface Context {
  user?: {
    id: string;
    cognitoId?: string;
    clerkId?: string;
    roles?: string[]; // this is key -> determines admin access
  };
  req: any;
  res: any;
}

interface ComplianceMetrics {
  totalUsers: number;
  consentCompliant: number;
  consentPending: number;
  auditEventsToday: number;
  auditEventsThisWeek: number;
  auditEventsThisMonth: number;
  dataResidencyStatus: string;
  dataResidencyViolations: number;
  lastIncident: any | null;
  activeIncidents: number;
  totalIncidents: number;
  avgResponseTime: number | null;
  complianceScore: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate compliance score based on metrics
 *
 * provides a single metric that summarizes overall compliance
 * health.
 * 
 *  Weights:
  - Consent compliance: 40% (most important - APPI requirement)
  - Data residency: 30% (critical legal requirement)
  - Active incidents: 30% (security/operational health)
 */
function calculateComplianceScore(metrics: {
  totalUsers: number;
  consentCompliant: number;
  dataResidencyViolations: number;
  activeIncidents: number;
}): number {
  // Start with 100% score
  let score = 100;

  // Deduct for consent non-compliance (up to 40 points)
  if (metrics.totalUsers > 0) {
    const consentRate = (metrics.consentCompliant / metrics.totalUsers) * 100;
    score -= (100 - consentRate) * 0.4;
  }

  // Deduct for data residency violations (10 points per violation)
  score -= Math.min(metrics.dataResidencyViolations * 10, 30);

  // Deduct for active incidents (5 points per active incident)
  score -= Math.min(metrics.activeIncidents * 5, 30);

  return Math.max(0, Math.round(score * 100) / 100);
}

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const adminComplianceQueries = {
  /**
   * Get compliance metrics for dashboard overview
   * Admin-only endpoint
   *
   * generates dashboard overview w/ 13 key metrics in a single API
   * call
   * 
   * Why these metrics:
      - totalUsers/consentCompliant: APPI Article 17 compliance rate
      - auditEvents: System usage and data access transparency
      - dataResidency: APPI Article 24 geographic compliance
      - incidents: Security posture and incident response effectiveness
      - complianceScore: Executive summary metric
   */
  getComplianceMetrics: async (
    _: any,
    { timeRange: _timeRange }: { timeRange: string },
    context: Context
  ): Promise<ComplianceMetrics> => {
    // Require admin role
    requireAdmin(context);

    try {
      // Get total users count
      const usersResult = await postgresql.query<{ count: string }>(
        'SELECT COUNT(*) as count FROM users'
      );
      const totalUsers = parseInt(usersResult.rows[0]?.count || '0', 10);

      // Get consent compliant users (users with valid consent)
      const consentResult = await postgresql.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM user_consent
        WHERE withdrawal_timestamp IS NULL
          AND profile_data_consent = true
          AND location_data_consent = true
          AND communication_consent = true
      `);
      const consentCompliant = parseInt(consentResult.rows[0]?.count || '0', 10);
      const consentPending = totalUsers - consentCompliant;

      // Get audit events counts
      const auditTodayResult = await postgresql.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM appi_audit_events
        WHERE event_timestamp >= NOW() - INTERVAL '24 hours'
      `);
      const auditEventsToday = parseInt(auditTodayResult.rows[0]?.count || '0', 10);

      const auditWeekResult = await postgresql.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM appi_audit_events
        WHERE event_timestamp >= NOW() - INTERVAL '7 days'
      `);
      const auditEventsThisWeek = parseInt(auditWeekResult.rows[0]?.count || '0', 10);

      const auditMonthResult = await postgresql.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM appi_audit_events
        WHERE event_timestamp >= NOW() - INTERVAL '30 days'
      `);
      const auditEventsThisMonth = parseInt(auditMonthResult.rows[0]?.count || '0', 10);

      // Get data residency violations
      const residencyResult = await postgresql.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM appi_data_residency_log
        WHERE geographic_location != 'Japan-Tokyo'
      `);
      const dataResidencyViolations = parseInt(residencyResult.rows[0]?.count || '0', 10);
      const dataResidencyStatus =
        dataResidencyViolations === 0 ? 'compliant' : 'violations_detected';

      // Get incident metrics
      const activeIncidentsResult = await postgresql.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM appi_incident_tracking
        WHERE status IN ('open', 'investigating')
      `);
      const activeIncidents = parseInt(activeIncidentsResult.rows[0]?.count || '0', 10);

      const totalIncidentsResult = await postgresql.query<{ count: string }>(
        'SELECT COUNT(*) as count FROM appi_incident_tracking'
      );
      const totalIncidents = parseInt(totalIncidentsResult.rows[0]?.count || '0', 10);

      // Get last incident
      const lastIncidentResult = await postgresql.query(`
        SELECT
          id, incident_id, incident_type, severity,
          incident_timestamp as timestamp, status, affected_users_count
        FROM appi_incident_tracking
        ORDER BY incident_timestamp DESC
        LIMIT 1
      `);
      const lastIncident = lastIncidentResult.rows[0] || null;

      // Calculate average response time (time to resolve incidents)
      const avgResponseResult = await postgresql.query<{ avg_minutes: string }>(`
        SELECT
          AVG(EXTRACT(EPOCH FROM (resolved_timestamp - incident_timestamp)) / 60) as avg_minutes
        FROM appi_incident_tracking
        WHERE resolved_timestamp IS NOT NULL
          AND incident_timestamp >= NOW() - INTERVAL '30 days'
      `);
      const avgResponseTime = avgResponseResult.rows[0]?.avg_minutes
        ? parseFloat(avgResponseResult.rows[0].avg_minutes)
        : null;

      // Calculate compliance score
      const complianceScore = calculateComplianceScore({
        totalUsers,
        consentCompliant,
        dataResidencyViolations,
        activeIncidents,
      });

      return {
        totalUsers,
        consentCompliant,
        consentPending,
        auditEventsToday,
        auditEventsThisWeek,
        auditEventsThisMonth,
        dataResidencyStatus,
        dataResidencyViolations,
        lastIncident,
        activeIncidents,
        totalIncidents,
        avgResponseTime,
        complianceScore,
      };
    } catch (error) {
      console.error('Error fetching compliance metrics:', error);
      throw new GraphQLError('Failed to fetch compliance metrics', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  },

  /**
   * Search audit logs with filtering and pagination
   * Admin-only endpoint
   *
   * advanced search interface for the appi_audint_events table
   * w/ filtering and pagination.
   */
  searchAuditLogs: async (
    _: any,
    {
      startDate,
      endDate,
      eventType,
      userId,
      complianceStatus,
      page = 1,
      perPage = 50,
    }: {
      startDate: Date;
      endDate: Date;
      eventType?: string;
      userId?: string;
      complianceStatus?: string;
      page?: number;
      perPage?: number;
    },
    context: Context
  ): Promise<any> => {
    // Require admin role
    requireAdmin(context);

    try {
      // Build dynamic query
      let query = `
        SELECT
          id, event_id, user_id, event_type, event_timestamp,
          ip_address, user_agent, data_accessed, compliance_status, event_details
        FROM appi_audit_events
        WHERE event_timestamp >= $1 AND event_timestamp <= $2
      `;
      const params: any[] = [startDate, endDate];
      let paramIndex = 3;

      if (eventType) {
        query += ` AND event_type = $${paramIndex++}`;
        params.push(eventType);
      }

      if (userId) {
        query += ` AND user_id = $${paramIndex++}`;
        params.push(userId);
      }

      if (complianceStatus) {
        query += ` AND compliance_status = $${paramIndex++}`;
        params.push(complianceStatus);
      }

      // Get total count
      const countQuery = query.replace(
        'SELECT id, event_id, user_id, event_type, event_timestamp, ip_address, user_agent, data_accessed, compliance_status, event_details',
        'SELECT COUNT(*) as count'
      );
      const countResult = await postgresql.query<{ count: string }>(countQuery, params);
      const totalCount = parseInt(countResult.rows[0]?.count || '0', 10);

      // Add pagination
      const offset = (page - 1) * perPage;
      query += ` ORDER BY event_timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
      params.push(perPage, offset);

      // Execute query
      const result = await postgresql.query(query, params);

      return {
        events: result.rows,
        totalCount,
        page,
        perPage,
        hasMore: offset + result.rows.length < totalCount,
      };
    } catch (error) {
      console.error('Error searching audit logs:', error);
      throw new GraphQLError('Failed to search audit logs', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  },

  /**
   * Get data residency metrics
   * Admin-only endpoint
   *
   * Monitors where data is physically stored to ensure
   * APPI Article 24 compliance.
   */
  getDataResidencyMetrics: async (_: any, __: any, context: Context): Promise<any> => {
    // Require admin role
    requireAdmin(context);

    try {
      // Get total records
      const totalResult = await postgresql.query<{ count: string }>(
        'SELECT COUNT(*) as count FROM appi_data_residency_log'
      );
      const totalRecords = parseInt(totalResult.rows[0]?.count || '0', 10);

      // Get Japan records
      const japanResult = await postgresql.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM appi_data_residency_log
        WHERE geographic_location = 'Japan-Tokyo'
      `);
      const japanRecords = parseInt(japanResult.rows[0]?.count || '0', 10);

      // Get violations
      const violationsResult = await postgresql.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM appi_data_residency_log
        WHERE geographic_location != 'Japan-Tokyo'
      `);
      const violations = parseInt(violationsResult.rows[0]?.count || '0', 10);

      // Get last check timestamp
      const lastCheckResult = await postgresql.query<{ max_timestamp: Date }>(`
        SELECT MAX(compliance_check_timestamp) as max_timestamp
        FROM appi_data_residency_log
      `);
      const lastCheckTimestamp = lastCheckResult.rows[0]?.max_timestamp || new Date();

      // Get storage locations breakdown
      const locationsResult = await postgresql.query<{
        location: string;
        count: string;
        encryption: string;
      }>(`
        SELECT
          geographic_location as location,
          COUNT(*) as count,
          encryption_status as encryption
        FROM appi_data_residency_log
        GROUP BY geographic_location, encryption_status
      `);

      const storageLocations = locationsResult.rows.map(row => ({
        location: row.location,
        recordCount: parseInt(row.count, 10),
        encryptionStatus: row.encryption,
      }));

      return {
        totalRecords,
        japanRecords,
        violations,
        lastCheckTimestamp,
        storageLocations,
      };
    } catch (error) {
      console.error('Error fetching data residency metrics:', error);
      throw new GraphQLError('Failed to fetch data residency metrics', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  },

  /**
   * Get incident tracking data
   * Admin-only endpoint
   */
  getIncidentTracking: async (
    _: any,
    {
      status,
      severity,
      startDate,
      endDate,
    }: {
      status?: string;
      severity?: string;
      startDate?: Date;
      endDate?: Date;
    },
    context: Context
  ): Promise<any> => {
    // Require admin role
    requireAdmin(context);

    try {
      // Build dynamic query
      let query = `
        SELECT
          id, incident_id, incident_type, severity, incident_timestamp,
          affected_users_count, data_types_affected, incident_description,
          remediation_actions, status, regulatory_notification_sent,
          regulatory_notification_timestamp, resolved_timestamp,
          created_at, updated_at
        FROM appi_incident_tracking
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(status);
      }

      if (severity) {
        query += ` AND severity = $${paramIndex++}`;
        params.push(severity);
      }

      if (startDate) {
        query += ` AND incident_timestamp >= $${paramIndex++}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND incident_timestamp <= $${paramIndex++}`;
        params.push(endDate);
      }

      query += ' ORDER BY incident_timestamp DESC';

      // Execute query
      const result = await postgresql.query(query, params);

      // Get counts
      const openCount = result.rows.filter(
        (inc: any) => inc.status === 'open' || inc.status === 'investigating'
      ).length;
      const criticalCount = result.rows.filter((inc: any) => inc.severity === 'critical').length;

      return {
        incidents: result.rows,
        totalCount: result.rows.length,
        openCount,
        criticalCount,
      };
    } catch (error) {
      console.error('Error fetching incident tracking data:', error);
      throw new GraphQLError('Failed to fetch incident tracking data', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  },

  /**
   * Generate comprehensive compliance report
   * Admin-only endpoint
   *
   * Generates a comprehensive compliance report by combining data from
   * other queries
   */
  generateComplianceReport: async (
    _: any,
    { timeRange }: { timeRange: string },
    context: Context
  ): Promise<any> => {
    // Require admin role
    requireAdmin(context);

    try {
      // Get all metrics
      const metrics = await adminComplianceQueries.getComplianceMetrics(_, { timeRange }, context);
      const dataResidency = await adminComplianceQueries.getDataResidencyMetrics(_, {}, context);

      // Get recent incidents
      const incidentData = await adminComplianceQueries.getIncidentTracking(
        _,
        { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        context
      );
      const recentIncidents = incidentData.incidents.slice(0, 5).map((inc: any) => ({
        id: inc.id,
        incidentId: inc.incident_id,
        incidentType: inc.incident_type,
        severity: inc.severity,
        timestamp: inc.incident_timestamp,
        status: inc.status,
        affectedUsersCount: inc.affected_users_count,
      }));

      // Get top audit events
      const auditLogs = await adminComplianceQueries.searchAuditLogs(
        _,
        {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          page: 1,
          perPage: 10,
        },
        context
      );
      const topAuditEvents = auditLogs.events;

      // Generate recommendations
      const recommendations: string[] = [];
      if (metrics.consentPending > 0) {
        recommendations.push(
          `${metrics.consentPending} users pending consent - implement consent collection flow`
        );
      }
      if (metrics.dataResidencyViolations > 0) {
        recommendations.push(
          `${metrics.dataResidencyViolations} data residency violations detected - review data storage locations`
        );
      }
      if (metrics.activeIncidents > 0) {
        recommendations.push(
          `${metrics.activeIncidents} active incidents require attention - prioritize resolution`
        );
      }
      if (metrics.complianceScore < 90) {
        recommendations.push(
          `Compliance score is ${metrics.complianceScore}% - aim for 95%+ for optimal compliance`
        );
      }

      // Determine compliance status
      let complianceStatus = 'compliant';
      if (metrics.complianceScore < 70) {
        complianceStatus = 'critical';
      } else if (metrics.complianceScore < 85) {
        complianceStatus = 'warning';
      }

      return {
        reportId: `report_${Date.now()}`,
        generatedAt: new Date(),
        timeRange,
        metrics,
        dataResidency,
        recentIncidents,
        topAuditEvents,
        complianceStatus,
        recommendations,
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw new GraphQLError('Failed to generate compliance report', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  },
};
