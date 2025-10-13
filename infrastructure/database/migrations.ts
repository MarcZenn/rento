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
  // Add more migration files here as needed
];
