/**
 * APPI Compliance Audit Plugin
 * Logs all GraphQL operations for compliance monitoring
 * - Logs any GraphQL errors with operation details
 * - Warns about queries taking >1000ms
 * - Records authenticated requests with userId, IP, timestamp
 */
export const appiAuditPlugin = {
  async requestDidStart(requestContext: any) {
    const startTime = Date.now();

    return {
      async didEncounterErrors(ctx: any) {
        console.error('GraphQL Errors:', {
          operation: ctx.request.operationName,
          errors: ctx.errors,
          variables: ctx.request.variables,
        });
      },

      async willSendResponse(ctx: any) {
        const duration = Date.now() - startTime;

        // Log slow queries (> 1000ms)
        if (duration > 1000) {
          console.warn('Slow GraphQL Query:', {
            operation: ctx.request.operationName,
            duration: `${duration}ms`,
            query: ctx.request.query?.substring(0, 200),
          });
        }

        // Log for APPI compliance
        if (ctx.contextValue?.user) {
          console.log('GraphQL Request:', {
            userId: ctx.contextValue.user.id,
            operation: ctx.request.operationName,
            duration: `${duration}ms`,
            ip: ctx.contextValue.req?.ip,
            timestamp: new Date().toISOString(),
          });
        }
      },
    };
  },
};
