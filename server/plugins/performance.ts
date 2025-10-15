/**
 * Performance Monitoring Plugin
 * Tracks GraphQL operation performance
 */
export const performancePlugin = {
  async requestDidStart() {
    const startTime = Date.now();

    return {
      async willSendResponse() {
        const duration = Date.now() - startTime;

        // APPI compliance requires <200ms response time for critical operations
        if (duration > 200) {
          console.warn('⚠️ APPI Performance Warning: Response time exceeded 200ms:', {
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });
        }
      },
    };
  },
};
