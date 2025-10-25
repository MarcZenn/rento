# Rento Server

GraphQL API server for the Rento real estate rental application.

## Directory Structure

```
server/
├── build-server.sh          # Build script for production deployment
├── deploy/                  # Deployment scripts
│   └── deploy-to-ec2.sh    # Deploy application to AWS EC2
├── database/               # Database schemas and migrations
├── src/                    # TypeScript source code
├── dist/                   # Compiled JavaScript (generated)
└── package.json
```

## Development

### Local Development

```bash
# Start development server with hot reload
npm run dev

# Run with production environment
npm start
```

### Building

```bash
# Build TypeScript to JavaScript
npm run build

# Or use the build script directly
./build-server.sh

# Clean build
./build-server.sh --clean
```

## Deployment

### Deploy to AWS EC2

The deployment script builds and deploys the GraphQL server to an existing EC2 instance.

**Prerequisites:**
- EC2 instance deployed via CloudFormation
- SSH key pair configured
- Environment variables stored in AWS Systems Manager Parameter Store

**Deploy:**
```bash
cd deploy
./deploy-to-ec2.sh development
```

See [deployment guide](../infrastructure/aws/deploy/deployment_guide.md) for full deployment instructions.

## Database

### Migrations

```bash
# Run migrations
npm run db:dev:migrate

# Check migration status
npm run db:dev:status

# Initialize APPI compliance tables
npm run db:dev:init-appi

# Test database connection
npm run db:dev:test
```

### Local PostgreSQL (Docker)

```bash
# Start local PostgreSQL
npm run db:dev:up

# Stop local PostgreSQL
npm run db:dev:down

# View logs
npm run db:dev:logs

# Connect to PostgreSQL CLI
npm run db:dev:psql
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm run build` | Build TypeScript to JavaScript |
| `./build-server.sh` | Build script with type checking |
| `./deploy/deploy-to-ec2.sh` | Deploy to AWS EC2 instance |
| `npm run db:dev:migrate` | Run database migrations |
| `npm run db:dev:test` | Test database connection |
