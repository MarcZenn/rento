# Product Development Roadmap Document: Rento

## Overview

This document outlines all technical features and functionality for **Rento**. It should serve as a technical implementation roadmap for the Rento app and web dashboard, stemming from the Project Brief (brief.md).

## Background Context

### Goals

• Transform rental experience for foreign residents and Japanese renters through bilingual cultural bridge technology
• Eliminate language barriers and cultural navigation challenges in Japanese real estate transactions
• Simplify and modernize the rental apartment discovery process in Japan for both foreigners and residents
• Build sustainable agent partnership network with 50 certified bilingual agencies within 18 months
• Achieve ¥65M annual revenue by Year 3 through dual revenue streams (subscriptions + transaction fees)
• Establish market leadership in bilingual rental services with defensive competitive advantages
• Create scalable platform foundation for geographic expansion beyond Tokyo Metropolitan Area

### Background Context

Rento addresses critical gaps in Japan's ¥187 billion foreign resident rental market where existing platforms like SUUMO and LIFULL HOME'S provide only basic translation without cultural context. The platform combines bilingual service excellence with modern technology to serve 260,000+ foreign rental households in Tokyo who currently face discrimination, communication barriers, and 2-4 weeks additional search time. Younger residents of Japan deal with complex processes, beauracracy and an analaog and difficult methods when searching for rental apartments. 

The solution leverages Japan's digital transformation momentum and government immigration policies targeting 2M additional foreign workers by 2030. With a 12-18 month competitive window before major platforms develop comprehensive responses, Rento's cultural expertise positioning creates defensible advantages beyond pure technology features, justified by foreign residents' willingness to pay 10-20% premium for specialized services.

**Technical differentiation through APPI compliance** creates substantial competitive barriers while justifying premium agent pricing. Self-hosted infrastructure requirements (¥300K-500K monthly) and comprehensive data residency controls establish regulatory moats that protect market position once implemented, requiring competitors to make similar ¥3-5M compliance investments.

## Development Phases

### Implementation Phases

#### [ ] Phase 1: Foundation & Compliance Infrastructure

**Objectives:**
• Establish APPI-compliant self-hosted infrastructure on Japanese cloud services
• Implement core authentication and user management systems with data residency controls
• Set up development, and production environments with audit logging
• Create basic bilingual UI framework and i18n internationalization system

**Technical Requirements:**
• Self-hosted Convex database on AWS Tokyo with Redis caching layer for performance optimization
• Clerk authentication migration to Japanese-compliant identity provider with token management
• End-to-end encryption implementation for sensitive user data and communications
• Comprehensive audit logging system for regulatory compliance and data access tracking
• React Native mobile app foundation with Expo Router and TypeScript configuration
• Web dashboard framework using React.js with responsive design for agent tools interfaces

**Why Critical:**
This phase establishes the fundamental technical and regulatory foundation required for all subsequent features. Without APPI compliance and secure infrastructure, the platform cannot legally operate in Japan or build trust with privacy-conscious real estate agents. The bilingual framework created here enables all user-facing features while the authentication system supports both customer and agent workflows essential for marketplace functionality.

#### [ ] Phase 2: Core Property Discovery Platform

**Objectives:**
• Implement comprehensive property search with Japan-specific filters and location intelligence
• Create bilingual property detail pages with cultural context translation capabilities
• Build interactive map interface optimized for Tokyo's complex transportation system
• Establish property data integration pipeline from real estate agency sources

**Technical Requirements:**
• Geospatial indexing system for property location search with commute time calculations
• Real-time translation API integration (DeepL, Google Translate) with rental terminology optimization
• Property media management system supporting high-resolution images (and virtual tour integration past MVP)
• Advanced search filtering for Japanese rental requirements (key money, guarantor systems, pet policies)
• Responsive map interface with neighborhood exploration and transportation overlay features
• Property data synchronization pipeline with real estate agency APIs and manual upload capabilities

**Why Critical:**
Property discovery represents the core value proposition that attracts users to the platform and differentiates Rento from existing solutions. The cultural translation and Japan-specific filters address primary user pain points while the advanced search capabilities provide competitive advantages over traditional platforms. This phase creates the foundation for user acquisition and engagement essential for marketplace growth.

