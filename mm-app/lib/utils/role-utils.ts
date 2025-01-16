import type { UserRole } from '@/lib/types/custom-types'

// Role constants
export const USER_ROLES = {
  ADMIN: 'admin' as const,
  VERIFIED_ARTIST: 'verified_artist' as const,
  EMERGING_ARTIST: 'emerging_artist' as const,
  PATRON: 'patron' as const,
  USER: 'user' as const,
} as const;

// Role permissions configuration
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canAccessAnalytics: true,
    canAccessMessaging: true,
    maxArtworks: Infinity,
    stripeRequirements: { required: false, minimumArtworks: 0 }
  },
  [USER_ROLES.VERIFIED_ARTIST]: {
    canAccessAnalytics: true,
    canAccessMessaging: true,
    maxArtworks: 100,
    stripeRequirements: { required: true, minimumArtworks: 5 }
  },
  [USER_ROLES.EMERGING_ARTIST]: {
    canAccessAnalytics: false,
    canAccessMessaging: false,
    maxArtworks: 10,
    stripeRequirements: { required: false, minimumArtworks: 0 }
  },
  [USER_ROLES.PATRON]: {
    canAccessAnalytics: false,
    canAccessMessaging: true,
    maxArtworks: 0,
    stripeRequirements: { required: false, minimumArtworks: 0 }
  },
  [USER_ROLES.USER]: {
    canAccessAnalytics: false,
    canAccessMessaging: false,
    maxArtworks: 0,
    stripeRequirements: { required: false, minimumArtworks: 0 }
  }
} as const;

// Role check utilities
export const isVerifiedArtist = (role: UserRole | null): boolean => role === USER_ROLES.VERIFIED_ARTIST;
export const isEmergingArtist = (role: UserRole | null): boolean => role === USER_ROLES.EMERGING_ARTIST;
export const isAnyArtist = (role: UserRole | null): boolean => isVerifiedArtist(role) || isEmergingArtist(role);
export const isAdmin = (role: UserRole | null): boolean => role === USER_ROLES.ADMIN;
export const isPatron = (role: UserRole | null): boolean => role === USER_ROLES.PATRON;

// Helper to get permissions for a role
export const getRolePermissions = (role: UserRole | null) => {
  if (!role) return ROLE_PERMISSIONS[USER_ROLES.USER];
  
  // Check if the role exists in our permissions mapping
  const validRole = Object.values(USER_ROLES).includes(role as any) ? role : USER_ROLES.USER;
  return ROLE_PERMISSIONS[validRole as keyof typeof ROLE_PERMISSIONS];
};

// Protected routes configuration
export const PROTECTED_ROUTES = {
  '/artist/gallery': [USER_ROLES.VERIFIED_ARTIST], // Only verified artists with exhibition badge
  '/analytics': [USER_ROLES.ADMIN, USER_ROLES.VERIFIED_ARTIST],
  '/messaging': [USER_ROLES.ADMIN, USER_ROLES.VERIFIED_ARTIST, USER_ROLES.PATRON],
} as const;

// Helper to check if a role has access to a route
export const hasRouteAccess = (route: keyof typeof PROTECTED_ROUTES, role: UserRole | null): boolean => {
  if (!role) return false;
  
  // Special case for artist gallery which requires exhibition badge
  if (route === '/artist/gallery') {
    // This will be checked in the page component along with exhibition_badge
    return role === USER_ROLES.VERIFIED_ARTIST;
  }
  
  return PROTECTED_ROUTES[route].includes(role as any);
}; 