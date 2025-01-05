## Context-Aware Implementation

### Overview
The unified AI agent now features intelligent context awareness, automatically adapting its behavior and interface based on the current page context. This enhancement enables a more intuitive user experience by presenting the most relevant AI capabilities for each page type.

### Core Components

#### Context Types [x]
Located in `lib/unified-ai/types.ts`:
- `AIContext` type defines the structure for page context
- Includes route information, page type, and contextual data
- Supports profile, artwork, gallery, and general page types

#### Context Provider [x]
Located in `lib/unified-ai/context.tsx`:
- Centralized state management with React Context
- Handles page context updates through reducer actions
- Maintains conversation history and analysis results
- Provides type-safe context access through hooks

#### Context Awareness Hook [x]
Located in `lib/unified-ai/hooks/use-context-awareness.ts`:
- Monitors current route using Next.js navigation
- Determines page context automatically
- Suggests appropriate AI assistant mode
- Provides context-specific data and actions

### Adaptive Behaviors

#### Profile Pages [x]
- Automatically switches to bio extraction mode
- Displays "Extract Bio" action button
- Provides profile-specific context data
- Optimizes for profile management tasks

#### Artwork Pages [x]
- Enables artwork analysis mode
- Shows "Analyze Artwork" action button
- Includes artwork-specific context data
- Focuses on artwork-related features

#### Gallery Page
- Activates gallery assistant mode [discuss]
- Maintains chat-based interaction
- Provides gallery-specific context
- Optimizes for collection management
- Allows for likeimage analysis [discuss]

### Integration Points

#### State Management
```typescript
// Context structure in UnifiedAIState
context: {
  conversation: Message[]
  analysis: AnalysisResult[]
  pageContext: AIContext
}
```

#### Action Handling
```typescript
// Available context actions
type UnifiedAIAction =
  | { type: 'SET_PAGE_CONTEXT'; payload: AIContext }
  // ... other actions ...
```

#### Component Integration
- Unified AI Button adapts its appearance and behavior
- Panel component switches modes automatically
- Views respond to context changes
- Smooth transitions between modes

### User Experience Benefits
1. **Contextual Relevance**
   - Right tool at the right time
   - Reduced cognitive load
   - Intuitive mode switching
   - Context-appropriate suggestions

2. **Seamless Transitions**
   - Automatic mode detection
   - Smooth UI adaptations
   - Preserved context across changes
   - Consistent interaction patterns

3. **Enhanced Efficiency**
   - Quick access to relevant tools
   - Reduced manual mode switching
   - Context-aware suggestions
   - Streamlined workflows

### Technical Implementation

#### Context Detection
```typescript
// Route-based context determination
const determinePageContext = (): AIContext => {
  if (pathname.includes('/profile')) {
    return {
      route: pathname,
      pageType: 'profile',
      data: {
        profileId: pathname.split('/').pop()
      }
    }
  }
  // ... other context types ...
}
```

#### Assistant Suggestion
```typescript
// Context-based assistant suggestion
const suggestAssistant = () => {
  switch (pageContext.pageType) {
    case 'profile':
      return {
        mode: 'analysis',
        type: 'bio-extraction'
      }
    // ... other cases ...
  }
}
```

### Future Enhancements
1. **Enhanced Context Detection**
   - Deeper route analysis
   - Query parameter support
   - User preference integration
   - Historical context awareness

2. **Advanced Adaptations**
   - More specialized modes
   - Custom user preferences
   - Learning from interactions
   - Predictive suggestions

3. **Performance Optimization**
   - Efficient context updates
   - Selective re-rendering
   - State persistence
   - Transition caching 

   ---
   I'll analyze the AI agent integration documentation and review the codebase to assess the implementation progress.

First, let me search through the relevant code files:

Ran tool


Let me analyze the implementation progress based on the documentation and codebase:

1. **Core Architecture Implementation**
   - ✅ Context Provider (`context.tsx`)
   - ✅ Type Definitions (`types.ts`)
   - ✅ Context Awareness Hook (`use-context-awareness.ts`)
   - ✅ Base Hooks (`hooks.ts`)

2. **Context-Aware Features**
   - ✅ Page Type Detection
     - Profile pages
     - Artwork pages
     - Gallery pages
     - General pages
   - ✅ Context State Management
   - ✅ Automatic Mode Switching

3. **Core Functionality**
   - ✅ Chat Interface (`use-chat.ts`)
   - ✅ Analysis System (`use-analysis.ts`)
   - ✅ Utility Functions (`utils.ts`)
   - ✅ Animation System (`animations.ts`)

4. **Implementation Status**

Completed:
- Full type system implementation
- Context provider and state management
- Route-based context detection
- Mode switching logic
- Animation system
- Basic utility functions
- Hook architecture

Pending/TODO:
1. Actual Analysis Implementation
   ```typescript
   // In use-analysis.ts
   // TODO: Implement actual analysis logic
   ```

2. Chat API Integration
   ```typescript
   // In use-chat.ts
   // TODO: Implement actual chat API call
   ```

5. **Notable Design Patterns**
   - Clean separation of concerns
   - Type-safe implementations
   - React hooks-based architecture
   - Centralized state management
   - Composable animation system

