# Feed System Documentation

## Overview
The feed system provides users with a personalized view of content from artists they follow, regardless of their role (patron, artist, or user).

## Implementation Status

### ✅ Already Implemented
1. **Database Infrastructure**
   - `follows` table with proper indexes and RLS policies
   - `user_events` table for tracking interactions
   - `user_sessions` table for session management
   - Analytics infrastructure for event tracking
   - Basic follow/unfollow functionality
   - Backend event tracking
   - Social actions tracking
   - Engagement scoring

2. **Security & Performance**
   - RLS policies for follows and events
   - Proper indexes for performance optimization
   - Basic rate limiting
   - Event tracking infrastructure

### 🚧 In Development
1. **Feed UI Components**
   - Feed view component
   - Feed item display
   - Pagination implementation
   - Basic feed data fetching

### 📋 Future Phases
1. **Real-time Features** (Deferred)
   - WebSocket integration
   - Real-time updates
   - Event aggregation
   - Read/unread status

2. **Advanced Features** (Post-MVP)
   - Event filtering
   - Activity types beyond artworks
   - Enhanced filtering
   - Activity analytics

## MVP Definition (Phase 1)
Core features required for initial release:
1. Basic feed view showing followed artists' new artworks
2. Simple chronological ordering
3. Pagination with "Load More"
4. Leverage existing tracked events:
   - New artwork publications
   - Artist following relationships

Dependencies:
- Existing follows table ✅
- Artwork publication events ✅
- Basic event tracking ✅

Out of Scope for MVP:
- Real-time updates
- WebSocket integration
- Read/unread status
- Event filtering
- Activity types beyond new artworks

## Technical Implementation

### 1. Database Schema
```sql
-- Follows table (Implemented)
CREATE TABLE public.follows (
    follower_id UUID REFERENCES auth.users(id),
    following_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- User Events table (Implemented)
CREATE TABLE public.user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (Implemented)
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_follows_created_at ON public.follows(created_at);
CREATE INDEX idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at);
```

### 2. Directory Structure
```
app/
├── (protected)/
│   └── feed/           # Feed-related routes
│       └── page.tsx    # Main feed page
components/
├── feed/
│   ├── feed-view.tsx   # Main feed component
│   └── feed-item.tsx   # Individual feed item
lib/
├── actions/
│   └── feed-actions.ts # Feed data fetching
└── types/
    └── feed-types.ts   # Feed-related types
```

### 3. Core Types
```typescript
// lib/types/feed-types.ts
import { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Artwork = Database['public']['Tables']['artworks']['Row'];

interface FeedItem {
  id: string;
  type: 'artwork';  // MVP only supports artwork type
  content: Artwork;
  creator: Profile;
  timestamp: string;
}

interface FeedView {
  items: FeedItem[];
  hasMore: boolean;
}

// Feed fetching utility
export const getFeed = async (
  userId: string,
  page = 1
): Promise<FeedView> => {
  const supabase = await createActionClient();
  const ITEMS_PER_PAGE = 20;
  
  // Get followed artists
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  if (!follows?.length) return { items: [], hasMore: false };

  const followedIds = follows.map(f => f.following_id);
  
  // Get latest artworks from followed artists
  const { data: items } = await supabase
    .from('artworks')
    .select(\`
      id,
      title,
      images,
      created_at,
      artist:profiles!artist_id (
        id,
        full_name,
        avatar_url
      )
    \`)
    .in('artist_id', followedIds)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return {
    items: items?.map(item => ({
      id: item.id,
      type: 'artwork',
      content: item,
      creator: item.artist,
      timestamp: item.created_at
    })) || [],
    hasMore: (items?.length || 0) === ITEMS_PER_PAGE
  };
};
```

### 4. Components
```typescript
// components/feed/feed-view.tsx
export const FeedView = () => {
  const [feed, setFeed] = useState<FeedView>({ items: [], hasMore: false });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        const feedData = await getFeed(session?.user.id, page);
        setFeed(prev => ({
          items: page === 1 ? feedData.items : [...prev.items, ...feedData.items],
          hasMore: feedData.hasMore
        }));
      } catch (error) {
        toast.error('Failed to load feed');
      } finally {
        setLoading(false);
      }
    };
    
    loadFeed();
  }, [session?.user.id, page]);

  return (
    <div className="space-y-6">
      {feed.items.map(item => (
        <FeedItem key={item.id} item={item} />
      ))}
      {loading && <FeedItemSkeleton />}
      {feed.hasMore && !loading && (
        <Button 
          onClick={() => setPage(p => p + 1)}
          variant="outline"
          className="w-full"
        >
          Load More
        </Button>
      )}
    </div>
  );
};
```

## Development Phases

### Phase 1: MVP
1. Basic feed implementation
   - Feed data fetching
   - Feed view component
   - Feed item display
   - Simple pagination
2. Error handling
3. Loading states

### Phase 2: Enhanced Features
1. Real-time Updates
   - WebSocket integration
   - Live feed updates
   - Event aggregation

### Phase 3: Advanced Features
1. Enhanced Filtering
   - Content type filters
   - Time-based filters
   - Custom feed preferences
2. Analytics & Insights
   - Engagement tracking
   - Content performance
   - User preferences

## Best Practices
1. Performance
   - Implement proper pagination
   - Optimize database queries
   - Use appropriate indexes
   - Cache feed data where possible

2. Security
   - Implement RLS for feed content
   - Validate user access to content
   - Apply rate limiting
   - Sanitize user input

3. User Experience
   - Provide loading states
   - Handle errors gracefully
   - Implement optimistic updates
   - Follow accessibility guidelines

4. Code Quality
   - Follow TypeScript best practices
   - Maintain consistent error handling
   - Write comprehensive tests
   - Document complex logic

## Next Steps
1. Implement the basic feed UI components
2. Set up the feed route and page component
3. Implement feed data fetching with pagination
4. Add error handling and loading states
5. Test the implementation thoroughly
6. Deploy and monitor performance 