#!/usr/bin/env node
/**
 * ============================================================================
 * Unified Database Migration System
 * ============================================================================
 *
 * Handles database migrations across all environments:
 * - local: Docker PostgreSQL (no AWS required)
 * - dev: AWS RDS in rento-development account (requires AWS SSO)
 * - prod: AWS RDS in rento-production account (automated via CI/CD)
 *
 * Usage:
 *   npm run db:migrate:local          # Local Docker
 *   npm run db:migrate:dev            # Dev RDS (AWS SSO required)
 *   npm run db:migrate:prod           # Production RDS (CI/CD only)
 *
 * Environment Detection:
 *   The script reads the MIGRATION_ENV environment variable to determine
 *   which environment to target, then loads appropriate configuration.
 *
 * AWS SSO Integration:
 *   For 'dev' environment, automatically loads AWS credentials from SSO
 *   profile and fetches RDS connection details from AWS.
 */

import { readFileSync, existsSync } from 'fs';
import { config as dotenvConfig } from 'dotenv';
import { execSync } from 'child_process';
import { MIGRATIONS, MigrationFile } from './migrations';
import { PostgreSQLManager } from './connection';
import { createInterface } from 'readline';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type Environment = 'local' | 'dev' | 'prod';

interface EnvironmentConfig {
  name: Environment;
  envFile: string;
  awsProfile?: string;
  awsRegion?: string;
  requiresAwsSso?: boolean;
  requiresConfirmation: boolean;
  confirmationKeyword: string;
  description: string;
}

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  sslRejectUnauthorized: boolean;
}

interface MigrationContext {
  environment: Environment;
  config: EnvironmentConfig;
  dbConfig: DatabaseConfig;
  isCI: boolean;
  autoConfirm: boolean;
}

// ============================================================================
// ENVIRONMENT CONFIGURATIONS
// ============================================================================

const ENVIRONMENT_CONFIGS: Record<Environment, EnvironmentConfig> = {
  local: {
    name: 'local',
    envFile: '.env.local',
    requiresConfirmation: false,
    confirmationKeyword: 'yes',
    description: 'Local Docker PostgreSQL (Safe)',
  },
  dev: {
    name: 'dev',
    envFile: '.env.development',
    awsProfile: 'rento-development-sso',
    awsRegion: 'ap-northeast-1',
    requiresAwsSso: true,
    requiresConfirmation: true,
    confirmationKeyword: 'MIGRATE DEV',
    description: 'AWS RDS Development (rento-development account)',
  },
  prod: {
    name: 'prod',
    envFile: '.env.production',
    awsProfile: 'rento-production-sso',
    awsRegion: 'ap-northeast-1',
    requiresAwsSso: true,
    requiresConfirmation: true,
    confirmationKeyword: 'MIGRATE PRODUCTION',
    description: 'AWS RDS Production (rento-production account)',
  },
};

// ============================================================================
// AWS SSO INTEGRATION
// ============================================================================

