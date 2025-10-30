#/document-project Task

## ⚠️ CRITICAL EXECUTION NOTICE ⚠️

**THIS IS AN EXECUTABLE WORKFLOW - NOT REFERENCE MATERIAL**

## Purpose

Generate comprehensive documentation for existing projects optimized for AI development agents. This task creates structured reference materials that enable AI agents to understand project context, conventions, and patterns for effective contribution to any codebase.

## Task Instructions

### 1. Initial Project Analysis

**CRITICAL**:

Ask the user to provide any of the following:

1. **Provide existing requirements** - Do you have a requirements documents, epics, or project description you can share?

2. **Document everything** - Or should I proceed with comprehensive documentation of the entire codebase? (Note: This may create excessive documentation for large projects)

Please let me know your preference, or I can proceed with full documentation if you prefer."

Based on their response:

- If they choose option 1: Use that context to focus documentation
- If they choose option 2: Proceed with comprehensive analysis below

Begin by conducting analysis of the existing project. Use available tools to:

1. **Project Structure Discovery**: Examine the root directory structure, identify main folders, and understand the overall organization
2. **Technology Stack Identification**: Look for package.json, requirements.txt, Cargo.toml, pom.xml, etc. to identify languages, frameworks, and dependencies
3. **Build System Analysis**: Find build scripts, CI/CD configurations, and development commands
4. **Existing Documentation Review**: Check for README files, docs folders, and any existing documentation
5. **Code Pattern Analysis**: Sample key files to understand coding patterns, naming conventions, and architectural approaches

Only ask the user these elicitation questions, to better understand their needs, if they are left unanswered by the PDRD or tac.md or breif.md

- What is the primary purpose of this project?
- Are there any specific areas of the codebase that are particularly complex or important for agents to understand?
- What types of tasks do you expect AI agents to perform on this project? (e.g., bug fixes, feature additions, refactoring, testing)
- Are there any existing documentation standards or formats you prefer?
- What level of technical detail should the documentation target? (junior developers, senior developers, mixed team)
- Is there a specific feature or enhancement you're planning? (This helps focus documentation)

### 2. Deep Codebase Analysis

CRITICAL: Before generating documentation, conduct extensive analysis of the existing codebase:

1. **Explore Key Areas**:
   - Entry points (main files, index files, app initializers)
   - Configuration files and environment setup
   - Package dependencies and versions
   - Build and deployment configurations
   - Test suites and coverage

2. **Ask Clarifying Questions**:
   - "I see you're using [technology X]. Are there any custom patterns or conventions I should document?"
   - "What are the most critical/complex parts of this system that developers struggle with?"
   - "Are there any undocumented 'tribal knowledge' areas I should capture?"
   - "What technical debt or known issues should I document?"
   - "Which parts of the codebase change most frequently?"

3. **Map the Reality**:
   - Identify ACTUAL patterns used (not theoretical best practices)
   - Find where key business logic lives
   - Locate integration points and external dependencies
   - Document workarounds and technical debt
   - Note areas that differ from standard patterns

### 3. Core Documentation Generation

