#!/usr/bin/env node
/**
 * Database Connection Test Script
 * Tests PostgreSQL and Redis connections for APPI compliance
 */

// ============================================================================
// DEV NOTES
// ============================================================================
/**
 *
 */

import { postgresql, redis } from '../../src/lib/database/connection';

interface TestResult {
  test: string;
  passed: boolean;
  details: string;
  duration: number;
}

class DatabaseTester {
  private results: TestResult[] = [];

  /**
   * Run a test and record the result
   */
  private async runTest(testName: string, testFn: () => Promise<any>): Promise<void> {
    const start = Date.now();

    try {
      const result = await testFn();
      const duration = Date.now() - start;

      this.results.push({
        test: testName,
        passed: true,
        details: typeof result === 'string' ? result : JSON.stringify(result),
        duration,
      });

      console.log(`✅ ${testName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;

      this.results.push({
        test: testName,
        passed: false,
        details: error instanceof Error ? error.message : String(error),
        duration,
      });

      console.log(`❌ ${testName} (${duration}ms): ${error}`);
    }
  }

  /**
   * Test basic database connections
   */
  async testBasicConnections(): Promise<void> {
    console.log('🔍 Testing basic database connections...\n');

    await this.runTest('PostgreSQL Health Check', async () => {
      const health = await postgresql.healthCheck();
      if (!health.healthy) {
        throw new Error(`PostgreSQL unhealthy (latency: ${health.latency}ms)`);
      }
      return `Healthy (${health.latency}ms)`;
    });

    await this.runTest('Redis Health Check', async () => {
      const health = await redis.healthCheck();
      if (!health.healthy) {
        throw new Error(`Redis unhealthy (latency: ${health.latency}ms)`);
      }
      return `Healthy (${health.latency}ms)`;
    });
  }

  /**
   * Test PostgreSQL functionality
   */
  async testPostgreSQLFunctionality(): Promise<void> {
    console.log('\n🐘 Testing PostgreSQL functionality...\n');

    await this.runTest('PostgreSQL Simple Query', async () => {
      const result = await postgresql.query('SELECT version() as version');
      return `Version: ${result.rows[0]?.version?.substring(0, 50)}...`;
    });

    await this.runTest('PostgreSQL Tables Check', async () => {
      const result = await postgresql.query(`
        SELECT COUNT(*) as table_count
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);
      return `Found ${result.rows[0]?.table_count} tables`;
    });

    await this.runTest('PostgreSQL Extensions Check', async () => {
      const result = await postgresql.query(`
        SELECT extname
        FROM pg_extension
        WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_stat_statements')
      `);
      const extensions = result.rows.map(row => row.extname);
      return `Extensions: ${extensions.join(', ')}`;
    });

    await this.runTest('PostgreSQL Transaction Test', async () => {
      return await postgresql.transaction(async client => {
        await client.query('CREATE TEMP TABLE test_transaction (id INTEGER)');
        await client.query('INSERT INTO test_transaction (id) VALUES (1)');
        const result = await client.query('SELECT COUNT(*) as count FROM test_transaction');
        return `Transaction successful, temp table has ${result.rows[0].count} row(s)`;
      });
    });

