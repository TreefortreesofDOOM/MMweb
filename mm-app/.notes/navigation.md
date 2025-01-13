# Navigation Documentation

## Overview
The platform implements a role-based navigation system with distinct features and access levels for each user type. Navigation is organized by user roles with consistent patterns for feed access and community features.

## Role-Based Navigation Structure

### 1. Admin Navigation
**Overview Section**
- Dashboard (`/admin-dashboard`)
  - Quick stats and metrics
  - Platform overview
  - Quick access to key features
- Applications (`/applications`)
  - Review artist applications
  - Process verifications
  - Manage artist status
- Featured Artist (`/featured-artist`)
  - Select featured artists
  - Manage featured duration
  - Monitor performance
- Ghost Profiles (`/ghost-profiles`)
  - Manage inactive profiles
  - Profile cleanup
  - System maintenance

### 2. Verified Artist Navigation
**Overview Section**
- Dashboard (`/artist/dashboard`)
  - Performance metrics
  - Portfolio overview
  - Quick actions
- Portfolio (`/artist/portfolio`)
  - Portfolio management
  - Artwork showcase
  - Profile customization
- Artworks (`/artist/artworks`)
  - Artwork management
  - Upload/edit works
  - Unlimited uploads

**Sales Section**
- Store (`/artist/store`)
  - Store management dashboard
  - Product listings
  - Sales overview
  - Stripe integration status
- Products
  - New Product (`/artist/store/products/new`)
    - Add artwork to store
    - Configure pricing
    - Set inventory
  - Edit Product (`/artist/store/products/[id]/edit`)
    - Update product details
    - Modify pricing
    - Adjust settings
- Analytics (`/artist/analytics`)
  - Performance tracking
  - Engagement metrics
  - Sales analytics

**Community Section**
- Feed (`/artist/feed`)
  - Network activity feed
  - Follower interactions
  - Community updates
- Messages (`/artist/messages`)
  - Direct messaging
  - Inquiry management
- QR Code (`/artist/qr-code`)
  - Gallery QR generation
  - Digital portfolio access

### 3. Emerging Artist Navigation
**Overview Section**
- Dashboard (`/artist/dashboard`)
  - Basic metrics
  - Portfolio overview
  - Limited features
- Portfolio (`/artist/portfolio`)
  - Basic portfolio
  - Limited to 10 artworks
- Artworks (`/artist/artworks`)
  - Basic artwork management
  - Limited upload quota

**Artist Section**
- Get Verified (`/artist/verification`)
  - Verification requirements
  - Progress tracking
  - Application process

**Community Section**
- Feed (`/artist/feed`)
  - Basic activity feed
  - Community updates
  - Network activity
- QR Code (`/artist/qr-code`)
  - Basic QR generation
  - Portfolio access

### 4. Patron Navigation
**Overview Section**
- Dashboard (`/patron/dashboard`)
  - Collection statistics
  - Recent activity
- Collections
  - List (`/patron/collections`)
    - Collection management
    - Artwork organization
    - Collection overview
  - View Collection (`/patron/collections/[id]`)
    - Collection details
    - Artwork display
    - Privacy settings
  - Edit Collection (`/patron/collections/[id]/edit`)
    - Update collection details
    - Modify settings
  - New Collection (`/patron/collections/new`)
    - Create collection
    - Set initial details
    - Configure privacy
- Favorites (`/patron/favorites`)
  - Saved artworks
  - Quick collection adding

**Analytics Section**
- Insights (`/patron/insights`)
  - Collection value tracking
  - Artist distribution
- History (`/patron/history`)
  - View history
  - Purchase records

**Community Section**
- Following (`/patron/following`)
  - Artist following
  - Collection subscriptions
- Messages (`/patron/messages`)
  - Artist communications
  - Purchase inquiries
- Feed (`/patron/feed`)
  - Personalized content feed
  - New artwork updates
  - Artist activity

### 5. User Navigation
**Overview Section**
- Profile (`/profile`)
  - Basic profile management