[[LLM: Based on your documentation, update the `@/.claude/docs/documentation/architecture.md` file.

**CRITICAL**: This is NOT an aspirational architecture document. Document what EXISTS, including:

- Technical debt and workarounds
- Inconsistent patterns between different parts
- Legacy code that can't be changed
- Integration constraints
- Performance bottlenecks

**Document Structure**:

# [Project Name] Architecture Document

## Introduction

This document captures the CURRENT STATE of the [Project Name] codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on enhancements.

### Document Scope

[If PRD provided: "Focused on areas relevant to: {enhancement description}"]
[If no PRD: "Comprehensive documentation of entire system"]

### Change Log

| Date   | Version | Description                 | Author    |
| ------ | ------- | --------------------------- | --------- |
| [Date] | 1.0     | Initial codebase analysis | [Analyst] |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/index.js` (or actual entry point)
- **Configuration**: `config/app.config.js`, `.env.example`
- **Core Business Logic**: `src/services/`, `src/domain/`
- **API Definitions**: `src/routes/` or link to OpenAPI spec
- **Database Models**: `src/models/` or link to schema files
- **Key Algorithms**: [List specific files with complex logic]

## High Level Architecture

### Technical Summary

### Actual Tech Stack (from package.json/requirements.txt)

| Category  | Technology | Version | Notes                      |
| --------- | ---------- | ------- | -------------------------- |
| Runtime   | Node.js    | 16.x    | [Any constraints]          |
| Framework | Express    | 4.18.2  | [Custom middleware?]       |
| Database  | PostgreSQL | 13      | [Connection pooling setup] |

etc...

### Repository Structure Reality Check

- Type: [Monorepo/Polyrepo/Hybrid]
- Package Manager: [npm/yarn/pnpm]
- Notable: [Any unusual structure decisions]

## Source Tree and Module Organization

### Project Structure (Actual)

```text
project-root/
├── src/
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic (NOTE: inconsistent patterns between user and payment services)
│   ├── models/          # Database models (Sequelize)
│   ├── utils/           # Mixed bag - needs refactoring
│   └── legacy/          # DO NOT MODIFY - old payment system still in use
├── tests/               # Jest tests (60% coverage)
├── scripts/             # Build and deployment scripts
└── config/              # Environment configs
```

### Key Modules and Their Purpose

- **User Management**: `src/services/userService.js` - Handles all user operations
- **Authentication**: `src/middleware/auth.js` - JWT-based, custom implementation
- **Payment Processing**: `src/legacy/payment.js` - CRITICAL: Do not refactor, tightly coupled
- **[List other key modules with their actual files]**

## Data Models and APIs

### Data Models

Instead of duplicating, reference actual model files:

- **User Model**: See `src/models/User.js`
- **Order Model**: See `src/models/Order.js`
- **Related Types**: TypeScript definitions in `src/types/`

### API Specifications

- **OpenAPI Spec**: `docs/api/openapi.yaml` (if exists)
- **Postman Collection**: `docs/api/postman-collection.json`
- **Manual Endpoints**: [List any undocumented endpoints discovered]

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Payment Service**: Legacy code in `src/legacy/payment.js` - tightly coupled, no tests
2. **User Service**: Different pattern than other services, uses callbacks instead of promises
3. **Database Migrations**: Manually tracked, no proper migration tool
4. **[Other significant debt]**

### Workarounds and Gotchas

- **Environment Variables**: Must set `NODE_ENV=production` even for staging (historical reason)
- **Database Connections**: Connection pool hardcoded to 10, changing breaks payment service
- **[Other workarounds developers need to know]**

## Integration Points and External Dependencies

### External Services

| Service  | Purpose  | Integration Type | Key Files                      |
| -------- | -------- | ---------------- | ------------------------------ |
| Stripe   | Payments | REST API         | `src/integrations/stripe/`     |
| SendGrid | Emails   | SDK              | `src/services/emailService.js` |

etc...

### Internal Integration Points

- **Frontend Communication**: REST API on port 3000, expects specific headers
- **Background Jobs**: Redis queue, see `src/workers/`
- **[Other integrations]**

## Development and Deployment

### Local Development Setup

1. Actual steps that work (not ideal steps)
2. Known issues with setup
3. Required environment variables (see `.env.example`)

### Build and Deployment Process

- **Build Command**: `npm run build` (webpack config in `webpack.config.js`)
- **Deployment**: Manual deployment via `scripts/deploy.sh`
- **Environments**: Dev, Staging, Prod (see `config/environments/`)

## Testing Reality

### Current Test Coverage

- Unit Tests: 60% coverage (Jest)
- Integration Tests: Minimal, in `tests/integration/`
- E2E Tests: None
- Manual Testing: Primary QA method

### Running Tests

```bash
npm test           # Runs unit tests
npm run test:integration  # Runs integration tests (requires local DB)
```

### Integration Considerations

- Will need to integrate with existing auth middleware
- Must follow existing response format in `src/utils/responseFormatter.js`
- [Other integration points]

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
npm run dev         # Start development server
npm run build       # Production build
npm run migrate     # Run database migrations
npm run seed        # Seed test data
```

### Debugging and Troubleshooting

- **Logs**: Check `logs/app.log` for application logs
- **Debug Mode**: Set `DEBUG=app:*` for verbose logging
- **Common Issues**: See `docs/troubleshooting.md`]]

### 4. Document Delivery

1. **In IDE Environment**:
   - Update the document as `@/.claude/docs/documentation/architecture.md`. If it does not exist, then create it.
   - Datestamp the document to track changes
   - Inform user this single document contains all architectural information
   - Can be sharded later using PO agent if desired

The document should be comprehensive enough that future agents can understand:

- The actual state of the system (not idealized)
- Where to find key files and logic
- What technical debt exists
- What constraints must be respected

### 5. Quality Assurance

CRITICAL: Before finalizing the document:

1. **Accuracy Check**: Verify all technical details match the actual codebase
2. **Completeness Review**: Ensure all major system components are documented
3. **Focus Validation**: If user provided scope, verify relevant areas are emphasized
4. **Clarity Assessment**: Check that explanations are clear for AI agents
5. **Navigation**: Ensure document has clear section structure for easy reference

Apply the advanced elicitation task after major sections to refine based on user feedback.

## Success Criteria

- Single comprehensive brownfield architecture document created
- Document reflects REALITY including technical debt and workarounds
- Key files and modules are referenced with actual paths
- Models/APIs reference source files rather than duplicating content
- If PRD provided: Clear impact analysis showing what needs to change
- Document enables AI agents to navigate and understand the actual codebase
- Technical constraints and "gotchas" are clearly documented

## Notes

- This task creates ONE document that captures the TRUE state of the system
- References actual files rather than duplicating content when possible
- Documents technical debt, workarounds, and constraints honestly
- For brownfield projects with PRD: Provides clear enhancement impact analysis
- The goal is PRACTICAL documentation for AI agents doing real work