class AwsSsoManager {
  /**
   * Check if AWS SSO session is valid for the given profile
   */
  static isSsoSessionValid(profile: string): boolean {
    try {
      execSync(`aws sts get-caller-identity --profile ${profile}`, {
        stdio: 'pipe',
        timeout: 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Login to AWS SSO for the given profile
   */
  static loginToSso(profile: string): void {
    console.log(`\n🔐 AWS SSO session expired or not found for profile: ${profile}`);
    console.log(`   Opening browser for SSO login...\n`);

    try {
      execSync(`aws sso login --profile ${profile}`, { stdio: 'inherit' });
      console.log('✅ AWS SSO login successful\n');
    } catch (error) {
      throw new Error(`Failed to login to AWS SSO with profile ${profile}`);
    }
  }

  /**
   * Get RDS endpoint from CloudFormation stack
   */
  static getRdsEndpoint(profile: string, region: string, stackName: string): string {
    try {
      const command = `aws cloudformation describe-stacks \
        --stack-name ${stackName} \
        --region ${region} \
        --profile ${profile} \
        --query 'Stacks[0].Outputs[?OutputKey==\`DatabaseEndpoint\`].OutputValue' \
        --output text`;

      const endpoint = execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();

      if (!endpoint || endpoint === 'None') {
        throw new Error(`No DatabaseEndpoint output found in stack ${stackName}`);
      }

      return endpoint;
    } catch (error: any) {
      throw new Error(`Failed to get RDS endpoint from CloudFormation: ${error.message}`);
    }
  }

  /**
   * Get database password from AWS SSM Parameter Store
   */
  static getDbPassword(profile: string, region: string, parameterName: string): string {
    try {
      const command = `aws ssm get-parameter \
        --name ${parameterName} \
        --region ${region} \
        --profile ${profile} \
        --with-decryption \
        --query 'Parameter.Value' \
        --output text`;

      const password = execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();

      if (!password) {
        throw new Error(`No password found in parameter ${parameterName}`);
      }

      return password;
    } catch (error: any) {
      throw new Error(`Failed to get DB password from SSM Parameter Store: ${error.message}`);
    }
  }

  /**
   * Ensure AWS SSO is authenticated and ready
   */
  static ensureAuthenticated(profile: string): void {
    console.log(`🔍 Checking AWS SSO authentication for profile: ${profile}`);

    if (!this.isSsoSessionValid(profile)) {
      this.loginToSso(profile);
    } else {
      console.log(`✅ AWS SSO session is valid\n`);
    }
  }
}

// ============================================================================
// CONFIGURATION LOADING
// ============================================================================

class ConfigurationLoader {
  /**
   * Determine which environment to use
   */
  static detectEnvironment(): Environment {
    const env = process.env.MIGRATION_ENV as Environment;

    if (!env) {
      throw new Error(
        'MIGRATION_ENV not set. Use: npm run db:migrate:local|dev|prod'
      );
    }

    if (!['local', 'dev', 'prod'].includes(env)) {
      throw new Error(`Invalid MIGRATION_ENV: ${env}. Must be: local, dev, or prod`);
    }

    return env;
  }

  /**
   * Load environment file for the given environment
   */
  static loadEnvironmentFile(envFile: string): void {
    const envPath = `${__dirname}/../${envFile}`;

    if (existsSync(envPath)) {
      console.log(`📄 Loading environment from: ${envFile}`);
      dotenvConfig({ path: envPath });
    } else {
      console.log(`⚠️  Environment file not found: ${envFile}`);
      console.log(`   Using environment variables from shell\n`);
    }
  }

  /**
   * Load database configuration for local environment
   */
  static loadLocalConfig(): DatabaseConfig {
    return {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'rento_dev',
      user: process.env.POSTGRES_USER || 'rento_dev',
      password: process.env.POSTGRES_PASSWORD || 'dev_password',
      ssl: false,
      sslRejectUnauthorized: false,
    };
  }

  /**
   * Load database configuration for AWS RDS (dev/prod)
   */
  static loadAwsConfig(envConfig: EnvironmentConfig): DatabaseConfig {
    const { awsProfile, awsRegion, name } = envConfig;

    if (!awsProfile || !awsRegion) {
      throw new Error(`AWS configuration missing for ${name} environment`);
    }

    // Check if host is already provided in env file
    let host = process.env.POSTGRES_HOST;
    let password = process.env.POSTGRES_PASSWORD;

    // Only fetch from AWS if not provided in env
    if (!host || !password) {
      // Ensure AWS SSO is authenticated
      AwsSsoManager.ensureAuthenticated(awsProfile);

      // Determine CloudFormation stack name based on environment
      // Format: rento-postgres-{environment}
      const stackName = `rento-postgres-${name === 'dev' ? 'development' : 'production'}`;

      // Get RDS endpoint from CloudFormation (if not in env)
      if (!host) {
        console.log(`☁️  Fetching RDS endpoint from CloudFormation stack: ${stackName}`);
        host = AwsSsoManager.getRdsEndpoint(awsProfile, awsRegion, stackName);
        console.log(`✅ RDS Endpoint: ${host}\n`);
      } else {
        console.log(`✅ Using RDS endpoint from environment: ${host}\n`);
      }

      // Get database password from SSM Parameter Store (if not in env)
      if (!password) {
        // Format: /{environment}/rento/postgres/password
        const parameterName = `/${name === 'dev' ? 'development' : 'production'}/rento/postgres/password`;

        console.log(`🔐 Fetching database password from SSM Parameter Store: ${parameterName}`);
        password = AwsSsoManager.getDbPassword(awsProfile, awsRegion, parameterName);
        console.log(`✅ Password retrieved\n`);
      } else {
        console.log(`✅ Using database password from environment\n`);
      }
    } else {
      console.log(`✅ Using connection details from environment file\n`);
    }

    return {
      host,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'rento_appi_db',
      user: process.env.POSTGRES_USER || 'rento_admin',
      password,
      ssl: process.env.POSTGRES_SSL === 'true' || true,
      sslRejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED === 'true' || true,
    };
  }

  /**
   * Build complete migration context
   */
  static buildContext(): MigrationContext {
    const environment = this.detectEnvironment();
    const config = ENVIRONMENT_CONFIGS[environment];

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🚀 DATABASE MIGRATION SYSTEM`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Environment: ${config.description}`);
    console.log(`${'='.repeat(80)}\n`);

    // Load environment file
    this.loadEnvironmentFile(config.envFile);

    // Load database configuration
    const dbConfig =
      environment === 'local'
        ? this.loadLocalConfig()
        : this.loadAwsConfig(config);

    // Check for CI/auto-confirm mode
    const isCI = process.env.CI === 'true';
    const autoConfirm = process.env.AUTO_CONFIRM === 'true';

    return {
      environment,
      config,
      dbConfig,
      isCI,
      autoConfirm,
    };
  }
}

// ============================================================================
// SAFETY & CONFIRMATION
// ============================================================================

class SafetyCheck {
  /**
   * Display migration target information
   */
  static displayTarget(context: MigrationContext): void {
    const { config, dbConfig, isCI, autoConfirm } = context;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 MIGRATION TARGET CONFIRMATION`);
    console.log(`${'='.repeat(80)}`);

    // Environment indicator
    if (config.name === 'local') {
      console.log(`✅ Target: LOCAL DEVELOPMENT DATABASE (Docker)`);
      console.log(`   Safe to run migrations without risk to cloud data`);
    } else if (config.name === 'dev') {
      console.log(`⚠️  Target: AWS RDS DEVELOPMENT ENVIRONMENT`);
      console.log(`   WARNING: These migrations will affect the development database!`);
    } else if (config.name === 'prod') {
      console.log(`🚨 Target: AWS RDS PRODUCTION ENVIRONMENT`);
      console.log(`   DANGER: These migrations will affect LIVE PRODUCTION DATA!`);
    }

    console.log();
    console.log(`Connection Details:`);
    console.log(`  Host:        ${dbConfig.host}`);
    console.log(`  Port:        ${dbConfig.port}`);
    console.log(`  Database:    ${dbConfig.database}`);
    console.log(`  User:        ${dbConfig.user}`);
    console.log(`  SSL:         ${dbConfig.ssl ? 'Enabled' : 'Disabled'}`);

    if (config.awsProfile) {
      console.log(`  AWS Profile: ${config.awsProfile}`);
      console.log(`  AWS Region:  ${config.awsRegion}`);
    }

    console.log();

    // Show checklist for RDS environments
    if (config.name !== 'local') {
      console.log(`📋 PRE-MIGRATION CHECKLIST:`);
      console.log(`  [ ] Database snapshot has been taken`);
      console.log(`  [ ] All migration SQL files have been reviewed`);
      console.log(`  [ ] Migrations have been tested in lower environment`);
      if (config.name === 'prod') {
        console.log(`  [ ] Team has been notified of deployment`);
        console.log(`  [ ] Rollback plan is documented and ready`);
      }
      console.log();
    }

    if (isCI || autoConfirm) {
      console.log(`🤖 Running in automated mode (CI=${isCI}, AUTO_CONFIRM=${autoConfirm})`);
      console.log(`   Skipping interactive confirmation\n`);
    }

    console.log(`${'='.repeat(80)}\n`);
  }

  /**
   * Prompt user for confirmation
   */
  static async promptConfirmation(context: MigrationContext): Promise<boolean> {
    const { config, isCI, autoConfirm } = context;

    // Skip confirmation in CI/automated mode
    if (isCI || autoConfirm) {
      return true;
    }

    // Skip confirmation for local
    if (!config.requiresConfirmation) {
      return true;
    }

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      const keyword = config.confirmationKeyword;
      const question = `\n⚠️  Type "${keyword}" (exact match) to proceed with migration: `;

      rl.question(question, answer => {
        rl.close();
        resolve(answer.trim() === keyword);
      });
    });
  }
}

// ============================================================================
// DATABASE MIGRATION LOGIC
// ============================================================================

class DatabaseMigrator {
  private context: MigrationContext;
  private db: PostgreSQLManager;

  constructor(context: MigrationContext) {
    this.context = context;

    // Create PostgreSQL manager with context-specific config
    const { dbConfig } = context;

    // Set environment variables for the connection manager
    process.env.POSTGRES_HOST = dbConfig.host;
    process.env.POSTGRES_PORT = dbConfig.port.toString();
    process.env.POSTGRES_DB = dbConfig.database;
    process.env.POSTGRES_USER = dbConfig.user;
    process.env.POSTGRES_PASSWORD = dbConfig.password;
    process.env.POSTGRES_SSL = dbConfig.ssl.toString();
    process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED = dbConfig.sslRejectUnauthorized.toString();

    this.db = new PostgreSQLManager();
  }

  /**
   * Get list of migration files in order
   */
  private getMigrationFiles(): MigrationFile[] {
    return MIGRATIONS;
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
        checksum VARCHAR(64) NOT NULL,
        environment VARCHAR(20) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
    `;

    await this.db.query(createTableQuery);
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
  ): Promise<{ applied: boolean; checksum?: string; environment?: string }> {
    const result = await this.db.query(
      'SELECT checksum, environment FROM schema_migrations WHERE version = $1',
      [version]
    );

    if (result.rows.length > 0) {
      return {
        applied: true,
        checksum: result.rows[0].checksum,
        environment: result.rows[0].environment,
      };
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
    const { applied, checksum: existingChecksum, environment } =
      await this.isMigrationApplied(migration.version);

    if (applied) {
      if (existingChecksum === checksum) {
        console.log(`⏭️  Migration ${migration.version} already applied in ${environment} environment`);
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
    await this.db.transaction(async client => {
      try {
        // Execute migration SQL
        await client.query(sqlContent);

        // Record migration in tracking table
        await client.query(
          'INSERT INTO schema_migrations (version, description, checksum, environment) VALUES ($1, $2, $3, $4)',
          [migration.version, migration.description, checksum, this.context.environment]
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
    console.log('🚀 Starting database migration...\n');

    try {
      // Test database connection
      const health = await this.db.healthCheck();
      if (!health.healthy) {
        throw new Error('Database connection unhealthy');
      }
      console.log(`📊 Database connection healthy (${health.latency}ms)\n`);

      // Create migrations table
      await this.createMigrationsTable();

      // Get migration files
      const migrations = this.getMigrationFiles();
      console.log(`📋 Found ${migrations.length} migration file(s)\n`);

      // Apply each migration
      let appliedCount = 0;
      for (const migration of migrations) {
        const wasApplied = await this.isMigrationApplied(migration.version);
        await this.applyMigration(migration);
        if (!wasApplied.applied) {
          appliedCount++;
        }
      }

      console.log(`\n✅ Migration complete! Applied ${appliedCount} new migration(s)`);
    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    } finally {
      await this.db.close();
    }
  }

  /**
   * Show migration status
   */
  async status(): Promise<void> {
    console.log('📊 Migration Status:\n');

    try {
      const health = await this.db.healthCheck();
      if (!health.healthy) {
        throw new Error('Database connection unhealthy');
      }

      await this.createMigrationsTable();

      const appliedMigrations = await this.db.query(
        'SELECT version, description, applied_at, environment FROM schema_migrations ORDER BY version'
      );

      const allMigrations = this.getMigrationFiles();

      console.log('Applied Migrations:');
      if (appliedMigrations.rows.length === 0) {
        console.log('  (none)');
      } else {
        for (const applied of appliedMigrations.rows) {
          console.log(
            `  ✅ ${applied.version}: ${applied.description} ` +
            `(${applied.environment}, ${new Date(applied.applied_at).toLocaleString()})`
          );
        }
      }

      console.log('\nPending Migrations:');
      const appliedVersions = new Set(appliedMigrations.rows.map((row: any) => row.version));
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
    } finally {
      await this.db.close();
    }
  }

  /**
   * Initialize APPI compliance data
   */
  async initializeAPPIData(): Promise<void> {
    console.log('🔐 Initializing APPI compliance data...');

    try {
      // Insert initial privacy policy version
      await this.db.query(`
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
      await this.db.query(`
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
          '{"action": "database_initialization", "compliance_level": "APPI_Article_24_compliant", "environment": "${this.context.environment}"}'
        )
      `);

      console.log('✅ APPI compliance data initialized');
    } catch (error) {
      console.error('❌ Failed to initialize APPI data:', error);
      throw error;
    } finally {
      await this.db.close();
    }
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';

  try {
    // Build migration context
    const context = ConfigurationLoader.buildContext();

    // Display target information
    SafetyCheck.displayTarget(context);

    // Get confirmation for non-local environments
    if (context.config.requiresConfirmation || command === 'migrate') {
      const confirmed = await SafetyCheck.promptConfirmation(context);

      if (!confirmed) {
        console.log('❌ Migration cancelled by user\n');
        process.exit(1);
      }

      console.log('✅ Confirmation received, proceeding...\n');
    }

    // Create migrator
    const migrator = new DatabaseMigrator(context);

    // Execute command
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
Usage: npm run db:migrate:[environment] [command]

Environments:
  local       Local Docker PostgreSQL (no AWS required)
  dev         AWS RDS Development (requires rento-development-sso profile)
  prod        AWS RDS Production (requires rento-production-sso profile)

Commands:
  migrate     Apply all pending migrations (default)
  status      Show migration status
  init-appi   Initialize APPI compliance data

Examples:
  npm run db:migrate:local
  npm run db:migrate:dev status
  npm run db:migrate:prod
        `);
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DatabaseMigrator, ConfigurationLoader, AwsSsoManager };
