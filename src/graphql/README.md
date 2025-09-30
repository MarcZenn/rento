# Rento GraphQL API - PostgreSQL Migration

## Overview

This is the GraphQL API. It uses a PostgreSQL + Redis architecture, maintaining full APPI (Act on the Protection of Personal Information) compliance for the Japanese market.

Access Endpoints
- **GraphQL API:** http://localhost:4000/graphql
- **Health Check:** http://localhost:4000/health

## Architecture

```
┌─────────────────┐
│  React Native   │
│   Mobile App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GraphQL API    │
│  (Apollo Server)│
│                 │
│  - JWT Auth     │
│  - APPI Audit   │
│  - Caching      │
└────┬────────┬───┘
     │        │
     ▼        ▼
┌─────────┐ ┌────────┐
│PostgreSQL│ │ Redis  │
│  (RDS)   │ │(Cache) │
└──────────┘ └────────┘
```

## Features

### ✅ Some Implemented Features

1. **User Management**
   - User CRUD operations
   - Profile management
   - User type and employment status support

2. **Consent Management (APPI Compliance)**
   - Granular consent collection
   - Consent validation before data access
   - Consent history tracking
   - Consent withdrawal support
   - Data deletion requests (30-day delay)

3. **Authentication**
   - AWS Cognito JWT verification (primary)
   - Context-based authorization

4. **Caching Layer**
   - Redis caching for frequently accessed data
   - 5-minute TTL for user/profile data
   - Automatic cache invalidation on updates

5. **APPI Compliance**
   - Audit logging for all operations
   - Data residency validation
   - Consent validation at resolver level
   - Performance monitoring (<200ms target)
   - Transaction support with rollback

6. **Error Handling**
   - GraphQL error standards
   - Transaction rollback on failures
   - Graceful degradation for audit failures
  
## Implementation Details

### 1. GraphQL Schema & Type Definitions
**File:** `src/graphql/schema/typeDefs.ts`

- ✅ Complete GraphQL schema with 20+ types
- ✅ User, Profile, and Consent types with full APPI compliance fields
- ✅ Input types for mutations
- ✅ Custom scalars (DateTime, JSON)
- ✅ Comprehensive query and mutation definitions

**Key Types:**
- User, UserType
- Profile, EmploymentStatus, Country
- UserConsent, ConsentHistory, APPIAuditEvent
- DataDeletionRequest, ConsentValidationResult

### 2. GraphQL Resolvers

#### User Resolvers (`src/graphql/resolvers/userResolvers.ts`)
- ✅ Query: `currentUser`, `getUser`, `getUserByClerkId`, `getUserByCognitoId`, `getAllUsers`
- ✅ Mutation: `createUser`, `updateUser`, `deleteUser` (with 30-day APPI delay)
- ✅ Redis caching (5-minute TTL)
- ✅ APPI audit logging for all operations
- ✅ Authorization checks (users can only access their own data)

#### Profile Resolvers (`src/graphql/resolvers/profileResolvers.ts`)
- ✅ Query: `getUserProfile`, `getProfile`
- ✅ Mutation: `createProfile`, `updateProfile`
- ✅ Redis caching (5-minute TTL)
- ✅ APPI audit logging
- ✅ Field resolvers for nested relationships (user, employmentStatus, userType, nationality)
- ✅ Authorization checks

#### Consent Resolvers (`src/graphql/resolvers/consentResolvers.ts`)
- ✅ Query: `getUserConsent`, `validateUserConsent`, `getConsentHistory`, `getAuditEvents`, `generateConsentAuditTrail`
- ✅ Mutation: `recordUserConsent`, `updateUserConsent`, `withdrawConsent`, `processDataDeletionRequest`, `updatePrivacyPolicyVersion`, `logAuditEvent`
- ✅ APPI Article 17 compliance (explicit consent validation)
- ✅ APPI Article 27 compliance (data deletion with 30-day delay)
- ✅ Consent history tracking with IP and user agent
- ✅ Redis caching (5-minute TTL for critical data)

### 3. Apollo Server Setup
**File:** `src/server/index.ts`

- ✅ Express + Apollo Server integration
- ✅ CORS configuration
- ✅ JWT authentication middleware
- ✅ Health check endpoint (`/health`)
- ✅ GraphQL endpoint (`/graphql`)
- ✅ APPI audit plugin (logs all operations)
- ✅ Performance monitoring plugin (<200ms target)
- ✅ Graceful shutdown handling
- ✅ Error handling (uncaught exceptions, unhandled rejections)

**Plugins Implemented:**
1. APPI Audit Plugin - Logs all GraphQL operations with user context
2. Performance Plugin - Warns when response time exceeds 200ms (APPI requirement)

### 4. Authentication Middleware
**File:** `src/graphql/middleware/auth.ts`

- ✅ JWT token verification (AWS Cognito + Clerk legacy support)
- ✅ Context creation for resolvers
- ✅ Authorization helper functions:
  - `requireRole(context, role)`
  - `requireAdmin(context)`
  - `requireSelfOrAdmin(context, userId)`
- ✅ Token expiration checking
- ✅ Authentication event logging

### 5. Database Integration

**Leverages Existing Connection Layer:** `src/lib/database/connection.ts`
- ✅ PostgreSQL connection pooling (20 connections dev, 50 production)
- ✅ Redis caching layer
- ✅ Transaction support with automatic rollback
- ✅ APPI audit logging at connection level
- ✅ Health check functions
- ✅ Graceful connection closure

## Getting Started

