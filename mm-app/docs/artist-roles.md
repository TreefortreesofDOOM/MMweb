# Artist Role System

## Overview

The platform supports two tiers of artists:

1. **Verified Artists**
   - Full platform access
   - Priority listing in artist directory
   - Verification badge
   - Full sales capabilities
   - Gallery integration features

2. **Emerging Artists**
   - Basic portfolio features
   - Community participation
   - Listed after verified artists
   - Path to verification
   - Limited feature set

## Database Structure

### Roles and Types

```sql
-- Enum types
public.user_role: 'verified_artist' | 'emerging_artist' | 'user' | 'admin'

-- Profile columns
role: public.user_role
artist_type: 'verified' | 'emerging' | null
```

### Views

```sql
public.profile_roles
- id: UUID
- mapped_role: user_role (maps 'artist' to 'verified_artist' for backward compatibility)
- original_role: user_role (original value)
```

### Helper Functions

```sql
public.is_artist(role_to_check public.user_role) returns boolean
-- Returns true for: 'artist', 'verified_artist', 'emerging_artist'
```

## Feature Access

### Verified Artists
- Full artwork management
- Sales capabilities
- Custom gallery profile
- Analytics access
- Direct collector messages
- Physical gallery integration
- Featured artwork spotlight
- Custom portfolio layout

### Emerging Artists
- Basic portfolio
- Limited artwork showcase
- Community participation
- Progress tracking
- Verification application
- Basic analytics

## Backward Compatibility

The system maintains backward compatibility through:
1. The `profile_roles` view that maps old roles to new ones
2. The `is_artist()` function that handles all artist role variations
3. RLS policies that support both old and new role names

## Role-Based Security

### RLS Policies
```sql
-- Example: Artwork updates
CREATE POLICY "Artists can update their own artworks"
ON public.artworks
FOR UPDATE
USING (
  auth.uid() = artist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND public.is_artist(role)
  )
);
```

## Verification Journey

Artists progress through the following stages:
1. Start as Emerging Artist
2. Complete verification requirements
3. Submit verification application
4. Review process
5. Upgrade to Verified Artist

Progress is tracked in the `verification_progress` table:
```sql
verification_progress
- current_step: TEXT
- steps_completed: TEXT[]
- next_steps: TEXT[]
- requirements_met: JSONB
```

## UI Components

The system includes UI components for:
- Artist badges (verified/emerging)
- Profile indicators
- Feature access controls
- Verification progress
- Role-specific layouts

## Best Practices

1. **Role Checks**
   ```typescript
   // Preferred: Use the is_artist function
   WHERE public.is_artist(role)
   
   // Instead of:
   WHERE role = 'artist'
   ```

2. **Feature Access**
   ```typescript
   // Check both role and artist_type
   const canAccessFeature = 
     profile.role === 'verified_artist' || 
     (profile.role === 'emerging_artist' && feature.isBasic);
   ```

3. **UI Display**
   ```typescript
   // Use the ArtistBadge component
   <ArtistBadge type={artist.artist_type} />
   ```

## Migration Notes

When adding new features:
1. Define access levels for both artist tiers
2. Update RLS policies using `is_artist()`
3. Use the `profile_roles` view for role mapping
4. Add feature flags to `artist_features` table
5. Update UI to reflect role-specific access 