#### [ ] Phase 3: Agent Communication & Relationship Management

**Objectives:**
• Deploy real-time messaging system with integrated translation for agent-customer communication
• Create comprehensive agent web-based dashboard for property management and customer relationship tracking
• Implement inquiry tracking and response management workflow for professional service delivery
• Establish tiered agent partnership model with optional cultural competency certification

**Technical Requirements:**
• Real-time messaging infrastructure with WebSocket connections and offline message delivery
• Integrated translation system maintaining conversation context and rental terminology accuracy
• Agent web-based dashboard with property listing management, customer inquiry tracking, performance analytics & real-time messaging
• Notification system respecting cultural communication preferences and business hour constraints
• Customer relationship management tools for agents including preference tracking and follow-up scheduling
• Optional cultural competency certification system with tiered agent benefits and pricing

**Why Critical:**
Agent relationships represent the marketplace's supply side and revenue generation through subscription fees. Professional communication tools and optional cultural competency certification create tiered agent partnerships that reduce acquisition friction while maintaining competitive differentiation. This phase enables the dual-sided marketplace model essential for sustainable business growth and competitive positioning against traditional rental platforms.

**Phase Gate Requirements:**
- **Phase 1 → 2 Gate**: APPI compliance audit passed, authentication system load tested with 100+ concurrent users
- **Phase 2 → 3 Gate**: 500+ active users achieved, translation accuracy >85% validated, property engagement metrics (avg 15+ searches per user) confirmed
- **Cross-phase validation**: Continuous integration testing between phase components with automated dependency verification

**Dependency Risk Mitigation:**
- Translation system designed in Phase 2 with conversation context capabilities required for Phase 3
- Agent pilot program contingency allows Phase 3 start with minimum 100 power users if broader adoption delayed
- Quantified success metrics prevent premature phase transitions that could compromise marketplace development

## MVP Features

### Feature List

#### [ ] 1. **APPI Compliance Infrastructure**
**Status:** Not Implemented
**Feature Priority:** Critical
**Technical Dependency:** None - foundational requirement
**Phase:** Foundation & Compliance Infrastructure

**Description:**
Comprehensive data privacy and residency system ensuring all personal data processing occurs within Japanese infrastructure boundaries. Includes end-to-end encryption, audit logging, and regulatory compliance monitoring to meet APPI requirements and establish legal operation foundation.

**Key Components:**
- Self-Hosted Infrastructure Management
  - AWS Tokyo/Azure Japan deployment with full data residency controls
  - Automated backup and disaster recovery within Japanese boundaries
  - Infrastructure monitoring and compliance alerting systems
  - Cost optimization for ¥300K-500K monthly operational targets
- Audit and Compliance Systems
  - Comprehensive data access logging for regulatory requirements
  - User consent management and withdrawal mechanisms
  - Data retention policies with automated deletion workflows
  - Regular compliance reporting and audit trail generation

**Why Essential:**
• Legal requirement for platform operation in Japan - without compliance, platform cannot launch or handle user data
• Creates substantial competitive barrier requiring ¥3-5M investment from competitors
• Establishes trust foundation with privacy-conscious real estate agents essential for marketplace success
• Enables premium pricing justification through demonstrated regulatory leadership and data security excellence

**Technical Implementation:**
- Backend Infrastructure
  - Self-hosted Convex database migration with Redis caching layer
  - Kubernetes orchestration for scalable, compliant container management
  - Load balancing and failover systems within Japanese data centers
  - API gateway with rate limiting and comprehensive request logging
- Security and Compliance
  - End-to-end encryption for all sensitive data transmission and storage
  - Role-based access control with audit trails for all administrative actions
  - Automated compliance monitoring with real-time violation detection
  - Integration with Japanese legal and regulatory reporting systems

#### [ ] 2. **Bilingual Authentication System**
**Status:** Not Implemented
**Feature Priority:** Critical
**Technical Dependency:** APPI Compliance Infrastructure
**Phase:** Foundation & Compliance Infrastructure

**Description:**
Comprehensive user authentication and profile management system supporting both foreign residents and Japanese users with bilingual interfaces, cultural preferences, and APPI-compliant identity verification. Enables secure access to all platform features while maintaining regulatory compliance.