6. **Technical Highlights**
   - Strong TypeScript integration
   - React Context for state management
   - Next.js routing integration
   - Modular hook-based architecture
   - Comprehensive animation system

7. **Areas for Improvement**
   1. Complete the analysis implementation
   2. Integrate with a chat API
   3. Add error handling for edge cases
   4. Implement caching for analysis results
   5. Add unit tests for core functionality

The implementation shows a solid foundation with a well-structured architecture. The core infrastructure is in place, with the main pending items being the actual integration with AI services for chat and analysis functionality. The codebase follows modern React patterns and best practices, with strong typing and separation of concerns.

Ah, I apologize for the misunderstanding. Let me outline a plan for connecting the new unified-ai interface to the existing AI features:

1. **Feature Mapping**

Current Features to Integrate:
- Gemini API Integration (`gemini.ts`)
- Artwork Analysis System (ARTWORK_ANALYSIS_PROMPTS)
- Bio Extraction (`website-bio-extractor.ts`)
- AI Roles & Personalities (`prompts.ts`, `personalities.ts`)
- Function Calling System (artwork tools and functions)
- Image Analysis Capabilities

2. **Integration Points**

A. **Context-Based Feature Access**
```
unified-ai/context.tsx -> maps to:
- Gallery Context → AI_ROLES.artExpert
- Profile Context → Bio Extractor
- Artwork Context → Artwork Analysis System
- General Context → Default Chat Mode
```

B. **Analysis Features**
```
unified-ai/use-analysis.ts -> connects to:
- Artwork Analysis Prompts
- Bio Extraction
- Image Analysis
- Function Calling for Artwork Data
```

C. **Chat Features**
```
unified-ai/use-chat.ts -> utilizes:
- AI Roles & Personalities
- Context-Aware Prompts
- Function Calling System
```

3. **Transition Strategy**

Phase 1: Core Integration
- Connect unified-ai context system to existing AI roles
- Wire up analysis features to current implementations
- Maintain existing function calling capabilities

Phase 2: UI/UX Transition
- Replace current floating assistant with unified-ai panel
- Migrate chat interfaces to new system
- Preserve all current analysis features

Phase 3: Context-Aware Features
- Implement automatic mode switching based on context
- Connect appropriate AI personalities per context
- Enable context-specific function calling

4. **Key Connection Points**

A. **Analysis System**
```
unified-ai/use-analysis.ts needs to connect to:
- ARTWORK_ANALYSIS_PROMPTS for artwork context
- website-bio-extractor for profile context
- Image analysis for artwork uploads
```

B. **Chat System**
```
unified-ai/use-chat.ts needs to connect to:
- AI_ROLES for personality selection
- Function calling system for data access
- Context-aware prompt selection
```

C. **Context System**
```
unified-ai/context.tsx needs to handle:
- Role selection based on page context
- Tool/function availability per context
- Analysis type selection
```

5. **Existing Features to Preserve**

A. **Artwork Analysis** [x]
- Description generation
- Style detection
- Technique analysis
- Keyword generation

B. **Profile Features** [x]
- Bio extraction
- Website analysis
- Profile optimization [discuss]

C. **Gallery Features**
- Artwork recommendations
- Collection analysis
- Gallery assistant mode [discuss]

6. **Implementation Priority**

1. Core Context System
   - Connect context to existing roles [x]
   - Enable feature switching [ ]

2. Analysis Integration
   - Wire up artwork analysis [ ]
   - Connect bio extractor [x]
   - Enable image analysis [ ]

3. Chat Integration
   - Implement personality system [x]
   - Enable function calling [x]
   - Connect context-aware prompts [ ]

4. UI/UX Migration
   - Replace floating assistant [x]
   - Update chat interface [x]
   - Migrate analysis views [ ]

mm-app/
├── app/
│   ├── (admin)/ [FULL-ACCESS-AND-CONTROL]
│   │   ├── admin-dashboard/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── applications/
│   │   │   └── page.tsx
│   │   ├── featured-artist/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (auth)/ [none]
│   │   ├── callback/
│   │   ├── email/
│   │   ├── forgot-password/
│   │   ├── onboarding/
│   │   ├── reset-password/
│   │   ├── role-selection/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── layout.tsx
│   ├── (protected)/
│   │   ├── artist/
│   │   │   ├── analytics/ [artist-analytics-analysis(not-implemented)]
│   │   │   ├── artworks/ [portfolio-analysis(not-implemented)]
│   │   │   ├── dashboard/ [general-dashboard-chat(not-implemented)]
│   │   │   ├── portfolio/
│   │   │   ├── qr-code/
│   │   │   └── verification/
│   │   ├── profile/
│   │   │   ├── application/ [application-chat(not-implemented)]
│   │   │   ├── edit/ [bio-extraction]
│   │   │   ├── validation/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/
│   │   ├── artists/ [patron-assistant]
│   │   ├── artwork/
│   │   │   └── [id]/ [like-artworks (function exists but need to wire up)]
│   │   ├── gallery/ [patron-assistant]
│   │   ├── vertex-test/
│   │   ├── layout.tsx
│   │   └── page.tsx