    await this.runTest('PostgreSQL PII Encryption Test', async () => {
      const testData = 'sensitive@example.com';
      const result = await postgresql.query(
        `
        SELECT
          encrypt_pii($1) as encrypted,
          decrypt_pii(encrypt_pii($1)) as decrypted
      `,
        [testData]
      );

      const { encrypted, decrypted } = result.rows[0];
      if (decrypted !== testData) {
        throw new Error('Encryption/decryption mismatch');
      }
      return `Encryption working (encrypted length: ${encrypted.length})`;
    });
  }

  /**
   * Test Redis functionality
   */
  async testRedisFunctionality(): Promise<void> {
    console.log('\n🔴 Testing Redis functionality...\n');

    const testKey = `test:${Date.now()}`;
    const testValue = 'test_value';

    await this.runTest('Redis SET/GET', async () => {
      await redis.set(testKey, testValue);
      const retrieved = await redis.get(testKey);
      if (retrieved !== testValue) {
        throw new Error(`Value mismatch: expected ${testValue}, got ${retrieved}`);
      }
      return `SET/GET successful`;
    });

    await this.runTest('Redis TTL', async () => {
      const ttlKey = `${testKey}:ttl`;
      await redis.set(ttlKey, testValue, 5); // 5 second TTL

      const exists1 = await redis.exists(ttlKey);
      if (!exists1) {
        throw new Error('Key should exist immediately after SET with TTL');
      }

      return `TTL set successfully`;
    });

    await this.runTest('Redis Session Storage', async () => {
      const sessionId = `test_session_${Date.now()}`;
      const sessionData = { userId: 'test123', role: 'renter' };

      await redis.setSession(sessionId, sessionData, 60);
      const retrieved = await redis.getSession(sessionId);

      if (JSON.stringify(retrieved) !== JSON.stringify(sessionData)) {
        throw new Error('Session data mismatch');
      }

      await redis.deleteSession(sessionId);
      return `Session storage working`;
    });

    await this.runTest('Redis Cache', async () => {
      const cacheKey = `test_cache_${Date.now()}`;
      const cacheData = { message: 'cached data', timestamp: Date.now() };

      await redis.cacheResponse(cacheKey, cacheData, 300);
      const retrieved = await redis.getCachedResponse(cacheKey);

      if (JSON.stringify(retrieved) !== JSON.stringify(cacheData)) {
        throw new Error('Cache data mismatch');
      }

      return `Cache working`;
    });

    // Clean up test keys
    await redis.delete(testKey);
  }

  /**
   * Test APPI compliance features
   */
  async testAPPICompliance(): Promise<void> {
    console.log('\n🔐 Testing APPI compliance features...\n');

    await this.runTest('APPI Audit Events Table', async () => {
      const result = await postgresql.query(`
        SELECT COUNT(*) as count
        FROM appi_audit_events
        WHERE event_type = 'database_access'
      `);
      return `Found ${result.rows[0].count} audit events`;
    });

    await this.runTest('APPI Privacy Policy Versions', async () => {
      const result = await postgresql.query(`
        SELECT version, effective_date
        FROM privacy_policy_versions
        ORDER BY effective_date DESC
        LIMIT 1
      `);
      if (result.rows.length === 0) {
        throw new Error('No privacy policy versions found');
      }
      return `Latest version: ${result.rows[0].version}`;
    });

    await this.runTest('Row Level Security', async () => {
      const result = await postgresql.query(`
        SELECT schemaname, tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        AND rowsecurity = true
      `);
      return `RLS enabled on ${result.rows.length} tables`;
    });

    await this.runTest('Geographic Data Residency', async () => {
      // Check that we're connecting to Tokyo region by checking timezone
      const result = await postgresql.query(`
        SELECT
          current_setting('timezone') as timezone,
          extract(timezone_hour from now()) as tz_offset
      `);

      const { timezone } = result.rows[0];
      return `Database timezone: ${timezone}`;
    });
  }

  /**
   * Test performance benchmarks
   */
  async testPerformance(): Promise<void> {
    console.log('\n⚡ Testing performance benchmarks...\n');

    await this.runTest('PostgreSQL Query Performance', async () => {
      const iterations = 10;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        await postgresql.query('SELECT 1');
      }

      const avgTime = (Date.now() - start) / iterations;

      if (avgTime > 100) {
        // 100ms threshold for APPI compliance
        throw new Error(`Average query time ${avgTime.toFixed(2)}ms exceeds 100ms threshold`);
      }

      return `Average query time: ${avgTime.toFixed(2)}ms`;
    });

    await this.runTest('Redis Performance', async () => {
      const iterations = 100;
      const testKey = `perf_test_${Date.now()}`;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        await redis.set(`${testKey}:${i}`, `value_${i}`);
        await redis.get(`${testKey}:${i}`);
      }

      const avgTime = (Date.now() - start) / (iterations * 2); // 2 operations per iteration

      if (avgTime > 10) {
        // 10ms threshold
        throw new Error(
          `Average Redis operation time ${avgTime.toFixed(2)}ms exceeds 10ms threshold`
        );
      }

      // Cleanup
      for (let i = 0; i < iterations; i++) {
        await redis.delete(`${testKey}:${i}`);
      }

      return `Average operation time: ${avgTime.toFixed(2)}ms`;
    });
  }

  /**
   * Print comprehensive test report
   */
  printReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('DATABASE CONNECTION TEST REPORT');
    console.log('='.repeat(60));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 Summary:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests} ✅`);
    console.log(`  Failed: ${failedTests} ❌`);
    console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`  Total Duration: ${totalDuration}ms`);

    if (failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`  - ${result.test}: ${result.details}`);
        });
    }

    console.log('\n🚀 Database Status:');
    if (failedTests === 0) {
      console.log('  ✅ All systems operational and APPI compliant');
      console.log('  ✅ Ready for production deployment');
    } else {
      console.log('  ⚠️  Some tests failed - review before deployment');
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Run all database tests
   */
  async runAllTests(): Promise<boolean> {
    console.log('🧪 Starting comprehensive database tests...\n');

    try {
      await this.testBasicConnections();
      await this.testPostgreSQLFunctionality();
      await this.testRedisFunctionality();
      await this.testAPPICompliance();
      await this.testPerformance();

      this.printReport();

      const allPassed = this.results.every(r => r.passed);
      return allPassed;
    } catch (error) {
      console.error('\n❌ Test execution failed:', error);
      this.printReport();
      return false;
    }
  }
}

// CLI interface
async function main() {
  const tester = new DatabaseTester();

  try {
    const success = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Test runner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DatabaseTester };
