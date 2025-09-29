# Rento Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Rento codebase as of September 20 2025, including technical implementation progress, existing infrastructure, and real-world patterns. It serves as a reference for AI agents working on enhancements outlined in the Product Development Roadmap Document (PDRD).

### Document Scope

**Focused on areas relevant to**: APPI Compliance Infrastructure, Bilingual Authentication System, Property Search Platform, User Tools, Real-Time Translation, and Agent Dashboard features as outlined in PDRD phases.

### Change Log

| Date       | Version | Description                 | Author    |
| ---------- | ------- | --------------------------- | --------- |
| 2025-09-20 | 1.0     | Initial brownfield analysis | Architect |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `index.ts` (Expo entry point)
- **App Router**: `app/_layout.tsx` (Expo Router v5 file-based routing)
- **Authentication**: `app/(auth)/` routes, Clerk integration via `@clerk/clerk-expo`
- **Core Business Logic**: `convex/` functions and schema
- **Database Schema**: `convex/schema.ts` (comprehensive bilingual property rental schema)
- **UI Components**: `components/` and `src/theme/` (Unistyles theming system)
- **Internationalization**: `src/services/i18n/` (react-i18next implementation)

### PDRD Enhancement Impact Areas

Based on the planned roadmap, these areas will be most affected:
- `convex/schema.ts` - Already has comprehensive APPI-compliant structure
- `app/(protected)/(tabs)/search/` - Property search interface (currently placeholder)
- `app/(protected)/(tabs)/favorites.tsx` - Favorites system (currently placeholder)
- `src/services/i18n/` - Translation infrastructure (foundation exists)
- Authentication flows in `app/(auth)/` (Clerk integration established)

## High Level Architecture

### Actual Tech Stack (from package.json)

| Category        | Technology           | Version | Notes                                          |
| --------------- | -------------------- | ------- | ---------------------------------------------- |
| Runtime         | React Native         | 0.79.2  | Latest stable, React 19 support               |
| Framework       | Expo                 | ~53.0.8 | Expo Router v5 for navigation                 |
| Database/BaaS   | Convex               | ^1.24.1 | **REQUIRES self-hosting for APPI compliance** |
| Authentication  | Clerk                | ^2.11.2 | **REQUIRES migration to JP-compliant provider** |
| Styling         | React Native Unistyles | ^3.0.0-rc.5 | Unified theme system                     |
| State Mgmt      | React Hooks + Convex | -       | No external state management library           |
| i18n            | react-i18next        | ^15.5.1 | EN/JA support configured                       |
| Forms           | React Hook Form      | ^7.56.3 | With Zod validation                            |
| Dev Tools       | TypeScript + ESLint  | 5.8.3   | ESLint config needs migration (legacy format) |

### Repository Structure Reality Check

- **Type**: Monorepo structure with single package.json
- **Package Manager**: npm (yarn.lock exists but npm is primary)
- **Navigation**: Expo Router v5 file-based routing system
- **Notable**: Uses advanced `.claude/` directory for agent-driven development

## Source Tree and Module Organization

### Project Structure (Actual)

```text
rento/
├── app/                          # Expo Router v5 file-based routing
│   ├── (protected)/              # Authenticated routes
│   │   ├── (tabs)/               # Tab navigation structure
│   │   │   ├── search/           # Property search (placeholder implementation)
│   │   │   ├── feed/             # Content feed (placeholder)
│   │   │   ├── favorites.tsx     # Saved properties (placeholder)
│   │   │   └── profile.tsx       # User profile management
│   │   └── _layout.tsx           # Protected route layout
│   ├── (public)/                 # Public routes
│   ├── (auth)/                   # Authentication flows
│   └── _layout.tsx               # Root layout with providers
├── convex/                       # Backend functions and schema
│   ├── schema.ts                 # **COMPREHENSIVE** bilingual rental schema
│   ├── users.ts                  # User management functions
│   ├── profiles.ts               # Profile CRUD operations
│   ├── consent.ts                # APPI compliance functions
│   ├── translations.ts           # Translation service functions
│   └── auth.config.ts            # Clerk integration config
├── src/                          # Core application logic
│   ├── services/i18n/            # Internationalization (EN/JA configured)
│   ├── theme/                    # Unistyles theme system
│   └── constants/                # App constants and images
├── components/                   # Reusable UI components
│   ├── custom/buttons/           # Custom button components
│   ├── Header.tsx                # Main header component
│   └── SignInWith.tsx            # Authentication components
├── .claude/                      # Agent-driven development system
│   ├── docs/                     # Project documentation (PDRD, brief, etc.)
│   ├── tasks/                    # Executable agent tasks
│   └── agents/                   # Agent persona definitions
└── assets/                       # Static assets and images
```

### Key Modules and Their Purpose

