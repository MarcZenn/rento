# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

We will build a mobile application called Rento (with a web dashboard for property entry/management). The purpose of this application is to allow foreigners and native residents to find, evaluate and discover rental properties in Japan via a simple mobile app with a clean and simple, yet informative, UI/UX. We will launch this app in Tokyo first. It is very important that this app is fully internationalized and bilingual (English and Japanese) with future multilingual support. 

Rento is a React Native rental platform targeting the Japanese market, specifically Tokyo. The app connects foreign residents with rental properties and agents who can provide bilingual support and foreigner-friendly rental options.

## Problem

Japan’s property rental market is largely inaccessible for foreigners and notoriously complex in general. At the same time, Japan thrives on trust. Due to this and other factors, foreigners often face discrimination, excessive upfront costs (key money, deposits), and language barriers. Young Japanese renters also struggle with outdated processes, lack of transparency and trust, and overwhelming documentation.

## Proposed Solution

Rento simplifies the rental process, removes language and cultural barriers, and modernizes property discovery and communication — all in one unified platform.


## Company Description

**Vision**: To become the most trusted, go-to rental property discovery platform in Japan. We want to empower renters (native and foreign) as well as property owners to do business with confidence, clarity, and above all, trust. 

**Mission**: To simplify and bring trust and clarity to the apartment rental experience in Japan for both foreign renters, native Japanese renters and property owners. 

**Values**: 
- Trust - Fostering trust between renters, agents and property owners by being reliable, open and compliant with local rules and regulations. 
- Service - Prioritizing a positive and valuable experience for all users by exceeding their needs and expectations.
- Community - Giving back to Japanese communities we serve and promoting positive social impact and inclusion. 
- Integrity - Exemplifying honesty, transparency and ethical behavior in all company actions and decisions.


## Tech Stack
- **Frontend**: React Native with Expo (SDK 53)
- **Routing**: Expo Router v5 (file-based routing)
- **Backend**: Convex (real-time backend with TypeScript)
- **Authentication**: Clerk
- **Styling**: react-native-unistyles v3 with custom theme system
- **Internationalization**: react-i18next with English/Japanese support
- **Error Tracking**: Sentry
- **State Management**: Convex queries/mutations
- **Native Platforms**: iOS and Android

### No Test Suite
This project does not currently have a test suite configured.

## Architecture

### File Structure
```
├── app/                    # Expo Router pages (file-based routing)
│   ├── (auth)/            # Authentication flow pages
│   ├── (protected)/       # Authenticated user pages
│   │   └── (tabs)/        # Tab navigation
│   └── (public)/          # Public pages
├── src/
│   ├── theme/             # Unistyles theme system
│   ├── services/          # External service integrations
│   │   ├── clerk/         # Authentication schemas/hooks
│   │   └── i18n/          # Internationalization setup
│   ├── assets/            # Static assets (fonts, images)
│   └── constants/         # App constants
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── convex/               # Backend schema, queries, mutations
└── ios|android/          # Native platform code
```

### Key Architecture Patterns

**Backend Schema Design**:
The Convex schema uses a hybrid internationalization approach:
- Database translation tables for key UI content and property metadata
- AI-powered translation for dynamic user-generated content
- Comprehensive relational design for Japanese real estate (prefectures, wards, agencies, properties)
- Must be self-hosted (not yet implemented)

**Authentication Flow**:
- Clerk handles authentication with token caching
- Convex integrates with Clerk for authenticated queries/mutations
- User profiles stored in Convex with employment status and rental preferences

**Styling System**:
- Unistyles v3 for React Native styling with theme support
- Custom theme system in `src/theme/` with colors, fonts, breakpoints
- Inter and Noto Sans JP fonts for English/Japanese text

**Internationalization**:
- react-i18next with AsyncStorage persistence
- Device locale detection with fallback to English
- Japanese (ja) and English (en) supported
- Translation files in `src/services/i18n/locales/`

## Important Development Notes

### Environment Variables Required
- `EXPO_PUBLIC_CONVEX_URL`: Convex backend URL
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk authentication
- `EXPO_PUBLIC_SENTRY_DSN`: Error tracking
- `CLERK_FRONTEND_API_URL`: Clerk frontend API (for convex auth config)

### Schema Considerations
- Convex doesn't support unique constraints at schema level
- Unique fields implemented via indexes + application logic
- All timestamps stored as ISO8601 strings
- Translations stored in separate `*_translations` tables

### Routing
- Uses Expo Router v5 file-based routing
- Grouped routes with `(groupName)` folders
- Authentication states managed through `(auth)`, `(protected)`, `(public)` groups
- Tab navigation defined in `(tabs)/_layout.tsx`

### Real Estate Domain
The app models Japanese rental market specifics:
- Key money, deposit, guarantor fees
- Prefecture/ward location system
- Foreigner-friendly and bilingual support flags
- Floor plans (1K, 1DK, 1LDK, etc.)
- Station walking distance
- Property tags for filtering

### Performance & Monitoring
- Sentry configured for error tracking and performance monitoring
- Mobile replay integration enabled
- User context automatically set on authentication
- Navigation tracking integrated

## Potential business partnerships:

- Weave Living - `https://www.weave-living.com/`
- The Founder Institute - `https://fi.co/join`
- E-Housing Japan - `https://e-housing.jp/`
- Unistyles includes custom native code, which means it does not support Expo Go. Therefore the app cannot be run locally use Expo Go. Instead we must create a development build and run the development build.

## Additional Context

- Much research has been conducted and new information has come to light that affects how we will launch and develop this startups business as well as how the product itself should be architected and coded. Review the `@.claude/assets/legal_compliance_analysis.md` file, the `@.claude/assets/tokyo_rental_market_analysis.md` file, the `@.claude/assets/bizdev_checklist.md` file and `the @.claude/assets/feature_list.md` file and keep a summary of each as context.