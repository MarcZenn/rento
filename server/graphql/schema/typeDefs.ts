/**
 * GraphQL Type Definitions for APPI-Compliant Rento Application
 * PostgreSQL-backed GraphQL API
 */
export const typeDefs = `#graphql
  # ============================================================================
  # SCALAR TYPES
  # ============================================================================
  scalar DateTime
  scalar JSON

  # ============================================================================
  # USER TYPES
  # ============================================================================
  type User {
    id: ID!
    cognitoId: String
    email: String!
    username: String!
    isVerified: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime
    profile: Profile
  }

  type UserType {
    id: ID!
    name: String!
    description: String
  }

  # ============================================================================
  # PROFILE TYPES
  # ============================================================================
  type Profile {
    id: ID!
    userId: ID!
    user: User
    phoneNumber: String
    firstName: String
    surname: String
    employmentStatus: EmploymentStatus
    userType: UserType
    isForeignResident: Boolean
    nationality: Country
    hasGuarantor: Boolean
    consecutiveYearsEmployed: Int
    rentalReadinessScore: Int
    savedProperties: [ID!]
    onboardingCompleted: Boolean
    lastActive: DateTime
    updatedAt: DateTime
    about: String
    createdAt: DateTime!
  }

  type EmploymentStatus {
    id: ID!
    name: String!
    description: String
  }

  type Country {
    id: ID!
    name: String!
    code: String!
  }

  # ============================================================================
  # CONSENT & COMPLIANCE TYPES
  # ============================================================================
  type UserConsent {
    id: ID!
    userId: ID!
    user: User
    profileDataConsent: Boolean!
    locationDataConsent: Boolean!
    communicationConsent: Boolean!
    analyticsConsent: Boolean!
    marketingConsent: Boolean
    consentTimestamp: DateTime!
    consentIpAddress: String!
    consentVersion: String!
    consentUserAgent: String
    consentMethod: String!
    withdrawalTimestamp: DateTime
    lastUpdated: DateTime!
    policyVersionAccepted: String!
    legalBasis: String!
  }

  type ConsentHistory {
    id: ID!
    userId: ID!
    consentId: ID!
    changeType: String!
    previousValue: JSON
    newValue: JSON
    changedAt: DateTime!
    ipAddress: String
    userAgent: String
  }

  type APPIAuditEvent {
    id: ID!
    eventId: String!
    userId: ID
    eventType: String!
    eventTimestamp: DateTime!
    ipAddress: String!
    userAgent: String
    dataAccessed: String
    complianceStatus: String!
    eventDetails: JSON
  }

  # ============================================================================
  # INPUT TYPES
  # ============================================================================
  input CreateUserInput {
    cognitoId: String
    email: String!
    username: String!
    isVerified: Boolean
  }

  input UpdateUserInput {
    email: String
    username: String
  }

  input CreateProfileInput {
    userId: ID!
    phoneNumber: String
    firstName: String
    surname: String
    employmentStatusId: ID
    userTypeId: ID
    isForeignResident: Boolean
    nationalityId: ID
    hasGuarantor: Boolean
    consecutiveYearsEmployed: Int
    about: String
  }

  input UpdateProfileInput {
    phoneNumber: String
    firstName: String
    surname: String
    employmentStatusId: ID
    userTypeId: ID
    isForeignResident: Boolean
    nationalityId: ID
    hasGuarantor: Boolean
    consecutiveYearsEmployed: Int
    about: String
    onboardingCompleted: Boolean
  }

  input RecordConsentInput {
    userId: ID!
    profileDataConsent: Boolean!
    locationDataConsent: Boolean!
    communicationConsent: Boolean!
    analyticsConsent: Boolean!
    marketingConsent: Boolean
    consentIpAddress: String!
    consentVersion: String!
    consentUserAgent: String
    consentMethod: String!
    policyVersionAccepted: String!
    legalBasis: String!
  }

  input UpdateConsentInput {
    profileDataConsent: Boolean
    locationDataConsent: Boolean
    communicationConsent: Boolean
    analyticsConsent: Boolean
    marketingConsent: Boolean
  }

  # ============================================================================
  # RESPONSE TYPES
  # ============================================================================
  type ConsentValidationResult {
    isValid: Boolean!
    reason: String
    consentStatus: UserConsent
  }

  type DataDeletionRequest {
    id: ID!
    userId: ID!
    requestedAt: DateTime!
    scheduledDeletionDate: DateTime!
    status: String!
    completedAt: DateTime
  }

  type MutationResponse {
    success: Boolean!
    message: String
    data: JSON
  }

  # ============================================================================
  # ADMIN COMPLIANCE TYPES
  # ============================================================================
  type ComplianceMetrics {
    totalUsers: Int!
    consentCompliant: Int!
    consentPending: Int!
    auditEventsToday: Int!
    auditEventsThisWeek: Int!
    auditEventsThisMonth: Int!
    dataResidencyStatus: String!
    dataResidencyViolations: Int!
    lastIncident: IncidentSummary
    activeIncidents: Int!
    totalIncidents: Int!
    avgResponseTime: Float
    complianceScore: Float!
  }

  type IncidentSummary {
    id: ID!
    incidentId: String!
    incidentType: String!
    severity: String!
    timestamp: DateTime!
    status: String!
    affectedUsersCount: Int!
  }

  type DataResidencyMetrics {
    totalRecords: Int!
    japanRecords: Int!
    violations: Int!
    lastCheckTimestamp: DateTime!
    storageLocations: [StorageLocation!]!
  }

  type StorageLocation {
    location: String!
    recordCount: Int!
    encryptionStatus: String!
  }

  type AuditLogSearchResult {
    events: [APPIAuditEvent!]!
    totalCount: Int!
    page: Int!
    perPage: Int!
    hasMore: Boolean!
  }

  type IncidentTrackingResult {
    incidents: [IncidentDetail!]!
    totalCount: Int!
    openCount: Int!
    criticalCount: Int!
  }

  type IncidentDetail {
    id: ID!
    incidentId: String!
    incidentType: String!
    severity: String!
    incidentTimestamp: DateTime!
    affectedUsersCount: Int!
    dataTypesAffected: [String!]
    incidentDescription: String!
    remediationActions: [String!]
    status: String!
    regulatoryNotificationSent: Boolean!
    regulatoryNotificationTimestamp: DateTime
    resolvedTimestamp: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ComplianceReport {
    reportId: String!
    generatedAt: DateTime!
    timeRange: String!
    metrics: ComplianceMetrics!
    dataResidency: DataResidencyMetrics!
    recentIncidents: [IncidentSummary!]!
    topAuditEvents: [APPIAuditEvent!]!
    complianceStatus: String!
    recommendations: [String!]
  }

  # ============================================================================
  # QUERIES
  # ============================================================================
  type Query {
    # User queries
    currentUser: User
    getUser(id: ID!): User
    getUserByCognitoId(cognitoId: String!): User
    getAllUsers: [User!]!
    getUserTypes: [UserType!]!

    # Profile queries
    getUserProfile(userId: ID!): Profile
    getProfile(id: ID!): Profile

    # Consent queries
    getUserConsent(userId: ID!): UserConsent
    validateUserConsent(userId: ID!, consentType: String!, operation: String!): ConsentValidationResult!
    getConsentHistory(userId: ID!): [ConsentHistory!]!

    # APPI Compliance queries
    getAuditEvents(userId: ID, startDate: DateTime, endDate: DateTime, eventType: String): [APPIAuditEvent!]!
    generateConsentAuditTrail(userId: ID!): JSON!

    # Admin Compliance Dashboard Queries (Admin-only)
    getComplianceMetrics(timeRange: String!): ComplianceMetrics!
    searchAuditLogs(
      startDate: DateTime!
      endDate: DateTime!
      eventType: String
      userId: ID
      complianceStatus: String
      page: Int
      perPage: Int
    ): AuditLogSearchResult!
    getDataResidencyMetrics: DataResidencyMetrics!
    getIncidentTracking(
      status: String
      severity: String
      startDate: DateTime
      endDate: DateTime
    ): IncidentTrackingResult!
    generateComplianceReport(timeRange: String!): ComplianceReport!
  }

  # ============================================================================
  # MUTATIONS
  # ============================================================================
  type Mutation {
    # User mutations
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    updateUserIsVerified(cognitoId: String!): User!
    deleteUser(id: ID!): MutationResponse!

    # Profile mutations
    createProfile(input: CreateProfileInput!): Profile!
    updateProfile(id: ID!, input: UpdateProfileInput!): Profile!

    # Consent mutations
    recordUserConsent(input: RecordConsentInput!): UserConsent!
    updateUserConsent(userId: ID!, input: UpdateConsentInput!): UserConsent!
    withdrawConsent(userId: ID!): MutationResponse!
    processDataDeletionRequest(userId: ID!, deletionScope: String!): DataDeletionRequest!
    updatePrivacyPolicyVersion(version: String!, effectiveDate: DateTime!): MutationResponse!

    # APPI Audit mutations
    logAuditEvent(
      userId: ID
      eventType: String!
      dataAccessed: String
      complianceStatus: String!
      eventDetails: JSON
    ): APPIAuditEvent!
  }
`;