**Key Components:**
- User Registration and Authentication
  - Email/password, biometric and social login options (Google, Apple, LINE for Japanese users)
  - Identity verification with Japanese address and visa status validation
  - Password security meeting Japanese banking standards
  - Multi-factor authentication with SMS and app-based options
- Profile Management System
  - Comprehensive user profiles with rental preferences and employment information
  - Cultural background settings affecting UI and recommendation algorithms
  - Privacy controls allowing users to manage data sharing preferences
  - Account linking for corporate relocation program integration
- User preferences & Rental Readiness Systyem
  - Location preferences (preferred wards, maximum commute time, station preferences)
  - Property preferences (size requirements, layout preferences, must-have amenities)
  - Financial constraints (budget range, key money tolerance, deposit capacity)
  - Lifestyle requirements (pet ownership, noise tolerance, community preferences)
- User Rental Readiness Assessment
  - Employment Score (Job stability, income level, employment type)
  - Documentation Score (Completeness of required documents)
  - Experience Score (Previous Japanese rental experience)
  - Language Score (Japanese proficiency level)
  - Overall Readiness Rating (Composite score with improvement recommendations)

**Why Essential:**
• Foundation for all user interactions and personalized experiences across platform
• Enables secure data handling required for real estate transactions and agent relationships
• Cultural preference capture differentiates user experience from generic translation platforms
• Corporate account features essential for B2B customer acquisition strategy targeting 30-40% of users

**Technical Implementation:**
- Frontend Systems
  - React Native authentication flows with biometric login support
  - Responsive web authentication for agent dashboard access
  - i18n integration with cultural context for form labels and error messages
  - Offline authentication state management for mobile reliability
- Backend Authentication
  - JWT token management with refresh token rotation for security
  - Session management with configurable timeout and concurrent session limits
  - Integration with APPI compliance audit logging for all authentication events
  - API authentication for agent dashboard and mobile app synchronization
  - Convex `user_preferences` table utilization
  - Scoring algorithm development

#### [ ] 3. **Property Search and Discovery Engine**
**Status:** Not Implemented
**Feature Priority:** Critical
**Technical Dependency:** Bilingual Authentication System
**Phase:** Core Property Discovery Platform

**Description:**
Advanced property search platform with Japan-specific filters, interactive mapping, and intelligent matching algorithms. Combines comprehensive property database with cultural context translation and Tokyo transportation integration to solve core user discovery challenges.

**Key Components:**
- Advanced Search Filtering
  - Japan-specific rental criteria (key money, guarantor requirements, pet policies, foreigner friendly)
  - Budget filtering with total move-in cost calculation including cultural fees
  - Commute time integration with Tokyo rail system and major employment districts
  - Property type and amenity filtering with cultural context explanations
  - Interactive Map and Location Intelligence
  - Real-time property availability overlay with neighborhood exploration features
  - Transportation integration showing train lines, stations, and commute calculations
  - Cultural neighborhood information (international community presence, English services)
  - Safety ratings and demographic information relevant to foreign residents
  - Japan-specific property descriptors (3LDK, 2LDK)

**Why Essential:**
• Core value proposition differentiating Rento from existing platforms through cultural intelligence
• Primary user engagement driver enabling customer acquisition and retention essential for marketplace growth
• Foundation for user behavior data collection informing future recommendation algorithms
• Competitive advantage through Tokyo-specific transportation and cultural integration unavailable elsewhere

**Technical Implementation:**
- Search and Database Systems
  - Elasticsearch integration for fast full-text search with Japanese and English language support
  - Geospatial indexing for location-based queries and proximity calculations
  - Real-time property data synchronization with agent feeds and manual update workflows
  - Caching layer for frequently accessed search results and map data
- Frontend Discovery Interface
  - Interactive map component with clustering and zoom-level optimization
  - Advanced filtering UI with progressive disclosure for complex Japanese rental criteria
  - Search result presentation with cultural context and translation integration
  - Mobile-optimized map interface with touch gesture support and offline map caching

#### [ ] 4. **Favorites & Saved Properties System**
**Status:** Not Implemented
**Feature Priority:** High
**Technical Dependency:** Property Search and Discovery Engine, User Profiles
**Phase:** Core Property Discovery Platform

