# Navigation System

The navigation system provides a role-based, accessible, and responsive navigation structure for the application.

## Components

### RoleNav
The main wrapper component that handles both desktop and mobile navigation states.

```typescript
import { RoleNav } from '@/components/nav/role-nav';

// Usage in layouts
<RoleNav role="admin">{children}</RoleNav>
<RoleNav role="artist">{children}</RoleNav>
```

### Navigation Configuration

Navigation is configured in `lib/navigation/config.ts`. Each role has its own navigation structure:

```typescript
const navigationConfig = {
  admin: {
    role: 'admin',
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
  }
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
- Desktop: Persistent sidebar
- Mobile: Sheet/drawer navigation
- Breakpoint: md (768px)

### Keyboard Navigation
- Tab: Navigate between items
- Enter/Space: Activate item
- Escape: Close mobile menu
- Auto-focus on active items

## Adding New Navigation Items

1. Update the configuration in `lib/navigation/config.ts`:

```typescript
export const navigationConfig = {
  role: {
    navigation: [
      {
        title: 'Section Name',
        items: [
          { 
            title: 'Item Name',
            href: '/path',
            icon: IconComponent // from lucide-react
          }
        ]
      }
    ]
  }
};
```

2. Icons should be imported from lucide-react:
```typescript
import { Icon } from 'lucide-react';
```

## Types

### NavItem
```typescript
interface NavItem {
  title: string;      // Display text
  href: string;       // URL path
  icon?: LucideIcon;  // Optional icon
  isExternal?: boolean; // External link flag
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
interface RoleNavigation {
  role: 'user' | 'artist' | 'admin';
  navigation: NavSection[];
}
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