## Context-Aware Implementation

### Overview
The unified AI agent now features intelligent context awareness, automatically adapting its behavior and interface based on the current page context. This enhancement enables a more intuitive user experience by presenting the most relevant AI capabilities for each page type.

### Core Components

#### Context Types
Located in `lib/unified-ai/types.ts`:
- `AIContext` type defines the structure for page context
- Includes route information, page type, and contextual data
- Supports profile, artwork, gallery, and general page types

#### Context Provider
Located in `lib/unified-ai/context.tsx`:
- Centralized state management with React Context
- Handles page context updates through reducer actions
- Maintains conversation history and analysis results
- Provides type-safe context access through hooks

#### Context Awareness Hook
Located in `lib/unified-ai/hooks/use-context-awareness.ts`:
- Monitors current route using Next.js navigation
- Determines page context automatically
- Suggests appropriate AI assistant mode
- Provides context-specific data and actions

### Adaptive Behaviors

#### Profile Pages
- Automatically switches to bio extraction mode
- Displays "Extract Bio" action button
- Provides profile-specific context data
- Optimizes for profile management tasks

#### Artwork Pages
- Enables artwork analysis mode
- Shows "Analyze Artwork" action button
- Includes artwork-specific context data
- Focuses on artwork-related features

#### Gallery Pages
- Activates gallery assistant mode
- Maintains chat-based interaction
- Provides gallery-specific context
- Optimizes for collection management

#### General Pages
- Defaults to standard chat interface
- Offers general AI assistance
- Maintains consistent core features
- Adapts to user needs

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