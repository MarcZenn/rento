## TECHNICAL ARCHITECTURE & CONSIDERATIONS

### Self-Hosting Infrastructure Requirements
- **Convex Deployment:** Self-hosted Convex on AWS Tokyo/Azure Japan/GCP Tokyo
- **Authentication:** Self-hosted Clerk or migration to Japanese-compliant identity provider
- **Data Localization:** All personal data processing within Japanese boundaries
- **Compliance Framework:** APPI-compliant data handling and audit systems

### Performance & Scalability Infrastructure
- **Caching Strategy:** Redis for search results, translations, and session management
- **CDN & File Storage:** CloudFlare R2 or AWS S3 with Japanese edge locations
- **Database Optimization:** Geospatial indexing, full-text search, query optimization
- **Background Processing:** Queue system for translation, notifications, and analytics
- **WebSocket Scaling:** Real-time messaging and notification infrastructure

### Existing Infrastructure Leverage
- **Convex Schema:** Comprehensive database design supports most features (requires self-hosting migration)
- **Authentication:** Clerk integration provides foundation (requires compliance migration)
- **Internationalization:** i18n system enables bilingual implementation
- **Styling System:** Unistyles provides consistent theming
- **Mobile Platform:** Expo Router enables rapid deployment

### Development Dependencies & Complexity
- **Infrastructure First:** Self-hosting setup must precede all feature development
- **Performance Optimization:** Search, translation, and real-time features require careful optimization
- **Third-Party Integration:** Translation APIs, mapping services, payment processing
- **Compliance Integration:** APPI compliance must be built into every feature
- **Monitoring & Observability:** Essential for production system reliability

### Data Flow & Privacy Architecture
- **Data Residency:** All data processing within Japanese infrastructure
- **Encryption:** End-to-end encryption for sensitive user data
- **Audit Trails:** Comprehensive logging for compliance and security
- **API Management:** Rate limiting, authentication, and monitoring for all integrations
- **Cross-Border Prevention:** Strict controls to prevent data leaving Japan

### Scalability & Growth Planning
- **Multi-Tenant Architecture:** Support for multiple markets within Japan
- **Horizontal Scaling:** Database sharding and application scaling strategies
- **Performance Monitoring:** Real-time performance tracking and optimization
- **Geographic Expansion:** Framework for expanding to other Japanese cities
- **Load Testing:** Comprehensive testing for peak usage scenarios

## Existing Technical Context

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

### Themeing
- Using Unistyles V3 for theme setup
- Theme configuration, styles, fonts and setup can be found in `src/theme`
- Unistyles includes custom native code, which means it does not support Expo Go. Therefore the app cannot be run locally use Expo Go. Instead we must create a development build and run the development build.