- **Authentication System**: `app/(auth)/` + `@clerk/clerk-expo` - JWT-based auth, needs APPI migration
- **Database Layer**: `convex/` - **FULLY IMPLEMENTED** schema for bilingual property rental
- **UI Theme System**: `src/theme/` - Unistyles-based responsive theming
- **Internationalization**: `src/services/i18n/` - react-i18next with AsyncStorage persistence
- **Route Protection**: `app/(protected)/` - Expo Router authentication guards

## Data Models and APIs

### Data Models

**IMPORTANT**: The Convex schema in `convex/schema.ts` provides a **STRONG FOUNDATION** for PDRD features but requires expansion:

- **User System**: Users, profiles, user_types, user_preferences - GOOD FOUNDATION
- **APPI Compliance**: user_consent, consent_history, privacy_policy_versions - GOOD FOUNDATION
- **Property System**: properties, properties_translations, agencies, agents - GOOD FOUNDATION
- **Communication**: chats, messages with translation support - BASIC STRUCTURE
- **Localization**: Translation table structure for core entities - PARTIAL COVERAGE
- **Geographic Data**: countries, prefectures, wards, floor_plans - BASIC STRUCTURE

**Schema Gaps**: Advanced search filters, cultural navigation metadata, agent performance tracking, notification preferences, and other PDRD-specific features will require schema extensions.

### API Specifications

- **Convex Functions**: Located in `convex/*.ts` files
- **Authentication**: Clerk-based JWT with Convex integration
- **Real-time**: Convex provides real-time subscriptions out of the box
- **Translation API**: Structure exists in `convex/translations.ts`

## Technical Debt and Known Issues

### Critical Technical Debt

1. **APPI Compliance Gap**:
   - Convex is currently cloud-hosted (NOT self-hosted as required)
   - Schema is APPI-ready but infrastructure needs migration
   - Location: All Convex usage needs self-hosting migration

2. **Clerk Authentication**:
   - Currently using US-based Clerk service
   - Needs migration to Japanese-compliant identity provider
   - Location: `convex/auth.config.ts`, all authentication flows

3. **ESLint Configuration**:
   - Using legacy `.eslintrc.js` format
   - ESLint v9 requires `eslint.config.js` format
   - Currently causing lint script failures

4. **Placeholder Implementations**:
   - Search page: `app/(protected)/(tabs)/search/index.tsx` - Only header component
   - Favorites page: `app/(protected)/(tabs)/favorites.tsx` - Only header component
   - Feed page: `app/(protected)/(tabs)/feed/index.tsx` - Placeholder structure

### Workarounds and Gotchas

- **Translation System**: Hybrid approach using both DB translations + AI translation APIs
- **Route Structure**: Expo Router v5 uses file-based routing with grouped routes `(groupName)`
- **Theme System**: Unistyles requires specific StyleSheet import from 'react-native-unistyles'
- **i18n**: Language persistence via AsyncStorage, device locale detection with fallbacks

## Integration Points and External Dependencies

### External Services

| Service | Purpose | Integration Type | Key Files | Status |
|---------|---------|------------------|-----------|---------|
| Clerk | Authentication | SDK | `@clerk/clerk-expo`, `convex/auth.config.ts` | **NEEDS MIGRATION** |
| Convex | Database/Backend | SDK | `convex/` directory | **NEEDS SELF-HOSTING** |
| react-i18next | Internationalization | Library | `src/services/i18n/` | IMPLEMENTED |
| Expo | App Platform | Framework | `app.json`, Expo Router | CURRENT |

### Internal Integration Points

- **Authentication Flow**: Clerk → Convex JWT validation → Route protection
- **Database Queries**: React components → Convex hooks → Real-time updates
- **Theme System**: Unistyles provider → StyleSheet.create → Component styling
- **Internationalization**: AsyncStorage → i18next → Component translation hooks

## Development and Deployment

### Local Development Setup

1. **Working Commands**:
   ```bash
   npm start          # Expo development server
   npm run ios        # iOS simulator
   npm run android    # Android emulator
   npm run web        # Web development
   npm run format     # Prettier formatting
   ```

2. **Known Issues**:
   ```bash
   npm run lint       # FAILS - ESLint config needs migration
   npm run lint:fix   # FAILS - Same ESLint issue
   ```

3. **Required Environment Variables**:
   - Clerk configuration (`.env` file exists, contains sensitive data)
   - Convex deployment configuration

### Build and Deployment Process

- **Build System**: Expo build system with Expo Router
- **Target Platforms**: iOS, Android, Web (responsive)
- **Development Environment**: Expo development client
- **Production**: Not yet configured for APPI-compliant deployment

## Testing Reality

### Current Test Coverage

- **Unit Tests**: None detected in codebase
- **Integration Tests**: None detected
- **E2E Tests**: None detected
- **Manual Testing**: Primary testing method

### Running Tests

```bash
# No test scripts configured in package.json
# Testing infrastructure needs to be established
```

