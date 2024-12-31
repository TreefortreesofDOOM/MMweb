# Artist Verification System

## Overview
The verification system automatically promotes emerging artists to verified status based on measurable criteria. No manual review is required - the system tracks requirements and automatically upgrades artists when all criteria are met.

## Requirements

### 1. Profile Completeness
- Full name
- Professional bio (minimum 100 characters)
- Profile photo/avatar
- At least one social link (website or Instagram)

### 2. Portfolio Quality
- Minimum 5 artworks uploaded
- All artworks must have:
  - Complete descriptions
  - Proper pricing
  - High-quality images

### 3. Platform Engagement
- Account age > 30 days
- Minimum 50 profile views
- Community engagement score >= 50 points

## Engagement Score Calculation

The engagement score is automatically calculated using a weighted point system:

```
Total Score = (followers × 2) + 
              (profile_views × 0.5) + 
              (artwork_favorites × 1) + 
              (gallery_visits × 5)
```

### Point Values
- Each follower: 2 points
- Each profile view: 0.5 points
- Each artwork favorite: 1 point
- Each gallery visit: 5 points

### Automatic Updates
The score updates automatically when:
- Someone follows/unfollows an artist
- Someone favorites/unfavorites an artwork
- An artist receives a gallery visit
- Profile views increase

## Technical Implementation

### Database Structure
- `profiles` table:
  - `community_engagement_score`: Integer (default 0)
  - `verification_requirements`: JSONB
  - `verification_progress`: Integer
  - `verification_status`: Enum ('pending', 'in_progress', 'verified')

### Functions
1. `calculate_engagement_score(user_id UUID)`
   - Calculates total engagement score based on the weighted point system
   - Called by triggers when relevant actions occur

2. `update_profile_engagement_score()`
   - Trigger function that handles score updates
   - Triggered by follows, favorites, and gallery visits

### Triggers
- `update_engagement_score_on_follow`: Follows table (INSERT/DELETE)
- `update_engagement_score_on_favorite`: Artwork favorites (INSERT/DELETE)
- `update_engagement_score_on_visit`: Gallery visits (INSERT)

## Verification Process

1. System continuously monitors:
   - Profile completeness
   - Portfolio requirements
   - Account age
   - Profile views
   - Engagement score

2. When all requirements are met:
   - Status automatically updates to 'verified'
   - Artist type changes to 'verified'
   - New features are unlocked

3. No manual review needed:
   - All criteria are measurable
   - Updates happen in real-time
   - Process is fully automated 

## Known Issues & Improvements

### Portfolio Requirements Inconsistency
There is currently an inconsistency between how portfolio requirements are checked in different parts of the system:

#### Requirements Tab (`use-verification.ts`)
- Checks both total artworks and published artworks
- Uses client-side counting
- Constants: `MIN_ARTWORKS` and `MIN_PUBLISHED_ARTWORKS`
```typescript
const hasMinArtworks = artworkCount >= MIN_ARTWORKS;
const hasMinPublished = publishedArtworkCount >= MIN_PUBLISHED_ARTWORKS;
```

#### Overview Tab (`verification.ts`)
- Only checks total artwork count
- Uses efficient database-level counting
- Different constant: `minimumArtworks`
```typescript
const { count: artworkCount } = await supabase
  .from('artworks')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId);
```

### Recommended Solution
Combine the best aspects of both approaches:
1. Use database-level counting for efficiency
2. Check both total and published artworks
3. Use consistent constants across the system
4. Keep detailed status tracking in the database

Example implementation:
```typescript
const { data: counts } = await supabase
  .from('artworks')
  .select('status', { count: 'exact' })
  .eq('user_id', userId)
  .in('status', ['draft', 'published']);

const publishedCount = counts.filter(a => a.status === 'published').length;
const totalCount = counts.length;

const portfolio_quality = {
  complete: totalCount >= MIN_ARTWORKS && publishedCount >= MIN_PUBLISHED_ARTWORKS,
  message: totalCount < MIN_ARTWORKS
    ? `Upload at least ${MIN_ARTWORKS} artworks`
    : publishedCount < MIN_PUBLISHED_ARTWORKS
    ? `Publish at least ${MIN_PUBLISHED_ARTWORKS} artworks`
    : "Portfolio complete",
  details: {
    totalCount,
    publishedCount,
    hasMinTotal: totalCount >= MIN_ARTWORKS,
    hasMinPublished: publishedCount >= MIN_PUBLISHED_ARTWORKS
  }
};
```

This solution provides:
- Consistent requirements across the UI
- Efficient database queries
- Clear status tracking
- Better guidance for artists 