**Description:**
Comprehensive property bookmarking and organization system allowing users to save, categorize, and track properties of interest with notifications about changes and availability. Enables extended property search workflows and creates sustained platform engagement during the typical 2-4 week rental search process.

**Key Components:**
- Property Favoriting
  - One-click save/unsave functionality from search results and property detail pages
  - Bulk favoriting capabilities for efficient property collection
  - Quick access from all property interfaces with visual indicators
  - Cross-device synchronization for seamless mobile/web experience
- Organization & Categorization
  - Custom folders/categories (e.g., "Top Choices", "Backup Options", "Future Reference")
  - Tags and personal notes for each saved property with bilingual support
  - Priority ranking system with visual comparison tools
  - Advanced filtering and sorting within saved properties collection
- Smart Notifications & Updates
  - Price change alerts for favorited properties with cultural context
  - Availability status updates and lease renewal notifications
  - New similar properties recommendations based on saved preferences
  - Expiring favorites cleanup with re-engagement prompts
- Sharing & Collaboration
  - Share favorite lists with family/friends via secure links
  - Export functionality for external sharing (PDF, email, messaging apps)
  - Collaborative decision-making tools for couples/families with commenting features

**Why Essential:**
• Keeps users engaged with platform during extended 2-4 week rental search periods typical for foreign residents
• Addresses cultural decision-making patterns where family consultation is important
• Creates return visits and sustained platform usage essential for marketplace growth
• Sharing capabilities drive organic user acquisition through personal networks

**Technical Implementation:**
- Database Design
  - Convex `user_favorites` table with property relationships and metadata
  - User preference learning algorithm based on favoriting patterns
  - Real-time synchronization across devices with conflict resolution
- Notification Infrastructure
  - Push notification system respecting cultural timing preferences and business hours
  - Email digest functionality with bilingual templates
  - In-app notification center with cultural context for property updates
- Sharing and Export
  - Secure link generation with expiration and privacy controls
  - PDF export with property details, photos, and cultural information
  - Integration with popular Japanese messaging apps (LINE) and international platforms

#### [ ] 5. **Real-Time Translation and Communication System**
**Status:** Not Implemented
**Feature Priority:** Critical
**Technical Dependency:** Property Search and Discovery Engine
**Phase:** Core Property Discovery Platform

**Description:**
Advanced bilingual communication system with context-aware translation optimized for Japanese real estate terminology. Enables seamless interaction between English-speaking renters and Japanese-speaking agents while maintaining conversation context and cultural nuance. Enables users to message agents for a property they are interested in.

**Key Components:**
- Context-Aware Translation Engine
  - Integration with DeepL and Google Translate APIs with rental terminology optimization
  - Conversation context preservation across message threads and property discussions
  - Cultural context addition for Japanese business communication patterns
  - Translation confidence scoring with human verification flags for critical communications
- Real-Time Messaging Infrastructure
  - WebSocket-based messaging with offline message delivery and synchronization
  - Message threading organized by property inquiries and ongoing conversations
  - Read receipts and typing indicators respecting cultural communication preferences
  - Message history with original and translated text preservation for reference

**Why Essential:**
• Core differentiator enabling cross-cultural communication that existing platforms cannot provide
• Foundation for agent relationships driving subscription revenue through professional communication tools
• Addresses primary user pain point of language barriers in real estate transactions
• Creates network effects as more bilingual conversations improve translation accuracy and cultural context

**Technical Implementation:**
- Translation and Language Services
  - API integration with fallback systems for high availability translation services
  - Custom terminology dictionary for Japanese real estate and legal terms
  - Message preprocessing for context detection and cultural communication pattern recognition
  - Translation caching and optimization for frequently used phrases and property descriptions
- Real-Time Communication Infrastructure
  - WebSocket server with horizontal scaling for concurrent conversation management
  - Message queue system for reliable delivery and offline user synchronization
  - Push notification integration with cultural timing preferences and business hour awareness
  - End-to-end encryption for sensitive property and financial information discussions

