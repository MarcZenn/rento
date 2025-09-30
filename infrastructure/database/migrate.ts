#!/usr/bin/env node
/**
// ============================================================================
// DEV NOTES
// ============================================================================
 * Database Migration Handler - Applies New Migrations & Tracks Migrations
 * Applies PostgreSQL schema and runs initial data setup
 *
 * This is a database migration management script that handles schema
 * versioning for your PostgreSQL database. Here's what it does:
 *
 * Core Functions:
 *
 * 1. Version Control for Database Schema (like Git for your database)
 *    - Tracks which schema changes have been applied via
 *      schema_migrations table
 *    - Prevents duplicate migrations
 *    - Detects if migration files change after being applied (checksum
 *      validation)
 * 2. Applies SQL Migration Files
 *    - Executes migrations in transactions for safety
 *    - Can add more migrations as numbered files
 * 3. APPI Compliance Initialization
 *    - Seeds initial privacy policy data
 *    - Creates audit logs for compliance tracking
 *
 * Adding New Migrations:
 *
 * 1. Create new migration file with example format: 002_feature_name_date.sql
 * 2. Add to getMigrationFiles()
 * 3. Run npm run db:migrate to apply migration
 * 4. Run npm run db:status to see applied migrations vs pending migrations
 *
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { postgresql } from '../../src/lib/database/connection';

interface MigrationFile {
  filename: string;
  version: string;
  description: string;
  path: string;
}

class DatabaseMigrator {
  /**
   * Get list of migration files in order
   */
  private getMigrationFiles(): MigrationFile[] {
    return [
      {
        filename: '001_initial_schema.sql',
        version: '001',
        description: 'Initial APPI compliant schema with encrypted PII fields',
        path: join(__dirname, '001_initial_schema.sql'),
      },
      // Add more migration files here as needed
    ];
  }

  /**
   * Create migrations tracking table if it doesn't exist
   */
  private async createMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(50) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW(),
        checksum VARCHAR(64) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
    `;

    await postgresql.query(createTableQuery);
    console.log('✅ Migrations table ready');
  }

  /**
   * Generate checksum for migration file content
   */
  private generateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Check if migration has already been applied
   */
  private async isMigrationApplied(
    version: string
  ): Promise<{ applied: boolean; checksum?: string }> {
    const result = await postgresql.query(
      'SELECT checksum FROM schema_migrations WHERE version = $1',
      [version]
    );

    if (result.rows.length > 0) {
      return { applied: true, checksum: result.rows[0].checksum };
    }

    return { applied: false };
  }

  /**
   * Apply a single migration
   */
  private async applyMigration(migration: MigrationFile): Promise<void> {
    console.log(`📄 Processing migration ${migration.version}: ${migration.description}`);

    // Read migration file
    const sqlContent = readFileSync(migration.path, 'utf8');
    const checksum = this.generateChecksum(sqlContent);

    // Check if already applied
    const { applied, checksum: existingChecksum } = await this.isMigrationApplied(
      migration.version
    );

    if (applied) {
      if (existingChecksum === checksum) {
        console.log(`⏭️  Migration ${migration.version} already applied`);
        return;
      } else {
        throw new Error(
          `Migration ${migration.version} checksum mismatch! ` +
            `Database has ${existingChecksum}, file has ${checksum}. ` +
            `This indicates the migration file was modified after being applied.`
        );
      }
    }

    // Apply migration in transaction
    await postgresql.transaction(async client => {
      try {
        // Execute migration SQL
        await client.query(sqlContent);

        // Record migration in tracking table
        await client.query(
          'INSERT INTO schema_migrations (version, description, checksum) VALUES ($1, $2, $3)',
          [migration.version, migration.description, checksum]
        );

        console.log(`✅ Applied migration ${migration.version}`);
      } catch (error) {
        console.error(`❌ Failed to apply migration ${migration.version}:`, error);
        throw error;
      }
    });
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<void> {
    console.log('🚀 Starting database migration...');

    try {
      // Test database connection
      const health = await postgresql.healthCheck();
      if (!health.healthy) {
        throw new Error('Database connection unhealthy');
      }
      console.log(`📊 Database connection healthy (${health.latency}ms)`);

      // Create migrations table
      await this.createMigrationsTable();

      // Get migration files
      const migrations = this.getMigrationFiles();
      console.log(`📋 Found ${migrations.length} migration file(s)`);

      // Apply each migration
      for (const migration of migrations) {
        await this.applyMigration(migration);
      }

      console.log('✅ All migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  /**
   * Show migration status
   */
  async status(): Promise<void> {
    console.log('📊 Migration Status:');

    try {
      const health = await postgresql.healthCheck();
      if (!health.healthy) {
        throw new Error('Database connection unhealthy');
      }

      await this.createMigrationsTable();

      const appliedMigrations = await postgresql.query(
        'SELECT version, description, applied_at FROM schema_migrations ORDER BY version'
      );

      const allMigrations = this.getMigrationFiles();

      console.log('\nApplied Migrations:');
      for (const applied of appliedMigrations.rows) {
        console.log(`  ✅ ${applied.version}: ${applied.description} (${applied.applied_at})`);
      }

      console.log('\nPending Migrations:');
      const appliedVersions = new Set(appliedMigrations.rows.map(row => row.version));
      const pendingMigrations = allMigrations.filter(m => !appliedVersions.has(m.version));

      if (pendingMigrations.length === 0) {
        console.log('  🎉 No pending migrations');
      } else {
        for (const pending of pendingMigrations) {
          console.log(`  ⏳ ${pending.version}: ${pending.description}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to check migration status:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize APPI compliance data
   */
  async initializeAPPIData(): Promise<void> {
    console.log('🔐 Initializing APPI compliance data...');

    try {
      // Insert initial privacy policy version
      await postgresql.query(`
        INSERT INTO privacy_policy_versions (
          version, effective_date, en_content_hash, jp_content_hash,
          major_changes, requires_reconsent
        ) VALUES (
          'v1.0.0', NOW(),
          encode(sha256('initial_en_policy'), 'hex'),
          encode(sha256('initial_jp_policy'), 'hex'),
          ARRAY['Initial APPI compliant privacy policy'],
          true
        ) ON CONFLICT (version) DO NOTHING
      `);

      // Create audit log for initialization
      await postgresql.query(`
        INSERT INTO appi_audit_events (
          event_id, event_type, event_timestamp, ip_address,
          user_agent, data_accessed, compliance_status, event_details
        ) VALUES (
          'init_' || extract(epoch from now()) || '_appi',
          'data_access',
          NOW(),
          '127.0.0.1',
          'migration_script',
          'APPI compliance tables initialized',
          'compliant',
          '{"action": "database_initialization", "compliance_level": "APPI_Article_24_compliant"}'
        )
      `);

      console.log('✅ APPI compliance data initialized');
    } catch (error) {
      console.error('❌ Failed to initialize APPI data:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';

  const migrator = new DatabaseMigrator();

  try {
    switch (command) {
      case 'migrate':
        await migrator.migrate();
        await migrator.initializeAPPIData();
        break;

      case 'status':
        await migrator.status();
        break;

      case 'init-appi':
        await migrator.initializeAPPIData();
        break;

      default:
        console.log(`
Usage: npm run db:migrate [command]

Commands:
  migrate     Apply all pending migrations (default)
  status      Show migration status
  init-appi   Initialize APPI compliance data

Examples:
  npm run db:migrate
  npm run db:migrate status
  npm run db:migrate init-appi
        `);
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DatabaseMigrator };
