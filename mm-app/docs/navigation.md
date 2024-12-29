# Navigation System

The navigation system provides a role-based, accessible, and responsive navigation structure for the application.

## Components

### MainNav
The top navigation bar component that handles user role-based navigation items.

```typescript
import { MainNav } from '@/components/nav/main-nav';

// Usage in layouts
<MainNav userRole={userRole} />
```

### SidebarNav
The sidebar navigation component that provides role-specific navigation items with collapsible functionality.

```typescript
import { SidebarNav } from '@/components/layout/sidebar-nav';

// Usage in layouts
<SidebarNav
  items={navItems}
  title="Optional Title"
  description="Optional description"
  isOpen={isOpen}
  onOpenChange={setIsOpen}
/>

// Trigger component
<SidebarNav.Trigger isOpen={isOpen} onOpenChange={setIsOpen} />
```

### Navigation Configuration

Navigation is configured in `lib/navigation/config.ts`. Each role has its own navigation structure:

```typescript
export const navigationConfig: Record<UserRole, RoleNavigation> = {
  admin: {
    navigation: [
      {
        title: 'Section Title',
        items: [
          { 
            title: 'Item Title',
            href: '/path',
            icon: IconComponent,
            isExternal?: boolean
          }
        ]
      }
    ]
  },
  verified_artist: { ... },
  emerging_artist: { ... }
};
```

## Features

### Accessibility
- Full keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader optimized
- External link indicators

### Responsive Design
- Desktop: Persistent sidebar with collapsible option
- Mobile: Sheet/drawer navigation
- Breakpoint: md (768px)
- Collapsible sidebar with smooth transitions

### Keyboard Navigation
- Tab: Navigate between items
- Enter/Space: Activate item
- Escape: Close mobile menu or collapse sidebar
- Auto-focus on active items

## Types

### NavItem
```typescript
interface NavItem {
  title: string;      // Display text
  href: string;       // URL path
  icon?: LucideIcon;  // Optional icon
  isExternal?: boolean; // External link flag
  disabled?: boolean;   // Disabled state
}
```

### NavSection
```typescript
interface NavSection {
  title: string;     // Section header
  items: NavItem[];  // Navigation items
}
```

### RoleNavigation
```typescript
type UserRole = 'admin' | 'verified_artist' | 'emerging_artist';

interface RoleNavigation {
  navigation: NavSection[];
}
```

## Layout Integration

### Admin Layout
```typescript
// components/layout/admin-layout.tsx
const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  // ... other admin items
];

<SidebarNav items={adminNavItems} />
```

### Artist Layout
```typescript
// components/layout/artist-layout.tsx
const artistNavItems = [
  {
    title: "Portfolio",
    href: "/artist/portfolio",
    icon: Image
  },
  // ... other artist items
];

<SidebarNav items={artistNavItems} />
```

## Best Practices

1. **Icons**
   - Use consistent icon sizes (h-4 w-4)
   - Mark icons as `aria-hidden="true"`
   - Include meaningful labels

2. **External Links**
   - Always use `isExternal: true` for external URLs
   - Include proper security attributes (noopener, noreferrer)
   - Visual indicator will be automatically added

3. **Sections**
   - Group related items together
   - Use clear, concise section titles
   - Limit items per section for better UX

4. **URLs**
   - Use absolute paths
   - Keep URLs consistent with route structure
   - Ensure paths exist in the application

5. **Dashboard Access**
   - Keep dashboard links in header and sidebar navigation
   - Avoid redundant dashboard links in content areas
   - Use role-specific dashboard paths (e.g., `/admin-dashboard`, `/artist-dashboard`)
   - Maintain consistent access points across the application

6. **Navigation Consistency**
   - Use standard navigation patterns across all pages
   - Keep primary navigation in header/sidebar
   - Avoid duplicating navigation items in multiple locations
   - Ensure clear hierarchy in navigation structure

## Examples

### Adding a New Section
```typescript
{
  title: 'Management',
  items: [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users
    }
  ]
}
```

### Adding an External Link
```typescript
{
  title: 'External Service',
  href: 'https://external.service.com',
  icon: ExternalLink,
  isExternal: true
}
``` 