- Settings (`/settings`)
  - Account preferences
- Feed (`/feed`)
  - Basic activity feed
  - Following updates

## Icon Usage
All navigation items use Lucide icons for consistent styling:
- Dashboard: `LayoutDashboard`
- Portfolio/Gallery: `Palette`, `Gallery`, `GalleryVertical`
- Community: `Activity` (Feed), `MessageSquare` (Messages)
- Analytics: `LineChart`
- Store: `Store`
- Settings: `Settings`
- Users/Following: `Users`
- QR Code: `QrCode`
- Awards/Verification: `Award`, `BadgeCheck`
- Time: `Clock`
- Ghost Profiles: `Ghost`

## Navigation Components

### Main Navigation (`MainNav`)
```tsx
<MainNav userRole={userRole}>
  {/* Public routes */}
  <NavLink href="/gallery">Gallery</NavLink>
  <NavLink href="/artists">Artists</NavLink>
  
  {/* Role-specific dashboard */}
  {userRole && (
    <NavLink href={getDashboardPath(userRole)}>
      <LayoutDashboard className="h-4 w-4" />
      Dashboard
    </NavLink>
  )}
</MainNav>
```

### Role Navigation (`RoleNav`)
```tsx
<RoleNav config={navigationConfig[userRole]}>
  {/* Rendered based on role configuration */}
  {config.navigation.map(section => (
    <NavSection key={section.title} title={section.title}>
      {section.items.map(item => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          title={item.title}
        />
      ))}
    </NavSection>
  ))}
</RoleNav>
```

## Implementation Guidelines

### Navigation Structure
- Group items by logical sections (Overview, Community, etc.)
- Use consistent icon patterns across roles
- Maintain clear hierarchy with section titles
- Keep navigation depth to maximum 2 levels
- Use Activity icon for all feed routes
- Implement proper role-based access control

### Mobile Considerations
- Collapsible sections in mobile view
- Touch-friendly tap targets
- Proper spacing for touch interaction
- Clear visual hierarchy
- Smooth transitions

### Accessibility
- Proper ARIA labels for all items
- Keyboard navigation support
- Focus management
- Screen reader support
- Clear active states
- Proper heading structure

## Technical Implementation

### Configuration Structure
```typescript
interface NavigationItem {
  title: string
  href: string
  icon: LucideIcon
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

interface RoleNavigation {
  role: UserRole
  navigation: NavigationSection[]
}
```

### Role-Based Access
```typescript
const getDashboardPath = (role: UserRole): string => {
  switch (role) {
    case 'admin': return '/admin-dashboard'
    case 'verified_artist':
    case 'emerging_artist': return '/artist/dashboard'
    case 'patron': return '/patron/dashboard'
    default: return '/profile'
  }
}
```

## Best Practices

### Icon Usage
- Use consistent icon sizes (h-4 w-4)
- Include aria-hidden on icons
- Provide meaningful labels
- Use Lucide icons consistently
- Maintain visual hierarchy

### State Management
- Track active routes
- Handle mobile menu state
- Manage section collapse state
- Handle loading states
- Proper error states

### Performance
- Lazy load route components
- Optimize icon imports
- Minimize re-renders
- Use proper memoization
- Handle transitions smoothly

## Recent Updates
✅ **Added**
- Ghost Profiles section for Admin
- Activity icon for all feed routes
- Consistent feed access across roles
- Improved section organization
- Better icon consistency
- Detailed Store navigation for Verified Artists
- Enhanced Collections management for Patrons
- Product management routes
- Collection privacy controls
- Store integration status

🔄 **Changed**
- Simplified navigation structure
- Unified feed icon usage
- Streamlined section titles
- Improved mobile layout
- Enhanced accessibility
- Reorganized Sales section
- Updated Collections structure
- Enhanced route documentation
- Improved section organization
- Added more detailed descriptions

⚠️ **Monitoring**
- Mobile navigation performance
- Section organization feedback
- Icon usage consistency
- Feed access patterns
- Role-based routing 