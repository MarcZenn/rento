/**
// ============================================================================
// DEV NOTES
// ============================================================================
 * GraphQL Server - Apollo Server with Express
 *
 * This is our entry point for our Apollo + GraphQL server
 * It runs an Apollo Server integrated with Express.js providing
 * a GraphQL endpoint for the application.
 * 
 * Also serves as the Orchestration Layer for our API that wires together:
 * - GraphQL Schema (typeDefs)
 * - Business Logic (resolvers)
 * - Authentication (createAuthContext)
 * - Databases (PostgresSQL, Redis)
 * - Monitoring (plugins)
 * - Infra (Express, health checks)
 * 
 * Why This File Is Needed
 * 1. Entry Point: Bootstraps your entire GraphQL API infrastructure
 * 2. Compliance: Implements APPI logging, performance monitoring, and audit trails
 * 3. Production Readiness: Health checks, graceful shutdown, error handling
 * 4. Security: Authentication context, CORS configuration, environment-based introspection
 * 5. Observability: Logs slow queries, errors, and user operations
 * 6. Database Management: Initializes and manages PostgreSQL + Redis connections
 *
 * 
 * Server Init Flow
 * 
 * 1. DB connection
 * - Establishes connection to Postgres & Redis
 * - Tests connection health and measures latency
 * - Exits with error code 1 if databases unreachable (production safety)
 *
 * 2. Express App Setup
 * - Health check endpoint
 *    - Essential for production deployment (AWS health checks, Kubernetes, probes, etc)
 *
 * 3. Apollo Server Creation
 *  - Introspection: enables GraphQL Playground in Dev
 *  - Stach traces: Full error details in dev, sanitized in prod
 *  - Plugins: APPI compliance and performance monitoring
 *
 * 4. Middleware Configuration
 *  - Applies to the /graphql endpoint 
 *  - Auth Context: 
 *      - createAuthContext injects authenticated 
 *        user info into GraphQL resolvers.
 *      - Auth context makes user identity available to all
 *        resolvers for authorization.
 * 
 * 5. Graceful Shutdown Handling
 *  - Need to prevent data corruption, ensures in-flight requests
 *    complete. close DB connections properly
 *  - Signal Handlers
 *    - SIGTERM/SIGINT: Normal shutdown (Ctrl+C, Docker/K8s termination)
 *    - Uncaught Exception: Unexpected errors
 *    - Unhandled Rejection: Unhandled Promise rejections
 *
 *
 *
 */

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import bodyParser from 'body-parser';
import { typeDefs } from './graphql/schema/typeDefs';
import { resolvers } from './graphql/resolvers';
import { createAuthContext } from './graphql/middleware/auth';
import { initializeConnections, testConnections } from './database/connection';
import { appiAuditPlugin } from './plugins/appiAudit';
import { performancePlugin } from './plugins/performance';
import 'dotenv/config';

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

const PORT = process.env.GRAPHQL_PORT || 4000;
const HOST = process.env.GRAPHQL_HOST || '0.0.0.0';

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

async function startServer() {
  console.log('🚀 Starting Rento GraphQL Server...');

  // Initialize database connections
  console.log('📦 Initializing database connections...');
  try {
    await initializeConnections();
    const health = await testConnections();
    console.log('✅ Database connections established:');
    console.log(`   PostgreSQL: ${health.postgresql.latency}ms`);
    console.log(`   Redis: ${health.redis.latency}ms`);
  } catch (error) {
    console.error('❌ Failed to connect to databases:', error);
    process.exit(1);
  }

  // Create Express app
  const app = express();

  // Health check endpoint
  // - Used by load balancers/monitoring tools to verify server health
  // - Returns JSON status of PostgreSQL and Redis
  // - Returns 503 status if services are unhealthy
  app.get('/health', async (req, res) => {
    try {
      const health = await testConnections();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          postgresql: {
            healthy: health.postgresql.healthy,
            latency: `${health.postgresql.latency}ms`,
          },
          redis: {
            healthy: health.redis.healthy,
            latency: `${health.redis.latency}ms`,
          },
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [appiAuditPlugin, performancePlugin],
    introspection: process.env.NODE_ENV !== 'production', // Enable GraphQL Playground in dev
    includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  });

  // Start Apollo Server
  await server.start();
  console.log('✅ Apollo Server started');

  // Apply Middleware
  // - CORS: Allows cross-origin requests
  // - configurable via CORS_ORIGIN env var
  // - Enables front-end apps on different domains to access to access the API
  // - Body Parser: Parses JSON payloads up to 10mb
  // - Apollo Middleware: Integrates Apollo server w/ Express
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    }),
    bodyParser.json({ limit: '10mb' }),
    expressMiddleware(server, {
      context: createAuthContext,
    })
  );

  // Start Express server
  const httpServer = app.listen(PORT, () => {
    console.log('✅ Server ready!');
    console.log(`🚀 GraphQL endpoint: http://${HOST}:${PORT}/graphql`);
    console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
    console.log('');
    console.log('📊 APPI Compliance Features Enabled:');
    console.log('   ✓ Audit logging for all operations');
    console.log('   ✓ Response time monitoring (<200ms target)');
    console.log('   ✓ Data residency controls');
    console.log('   ✓ Redis caching layer');
    console.log('');
  });

  // Graceful shutdown
  // - Shutdown Process
  //    1. Stop accepting new connections
  //    2. Close HTTP server
  //    3. Close database connections (PG, Redis)
  //    4. Force exit after 10-second timeout (prevents hanging)
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received, starting graceful shutdown...`);

    // Stop accepting new connections
    httpServer.close(async () => {
      console.log('✅ HTTP server closed');

      // Close database connections
      try {
        const { closeAllConnections } = await import('./database/connection.js');
        await closeAllConnections();
        console.log('✅ Database connections closed');
      } catch (error) {
        console.error('Error closing database connections:', error);
      }

      console.log('👋 Server shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', error => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  });
}

// ============================================================================
// START SERVER
// ============================================================================

if (require.main === module) {
  startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

export { startServer };