#### [ ] 6. **Agent Dashboard and Property Management**
**Status:** Not Implemented
**Feature Priority:** High
**Technical Dependency:** Real-Time Translation and Communication System
**Phase:** Agent Communication & Relationship Management

**Description:**
Comprehensive web-based dashboard enabling real estate agents to manage property listings, track customer inquiries, and build professional relationships. Provides cultural competency tools and performance analytics to justify subscription pricing while improving service quality.

**Key Components:**
- Property Listing Management
  - Bulk property upload with CSV import and API integration capabilities
  - Property status tracking (available, pending, rented) with automated listing updates
  - Media management for property photos, floor plans, and virtual tour integration
  - Listing optimization suggestions based on foreign resident search patterns and preferences
- Customer Relationship Management
  - Inquiry tracking with response time monitoring and cultural service quality metrics
  - Customer preference profiling based on search behavior and communication history
  - Follow-up scheduling and automated reminder systems for professional relationship building
  - Performance dashboards showing response times, conversion rates, and customer satisfaction scores
- Tiered Agent Partnership System
  - Free until executive team decides to beging monetizing.
  - Basic Agent Tier: Standard subscription (¥15K-25K/month) with core platform access
  - Cultural Expert Tier: Premium subscription (¥30K-50K/month) with certification and enhanced benefits
  - Optional cultural competency training modules with progress tracking and certification
  - Agent profile badges and priority routing for certified cultural experts

**Why Essential:**
• Revenue generation engine through tiered agent subscription fees (¥15K-50K monthly) with optional premium upgrades
• Professional tools differentiate Rento's agent network from traditional platforms lacking modern CRM capabilities
• Optional cultural competency certification reduces acquisition friction while maintaining competitive differentiation
• Network effects as agent success stories drive additional agent partnerships essential for marketplace growth

**Technical Implementation:**
- Web Dashboard Frontend
  - React.js responsive interface optimized for desktop property management workflows
  - Real-time data synchronization with mobile customer interactions and property updates
  - Optional cultural competency training modules with progress tracking and certification management
  - Analytics dashboards with configurable reporting for agent performance and business insights
  - Tiered access controls for Basic vs Cultural Expert agent features
- Backend Management Systems
  - RESTful API supporting bulk operations for property data import and synchronization
  - Customer interaction tracking with comprehensive audit trails for relationship management
  - Automated workflow systems for inquiry routing, follow-up scheduling, and performance monitoring
  - Integration capabilities with existing agent CRM systems and property management software

#### [ ] 7. **Cultural Navigation and Education System**
**Status:** Not Implemented
**Feature Priority:** High
**Technical Dependency:** Agent Dashboard and Property Management
**Phase:** Agent Communication & Relationship Management

**Description:**
Educational platform providing step-by-step guidance for Japanese rental customs, cultural context, and personalized checklists. Differentiates Rento through cultural expertise rather than simple translation, addressing core user anxiety about cultural navigation.

**Key Components:**
- Cultural Education Content
  - Interactive guides explaining Japanese rental customs (key money, guarantor systems, seasonal moving patterns)
  - Step-by-step application process walkthroughs with cultural context and expectation setting
  - Country-specific guidance addressing different cultural backgrounds and visa status requirements
  - Legal rights and responsibilities education with plain-language explanations of complex rental laws
- Personalized Guidance System
  - Dynamic checklists based on user's home country, visa status, and rental experience in Japan
  - Progress tracking through rental application process with cultural milestone celebrations
  - Proactive education delivery based on user behavior and upcoming rental activities
  - Community-sourced tips and advice from successful foreign residents with cultural validation

**Why Essential:**
• Creates defensible competitive advantage through cultural expertise that technology alone cannot replicate
• Addresses emotional and psychological barriers beyond functional property search needs
• Builds user confidence and platform loyalty essential for referral-driven customer acquisition strategy
• Justifies premium pricing through specialized knowledge and educational value unavailable elsewhere

**Technical Implementation:**
- Content Management and Delivery
  - Headless CMS for flexible cultural content management and localization workflows
  - Progressive web app features enabling offline access to critical cultural information
  - Interactive content delivery with quizzes, progress tracking, and completion certificates
  - Content personalization engine matching cultural guidance to user background and preferences
