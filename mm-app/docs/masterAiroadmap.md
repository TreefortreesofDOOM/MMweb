# Master AI Roadmap

## Overview
This document provides a comprehensive roadmap for our AI agent system implementation, combining UI/UX design guidelines and technical specifications. It follows the project's .cursorrules guidelines and reflects the current state of implementation.

## Table of Contents
1. [Implementation Status](#implementation-status)
2. [Core Architecture](#core-architecture)
3. [Technical Implementation](#technical-implementation)
4. [UI/UX Design Guidelines](#uiux-design-guidelines)
5. [Integration Strategy](#integration-strategy)
6. [Future Enhancements](#future-enhancements)

## Implementation Status

### Core AI Infrastructure

1. **Gemini Integration** ✓
   - Google Gemini Pro Vision for multimodal capabilities
   - Function calling system for artwork operations
   - Comprehensive error handling and logging
   - Safety settings and content filtering
   - Chat history management

2. **Embeddings System** ⚠️
   - ✓ Text embedding generation using Gemini
   - ✓ Supabase integration for storage
   - ✓ Similarity search functionality
   - ✓ Batch processing capabilities
   - ⚠️ Image embeddings (pending)

3. **AI Actions** ✓
   - Server actions for artwork analysis
   - Parallel processing of analysis tasks
   - Embedding updates and management
   - Similar artwork discovery

4. **AI Integration**
   - [x] Google Cloud Project setup
   - [x] Basic artwork analysis
   - [x] Image processing pipeline
   - [x] Style detection
   - [x] Description generation
   - [x] Smart search suggestions
   - [x] Personalized recommendations
   - [x] Portfolio optimization tips
   - [x] Market trend insights
   - [x] Content moderation
   - [x] Marketing materials generation
   - [x] Google Gemini integration
   - [x] AI chat assistants
     - [x] Unified AI interface
     - [x] Context-aware responses
     - [x] Quick prompts system
       - [x] Gallery-specific prompts
       - [x] Artist-specific prompts
       - [x] Patron-specific prompts
       - [x] Profile-specific prompts
     - [x] Real-time AI responses
   - [x] Real-time AI responses

### Assistant Implementations

1. **Artwork Analysis Assistant** ✓
   ```typescript
   // Core functionality
   export async function analyzeArtwork(formData: FormData) {
     const [description, style, techniques, keywords] = await Promise.all([
       getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.description, { imageUrl }),
       getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.style, { imageUrl }),
       getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.techniques, { imageUrl }),
       getGeminiResponse(ARTWORK_ANALYSIS_PROMPTS.keywords, { imageUrl })
     ]);
     // Process results...
   }
   ```

2. **Gallery Assistant** ✓
   - Chat-based interface
   - Artwork and artist information queries
   - Style and technique explanations
   - Context-aware responses

3. **Artist Assistant** ✓
   - Professional development guidance
   - Portfolio management assistance
   - Pricing optimization
   - Custom personality system

4. **Patron Assistant** ✓
   - Tabbed interface with chat
   - Pre-defined prompts
   - Educational content delivery
   - Real-time streaming

5. **Bio Assistant** ✓
   - Automated bio extraction
     - Website scraping implementation
     - Comprehensive selector system
     - Fallback extraction patterns
     - Error recovery strategies
   - Smart content parsing
     - Content validation
     - Format standardization
     - Length optimization
   - Profile edit integration
     - Direct profile updates
     - Server action integration
     - State synchronization
   - Error handling
     - Extraction failures
     - Update failures
     - User feedback
   - Implementation Details:
     ```typescript
     // Core Components
     - UnifiedAI Panel
       - Immediate visibility on trigger
       - Real-time analysis display
       - Apply button integration
       - Toast notifications

     // Data Flow
     1. Website Input
        - Trigger: Extract Bio button
        - Action: Opens UnifiedAI panel
        - State: Sets analysis mode

     2. Analysis Process
        - Scraping: website-bio-extractor.ts
        - Selectors: Comprehensive DOM targeting
        - Response: Structured bio content

     3. Result Display
        - Component: unified-ai-analysis-view
        - State: UnifiedAI context
        - UI: Card with apply option

     4. Profile Update
        - Action: updateProfileBio server action
        - Feedback: Toast notifications
        - Refresh: Page reload on success

     // Error States
     - Extraction: Fallback patterns
     - Update: Error notifications
     - Recovery: Retry options
     ```

   - Technical Stack:
     - Next.js Server Actions
     - React Context for state
     - Tailwind for styling
     - Toast for notifications
     - TypeScript for type safety

   - User Experience:
     - Immediate panel opening
     - Real-time analysis feedback
     - Clear success/error states
     - Seamless profile updates

## Core Architecture

### Context-Aware System
```typescript
// Core context types
export type AIContext = {
  route: string
  pageType: 'profile' | 'artwork' | 'gallery' | 'general'
  data?: {
    websiteUrl?: string
    artworkId?: string
    galleryId?: string
    profileId?: string
  }
}

// State management
export interface UnifiedAIState {
  mode: AIMode
  isOpen: boolean
  isMinimized: boolean
  context: {
    conversation: Message[]
    analysis: AnalysisResult[]
    pageContext: AIContext
  }
}
```

### Directory Structure
```
mm-app/
├── components/unified-ai/     # UI Components
├── lib/
│   ├── ai/                   # Core AI Implementation
│   ├── unified-ai/           # Unified System
│   └── actions/              # Server Actions
```

## Technical Implementation

### 1. Core Components
- **AI Integration**: Google Gemini Pro Vision
- **State Management**: React Context
- **Data Storage**: Supabase
- **API Layer**: Server Actions

### 2. Type System
```typescript
// Message handling
export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Analysis results
export interface AnalysisResult {
  type: string
  content: string
  timestamp: string
  results: {
    summary: string
    details: string[]
  }
}
```

### 3. Error Handling
```typescript
// Standard error pattern
try {
  // Operation
} catch (error: any) {
  console.error('Operation failed:', error);
  return { error: error.message || 'Unknown error' };
}
```

## UI/UX Design Guidelines

### 1. Component Architecture
- Floating button with context awareness
- Expandable panel system
- Progressive disclosure pattern
- Accessibility-first design

### 2. Animation System
```typescript
// Framer Motion integration
const transitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}
```

### 3. Interaction Patterns
- Context-based mode switching
- Smooth transitions
- Haptic feedback
- Keyboard navigation

## Integration Strategy

### Phase 1: Core Integration (Complete) ✓
1. **Context System**
   - ✓ Map unified-ai context to roles
   - ✓ Wire up analysis features
   - ✓ Preserve function calling
   - ✓ Bio extraction context
     - Page context with website URL
     - Analysis mode management
     - Result persistence

2. **Feature Integration**
   - ✓ Connect Gemini API
   - ✓ Implement artwork analysis
   - ✓ Enable bio extraction
     - Website scraping system
     - Profile update actions
     - Real-time feedback
   - ⚠️ Setup image analysis

### Phase 2: UI/UX Migration (Complete) ✓
1. **Interface Updates**
   - ✓ UnifiedAI panel system
     - Floating button
     - Expandable panel
     - Analysis view
     - Apply functionality
   - ✓ Upgrade chat interface
   - ✓ Implement new analysis views

2. **Animation System**
   - ✓ Add fluid transitions
     - Panel open/close
     - Analysis states
     - Result display
   - ✓ Implement microinteractions
   - ✓ Enable haptic feedback

### Phase 3: Advanced Features (Planned)
1. **Context-Aware Enhancements**
   - Automatic mode switching
   - Personality adaptation
   - Smart suggestions

2. **Performance Optimization**
   - State persistence
   - Transition caching
   - Lazy loading

## Future Enhancements

### 1. Technical Improvements
- [ ] Implement image embeddings
- [ ] Enhance conversation memory
- [ ] Add comprehensive testing
- [ ] Optimize performance

### 2. Feature Enhancements
- [ ] Advanced query capabilities
- [ ] Enhanced context awareness
- [ ] Voice interface integration
- [ ] AR/VR capabilities

### 3. Documentation
- [ ] Add JSDoc comments
- [ ] Create API documentation
- [ ] Add usage examples
- [ ] Create troubleshooting guide

## Success Metrics

### 1. Performance KPIs
- Time to first interaction < 200ms
- Animation smoothness > 60fps
- API response time < 500ms
- Memory usage < 100MB

### 2. User Experience Metrics
- User engagement +30%
- Task completion rate +25%
- Error rate < 1%
- User satisfaction > 90%

## Maintenance Plan

### 1. Regular Updates
- Weekly dependency updates
- Monthly security audits
- Quarterly performance reviews
- Annual architecture review

### 2. Monitoring
- Error tracking
- Performance metrics
- Usage analytics
- User feedback

## Development Guidelines

### 1. Code Quality
- Follow TypeScript best practices
- Maintain consistent error handling
- Use proper type definitions
- Follow DRY principles

### 2. Testing Strategy
- Unit tests for core logic
- Integration tests for features
- E2E tests for flows
- Performance benchmarks

### 3. Documentation
- Keep inline documentation updated
- Maintain API documentation
- Document complex algorithms
- Create usage examples

## Conclusion
This roadmap provides a comprehensive guide for implementing and maintaining our AI agent system. It combines technical requirements with user experience considerations while adhering to our established coding standards and best practices. Regular reviews and updates will help keep the project on track and aligned with our goals. 

### Implementation Status and Route Details

1. **AI Assistant System Implementation** [✅ Complete]
   - Quick Prompts System:
     - Architecture:
       - ✅ Centralized prompt management in `lib/unified-ai/prompts.ts`
       - ✅ Context-aware prompt selection
       - ✅ Role-based filtering
       - ✅ Dynamic prompt updates
     - Features:
       - ✅ Gallery Context
         - Exhibition highlights
         - Trending artworks
         - Artist discovery
         - Collection navigation
         - Art style exploration
         - Guided tours
       - ✅ Artist Context
         - Portfolio optimization
         - Pricing guidance
         - Description improvements
         - Market trend analysis
         - Promotion strategies
         - Artist statement help
       - ✅ Patron Context
         - Artwork style analysis
         - Uniqueness evaluation
         - Trend comparison
         - Similar artwork discovery
         - Artist perspective insights
         - Collection recommendations
       - ✅ Profile Context
         - Bio optimization
         - Achievement highlighting
         - Background enhancement
         - Style description
         - Portfolio organization
         - Professional presentation
     - Technical Implementation:
       - ✅ Unified chat interface with tabbed navigation
       - ✅ Real-time prompt suggestions
       - ✅ Context persistence
       - ✅ Usage analytics tracking
       - ✅ Performance optimization
       - ✅ Error handling
     - Integration Points:
       - ✅ AI response system
       - ✅ Context management
       - ✅ User preferences
       - ✅ Analytics tracking
       - ✅ Event logging 



Database Roles          AI Chat Roles
-------------          -------------
non-user               gallery
emerging_artist  --->  artist
verified_artist  --->  artist
user                   patron
admin                  (missing)

       Database Roles          AI Chat Roles
-------------          -------------
non-user               gallery
emerging_artist  --->  artist
verified_artist  --->  artist
patron           --->  patron
admin           --->   admin
user            --->   patron (default)

## Role and Persona System

### 1. Database Roles
```typescript
// Core role structure
type UserRole = 
  | 'admin'            // Platform administrators
  | 'emerging_artist'  // Artists starting out
  | 'verified_artist'  // Verified artists
  | 'patron'          // Active collectors
  | 'user'            // Browse-only users
```

### 2. Assistant Types and Personas
```typescript
// Assistant Types (UI/Route level)
type AssistantType = 'gallery' | 'artist' | 'patron'

// AI Assistant personas (System level)
type AssistantPersona = 
  | 'curator'    // Gallery and exhibition guidance
  | 'mentor'     // Artist professional development
  | 'collector'  // Art collection and appreciation
  | 'advisor'    // Platform oversight and moderation

// Assistant Type -> Database Role -> Persona mapping flow:
gallery -> admin -> advisor
artist -> verified_artist -> mentor
patron -> patron -> collector
```

### 3. Role Selection Flow
- **Path Options**:
  ```typescript
  const pathOptions = {
    artist: {
      role: 'emerging_artist',
      features: ['Portfolio', 'Sales', 'Tools']
    },
    collector: {
      role: 'patron',
      features: ['Collecting', 'Following', 'Tools']
    },
    browser: {
      role: 'user',
      features: ['Browse', 'Follow', 'Basic']
    }
  }
  ```

### 4. Context Awareness
```typescript
type ViewContext = 'profile' | 'artwork' | 'gallery' | 'general'

type AIContext = {
  route: string
  pageType: ViewContext
  persona: AssistantPersona
  data?: {
    websiteUrl?: string
    artworkId?: string
    galleryId?: string
    profileId?: string
    personaContext?: string
    characterPersonality?: string
  }
}
```

### 5. Implementation Details
- ✓ Database role enum update
- ✓ Role selection UI with three paths
- ✓ Persona mapping system
- ✓ Context-aware AI behavior
- ✓ Role-based feature access
- ✓ Assistant type to persona mapping
- ✓ Character personality system
- ✓ Context-aware responses

### 6. Migration Path
1. ✓ Add patron role to database
2. ✓ Update role selection interface
3. ✓ Implement persona mapping
4. ✓ Enhance context awareness
5. ✓ Update analytics tracking
6. ✓ Integrate character personalities
7. ✓ Add context-aware suggestions

### Role and Persona Mapping

```typescript
// Database Role -> Assistant Persona
const personaMapping = {
  admin: 'advisor',        // Platform oversight
  emerging_artist: 'mentor',  // Professional development
  verified_artist: 'mentor',  // Professional development
  patron: 'collector',     // Art collection
  user: 'collector'        // Basic exploration
} as const

// Assistant Type -> Database Role mapping
assistantType === 'gallery' ? 'admin' : 
assistantType === 'artist' ? 'verified_artist' : 
'patron'

// View Context -> Default Persona
const viewPersona = {
  profile: 'mentor',
  artwork: 'collector',
  gallery: 'curator',
  general: 'collector'
} as const
```

This mapping ensures:
- Clear separation of database roles and AI personas
- Context-aware AI assistance
- Role-appropriate interactions
- Character personality integration
- Consistent behavior across the application

Based on the documentation and our changes, here are the remaining implementation tasks:

1. **Database Updates**:
   - Create migration for `is_collector` helper function
   - Update existing RLS policies to include patron role
   - Add indexes for role-based queries
   - Update profile_roles view for new role mapping

2. **Role Selection UI**:
   - Update navigation based on selected role
   - Add role transition flows (user → patron)
   - Add role-specific onboarding steps
   - Implement feature discovery for each role

3. **Feature Access**:
   - Implement `RoleBasedFeature` component
   - Add role-based route protection
   - Create feature flags system
   - Add upgrade prompts for restricted features

4. **AI Integration**:
   - Update UnifiedAI prompts for each persona
   - Add role-specific conversation starters
   - Implement persona-based response formatting
   - Add context-aware suggestions

5. **Analytics**:
   - Add role conversion tracking
   - Track feature usage by role
   - Monitor role distribution
   - Add role-based engagement metrics

6. **Testing**:
   - Add role transition tests
   - Test feature access matrix
   - Add persona behavior tests
   - Test RLS policies
