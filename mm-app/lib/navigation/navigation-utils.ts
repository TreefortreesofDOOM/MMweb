import type { UserRole, NavigationItem, NavigationSection, RoleNavigation } from './types';
import { navigationConfig } from './config';

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && role in navigationConfig;
}

/**
 * Type guard to check if a navigation item has all required properties
 */
export function isValidNavigationItem(item: Partial<NavigationItem>): item is NavigationItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.title === 'string' &&
    typeof item.href === 'string' &&
    'icon' in item
  );
}

/**
 * Type guard to check if a navigation section is valid
 */
export function isValidNavigationSection(section: Partial<NavigationSection>): section is NavigationSection {
  return (
    typeof section === 'object' &&
    section !== null &&
    typeof section.title === 'string' &&
    Array.isArray(section.items) &&
    section.items.every(isValidNavigationItem)
  );
}

/**
 * Validates a dynamic URL with ID placeholder
 */
export function validateDynamicUrl(url: string, id: string | undefined | null): string {
  if (!id && url.includes('{id}')) {
    console.warn('Navigation URL contains {id} placeholder but no ID was provided');
    return '#'; // Return a safe fallback
  }
  return url.replace('{id}', id || '');
}

/**
 * Get safe navigation config for a role
 */
export function getSafeNavigationConfig(role: unknown): RoleNavigation {
  if (!isValidUserRole(role)) {
    console.error(`Invalid user role: ${String(role)}`);
    return {
      role: 'user', // Fallback to user role
      navigation: []
    };
  }

  const config = navigationConfig[role];
  
  // Validate each section and item
  return {
    role,
    navigation: config.navigation
      .filter(isValidNavigationSection)
      .map(section => ({
        ...section,
        items: section.items.filter(isValidNavigationItem)
      }))
  };
} 