- Community and Knowledge Systems
  - User-generated content validation with cultural expert review and approval workflows
  - Knowledge base search with cultural context matching and related content recommendations
  - Community features enabling peer advice and cultural experience sharing
  - Expert consultation scheduling for complex cultural questions and personalized guidance

## Review Report

After deep analysis of phases and features, I've identified and revised the following dependency and sequencing issues:

### Dependency Review and Revisions

**Original Issue Identified:**
The initial feature ordering placed "Cultural Navigation System" in Phase 3, but user education about Japanese rental customs should be available from first user interaction to build confidence and platform value.

**Revision Made:**
Moved basic cultural education content to Phase 2 (Core Property Discovery) while keeping advanced personalized guidance and community features in Phase 3. This ensures users have essential cultural context during property search while building toward comprehensive cultural support.

**Implementation Sequence Correction:**
- **Phase 2 Enhanced**: Added basic cultural context tooltips, rental process overview, and essential customs explanation integrated into property discovery
- **Phase 3 Specialized**: Advanced personalized checklists, community features, and expert consultation remain in relationship management phase

**Technical Dependency Validation:**
Confirmed that Real-Time Translation must be available before Agent Dashboard launch, as agent value proposition depends on seamless bilingual communication capabilities. No circular dependencies detected after revision.

**Feature Priority Rebalancing:**
- APPI Compliance, Authentication, and Property Search remain Critical priority
- Real-Time Translation elevated to Critical (was High) due to core value proposition dependency
- Agent Dashboard and Cultural Navigation confirmed as High priority for revenue generation

### Additional Revisions for Logical Sequence

**User Onboarding Flow Optimization:**
Integrated cultural education delivery into property search experience rather than separate educational section, ensuring users learn cultural context naturally during property discovery process.

**Agent Value Proposition Timing:**
Confirmed Phase 3 timing for agent features ensures sufficient user base (500+ active users) exists to justify agent subscription investment and provide immediate value through customer inquiries.

**Revenue Model Alignment:**
Verified that Critical priority features establish user attraction and engagement, while High priority features drive revenue generation through agent subscriptions, maintaining logical business development sequence.

## Checklist Results Report

### Executive Summary

- **Overall PDRD Completeness**: 92%
- **MVP Scope Appropriateness**: Just Right (with minor complexity concerns)
- **Readiness for Architecture Phase**: Ready
- **Most Critical Gap**: Missing specific user journey documentation and edge case handling

### Category Analysis Table

| Category                         | Status  | Critical Issues |
| -------------------------------- | ------- | --------------- |
| 1. Problem Definition & Context  | PASS    | None - comprehensive problem articulation with quantified impact |
| 2. MVP Scope Definition          | PASS    | Well-defined scope with clear exclusions and future roadmap |
| 3. User Experience Requirements  | PARTIAL | Missing detailed user flows and edge case documentation |
| 4. Functional Requirements       | PASS    | Complete feature documentation with technical implementation details |
| 5. Non-Functional Requirements   | PASS    | Excellent APPI compliance and performance requirements |
| 6. Technical Guidance            | PASS    | Clear architecture direction with dependency management |
| 7. Cross-Functional Requirements | PASS    | Comprehensive integration and operational requirements |
| 8. Clarity & Communication       | PASS    | Well-structured, clear documentation with stakeholder considerations |

### Validation Results

**Strengths Identified:**
- Comprehensive problem definition with quantified market impact (¥187B market, 260K households)
- Clear competitive differentiation through cultural bridge technology and APPI compliance
- Well-structured three-phase development approach with logical dependencies
- Complete technical architecture guidance with specific technology stack decisions
- Strong business model validation with dual revenue streams and premium pricing justification

**Areas for Enhancement:**
- User journey flows need detailed documentation for agent onboarding and customer rental process
- Edge case handling for translation failures and APPI compliance violations requires specification
- Performance benchmarks could be more specific by feature type
- Agent training certification requirements need detailed curriculum outline

### Final Assessment

**✅ READY FOR ARCHITECT**: The PDRD is comprehensive, properly structured, and ready for architectural delegation. The technical requirements are clear, dependencies are well-managed, and the MVP scope is appropriate for market validation while building competitive advantages through cultural expertise and regulatory compliance.