### Prerequisites

1. **Database Setup**
   ```bash
   # Start local PostgreSQL + Redis
   yarn run db:up

   # Run migrations 
   npm run db:migrate

   # Initialize APPI compliance tables
   npm run db:init-appi
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.local .env

   # Edit .env with your configuration
   # See .env.local for all required variables
   ```

### Starting the GraphQL Server

```bash
# Development mode (with auto-restart)
npm run graphql:dev

# Production mode
npm run graphql:start
```

The server will be available at:
- GraphQL endpoint: http://localhost:4000/graphql
- Health check: http://localhost:4000/health

## API Examples

### Authentication

All requests (except health check) require a JWT token:

```typescript
// Request headers
{
  "Authorization": "Bearer <jwt_token>"
}
```

## APPI Compliance Features

### Audit Logging

All operations are automatically logged to `appi_audit_events`:

```typescript
{
  event_id: "evt_1234567890_abc123",
  user_id: "user_uuid",
  event_type: "user_data_access",
  event_timestamp: "2025-09-30T12:00:00Z",
  ip_address: "192.168.1.1",
  user_agent: "Mozilla/5.0...",
  data_accessed: "getUserProfile",
  compliance_status: "compliant",
  event_details: { operation: "getUserProfile", timestamp: "..." }
}
```

### Consent Validation

Before accessing user data, consent must be validated:

```typescript
// Automatic validation in resolvers
const validation = await validateUserConsent(
  userId,
  'profile_data',
  'read'
);

if (!validation.isValid) {
  throw new GraphQLError('User has not consented to this operation');
}
```

### Data Deletion Requests

APPI requires a 30-day window for data deletion:

```typescript
// Creates scheduled deletion request
const deletion = await processDataDeletionRequest(
  userId,
  'full_account'
);

// Returns:
{
  id: "deletion_uuid",
  userId: "user_uuid",
  requestedAt: "2025-09-30T12:00:00Z",
  scheduledDeletionDate: "2025-10-30T12:00:00Z",
  status: "pending"
}
```

## Performance Optimization

### Caching Strategy

1. **User Data**: 5-minute TTL
2. **Profile Data**: 5-minute TTL
3. **Consent Data**: 5-minute TTL (critical, frequent refresh)
4. **Static Data** (user types, countries): 1-hour TTL

**Cache Keys:**
- `user:{userId}` - User objects
- `profile:{userId}` - Profile objects
- `consent:{userId}` - Consent objects

### Query Performance Targets

- User queries: <100ms
- Consent validation: <100ms
- Audit logging: <200ms (critical path)
- Complex queries: <500ms

### Connection Pooling

- PostgreSQL: 20 connections (development), 50 (production)
- Redis: 10 connections
- Automatic reconnection on failure

## Error Handling

### GraphQL Error Codes

- `UNAUTHENTICATED`: No valid JWT token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `BAD_USER_INPUT`: Invalid input data

### Transaction Rollback

All mutations use transactions with automatic rollback on errors:

```typescript
await postgresql.transaction(async (client) => {
  // Multiple operations
  // If any fails, all are rolled back
});
```

## Monitoring & Health Checks

### Health Check Endpoint

```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T12:00:00Z",
  "services": {
    "postgresql": {
      "healthy": true,
      "latency": "5ms"
    },
    "redis": {
      "healthy": true,
      "latency": "2ms"
    }
  }
}
```

### Performance Monitoring

The server automatically logs:
- Slow queries (>1000ms)
- APPI compliance warnings (>200ms)
- Authentication events
- All database operations

## Production Deployment

### Pre-deployment Checklist

- [ ] Update all environment variables in `.env`
- [ ] Configure AWS Cognito User Pool (Tokyo region)
- [ ] Set up RDS PostgreSQL (Tokyo region)
- [ ] Set up ElastiCache Redis (Tokyo region)
- [ ] Generate and store encryption keys securely
- [ ] Configure SSL certificates
- [ ] Set up monitoring and alerting
- [ ] Test APPI compliance workflows
- [ ] Verify data residency (Japan only)
- [ ] Run security audit
- [ ] Load test with 1000+ concurrent users

### Deployment Commands

```bash
# Deploy to production
NODE_ENV=production npm run graphql:start

# With PM2 (recommended)
pm2 start src/server/index.ts --name rento-graphql --interpreter tsx
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if PostgreSQL/Redis are running: `npm run db:up`
   - Verify environment variables in `.env`

2. **Authentication Errors**
   - Verify JWT token is valid
   - Check Cognito configuration
   - Ensure token hasn't expired

3. **Slow Queries**
   - Check database indices
   - Review query complexity
   - Monitor connection pool usage

4. **Cache Issues**
   - Verify Redis is running
   - Check cache TTL configuration
   - Clear cache if needed: `redis-cli FLUSHDB`

## Future Enhancements

- [ ] Add real-time subscriptions for notifications
- [ ] Implement rate limiting per user
- [ ] Add DataLoader for batch query optimization
- [ ] Implement pagination for large result sets
- [ ] Add GraphQL schema validation middleware
- [ ] Integrate with AWS X-Ray for distributed tracing
- [ ] Add GraphQL query complexity analysis
- [ ] Implement field-level authorization
- [ ] Add automated API documentation generation

## Support

For questions or issues:
1. Check the troubleshooting section
2. Review logs: `npm run db:logs`
3. Test database connection: `npm run db:test`
4. Check health endpoint: `curl http://localhost:4000/health`

## License

Private - Rento Application
