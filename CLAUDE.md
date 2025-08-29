# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Rento is a React Native rental platform targeting the Japanese market, specifically Tokyo. The app connects foreign residents with rental properties and agents who can provide bilingual support and foreigner-friendly rental options.

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

## Development Commands

### Essential Commands
- **Start development server**: `npm start` or `yarn start`
- **Run on iOS**: `npx expo run:ios` 
- **Run on Android**: `npm run android`
- **Lint code**: `npm run lint`
- **Fix lint issues**: `npm run lint:fix`
- **Format code**: `npm run format`

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