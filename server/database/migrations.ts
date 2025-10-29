import { join } from 'path';

export interface MigrationFile {
  filename: string;
  version: string;
  description: string;
  path: string;
}

export const MIGRATIONS: MigrationFile[] = [
  {
    filename: '001_initial_schema.sql',
    version: '001',
    description: 'Initial APPI compliant schema with encrypted PII fields',
    path: join(__dirname, '001_initial_schema.sql'),
  },
  {
    filename: '002_add_data_deletion_requests.sql',
    version: '002',
    description: 'Add data_deletion_requests table for APPI Article 27 compliance',
    path: join(__dirname, '002_add_data_deletion_requests.sql'),
  },
  {
    filename: '003_appi_audit_event_types.sql',
    version: '003',
    description:
      'Add appi_audit_event_types lookup table with foreign key constraint for type safety',
    path: join(__dirname, '003_appi_audit_event_types.sql'),
  },
  {
    filename: '004_add_is_verified_to_users.sql',
    version: '004',
    description: 'Add is_verified row to users table to track Cognito user confirmation',
    path: join(__dirname, '004_add_is_verified_to_users.sql'),
  },
  {
    filename: '005_add_is_verified_audit_event.sql',
    version: '005',
    description: 'Add is_verified event type to appi_audit_event_types table',
    path: join(__dirname, '005_add_is_verified_audit_event.sql'),
  },
  // Add more migration files here as needed
];
