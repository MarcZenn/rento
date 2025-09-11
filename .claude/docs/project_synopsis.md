# Business Concept

A mobile application named Rento. The purpose of this application is to allow foreigners and native residents to find, evaluate and discover rental properties in Japan via a simple mobile app with a clean and simple, yet informative, UI/UX. 

# Logline 

Rento is real-estate mobile app that helps foreigners and native residents discover rental apartments in Japan.

## Core Requirements
- The app must be fully compliant with Japanese Data Protection Laws and 
- The app must be fully internationalized and bilingual (English and Japanese) with future multilingual support.
- The app must be accompanied by a web dashboard for real-estate agent property entry & management.
- The app must be intuitive and simple to use. It must appeal to both Japanese natives and foreigners.
- The app must have map-based, apartment discovery and search with various filtering options relevant to the Japanese real-estate rental market.
- App will be launched in Tokyo first.

## Market Problem

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

## Potential business partnerships:

- Weave Living - `https://www.weave-living.com/`
- The Founder Institute - `https://fi.co/join`
- E-Housing Japan - `https://e-housing.jp/`
- Unistyles includes custom native code, which means it does not support Expo Go. Therefore the app cannot be run locally use Expo Go. Instead we must create a development build and run the development build.

## Existing Technical Context

A good deal of code has already been written for this project. 

### Current Tech Stack (may change)
- **Frontend**: React Native with Expo (SDK 53)
- **Routing**: Expo Router v5 (file-based routing)
- **Backend**: Convex (real-time backend with TypeScript)
- **Authentication**: Clerk
- **Styling**: react-native-unistyles v3 with custom theme system
- **Internationalization**: react-i18next with English/Japanese support
- **Error Tracking**: Sentry
- **State Management**: Convex queries/mutations
- **Native Platforms**: iOS and Android

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