## PDRD Implementation Status Analysis

### Phase 1: Foundation & Compliance Infrastructure

#### ⚠️ **Database Schema - FOUNDATION EXISTS**
- **Status**: GOOD FOUNDATION - Core schema in `convex/schema.ts`
- **Features**: Basic APPI compliance, user management, property structure
- **Gaps**: Advanced search filters, cultural metadata, agent dashboards, notification systems
- **Infrastructure Gap**: Needs self-hosting migration

#### ⚠️ **Authentication System - FOUNDATION EXISTS**
- **Status**: PARTIAL - Clerk integration working, needs APPI migration
- **Implemented**: User registration, profile management, JWT tokens
- **Gap**: Japanese-compliant identity provider migration required

#### 🔴 **Self-Hosted Infrastructure - NOT IMPLEMENTED**
- **Status**: CRITICAL GAP - Currently using cloud Convex
- **Required**: AWS Tokyo/Azure Japan deployment with data residency
- **Impact**: Blocks legal operation in Japan

### Phase 2: Core Property Discovery Platform

#### 🔴 **Property Search - PLACEHOLDER ONLY**
- **Status**: NOT IMPLEMENTED - Basic route structure exists
- **Schema**: FOUNDATION exists, will need expansion for advanced filters
- **UI**: Only header component in `app/(protected)/(tabs)/search/index.tsx`

#### 🔴 **Favorites System - PLACEHOLDER ONLY**
- **Status**: NOT IMPLEMENTED - Route exists, no functionality
- **Schema**: BASIC structure exists, needs expansion for categories/notifications
- **UI**: Only header component in `app/(protected)/(tabs)/favorites.tsx`

#### ✅ **Translation Infrastructure - FOUNDATION READY**
- **Status**: GOOD FOUNDATION - i18n system configured
- **Implemented**: EN/JA language switching, AsyncStorage persistence
- **Gap**: Real-time translation API integration needed

### Phase 3: Agent Communication & Relationship Management

#### 🔴 **Real-Time Messaging - BASIC SCHEMA ONLY**
- **Status**: NOT IMPLEMENTED - Basic database schema exists
- **Schema**: Basic chat/message structure, needs expansion for context preservation
- **Gap**: WebSocket infrastructure, UI components, translation integration, cultural communication patterns

#### 🔴 **Agent Dashboard - NOT STARTED**
- **Status**: NOT IMPLEMENTED - No web dashboard infrastructure
- **Gap**: Separate web application needed for agent tools

## Enhancement Implementation Priorities

### Immediate Development Sequence (Based on PDRD)

1. **CRITICAL - Infrastructure Migration**:
   - Self-host Convex on AWS Tokyo for APPI compliance
   - Migrate Clerk to Japanese-compliant auth provider
   - Establish audit logging and data residency controls

2. **HIGH - Property Search Implementation**:
   - Implement `app/(protected)/(tabs)/search/index.tsx` with full search UI
   - Connect to existing Convex property schema
   - Add map integration and filtering capabilities

3. **HIGH - Favorites System Implementation**:
   - Build favorites UI in `app/(protected)/(tabs)/favorites.tsx`
   - Implement saved properties functionality using existing schema
   - Add notification system for property updates

4. **MEDIUM - Translation Integration**:
   - Integrate DeepL/Google Translate APIs with existing i18n system
   - Build real-time translation for property descriptions
   - Enhance cultural context translation capabilities

## Appendix - Useful Commands and Scripts

### Working Commands

```bash
# Development
npm start              # Start Expo development server
npm run ios            # Run iOS simulator
npm run android        # Run Android emulator
npm run web            # Run web development server
npm run format         # Format code with Prettier

# Broken Commands (Technical Debt)
npm run lint           # FAILS - ESLint config migration needed
npm run lint:fix       # FAILS - ESLint config migration needed
```

### Project Navigation

```bash
# Key directories for development
./app/(protected)/(tabs)/        # Main app screens
./convex/                        # Backend functions and schema
./src/services/i18n/             # Internationalization
./components/                    # Reusable UI components
./.claude/docs/                  # Project documentation
```

### Architecture Decision Context

- **Database Schema**: COMPLETELY IMPLEMENTED for all PDRD features
- **Authentication**: Foundation exists, APPI migration critical
- **UI Framework**: Expo + React Native with Unistyles theming
- **State Management**: Convex real-time hooks (no Redux/Zustand needed)
- **Routing**: Expo Router v5 file-based system with authentication guards
- **Testing**: Infrastructure needs to be established
- **Deployment**: APPI-compliant hosting architecture required

**Final Assessment**: Strong foundational architecture with good database schema foundation that will need expansion. Primary gaps are APPI-compliant infrastructure migration, schema extensions for PDRD features, and UI implementation. The technical foundation is solid for development, but expect significant schema evolution during feature implementation.