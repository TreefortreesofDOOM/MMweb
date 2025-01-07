import {
  LayoutDashboard,
  Palette,
  Users,
  Settings,
  BadgeCheck,
  QrCode,
  LineChart,
  MessageSquare,
  Store,
  Award,
  GalleryVertical,
  Image as Gallery,
  Ghost,
  Clock,
  Activity
} from 'lucide-react';
import type { RoleNavigation, UserRole } from './types';

export const navigationConfig: Record<UserRole, RoleNavigation> = {
  admin: {
    role: 'admin',
    navigation: [
      {
        title: 'Overview',
        items: [
          {
            title: 'Dashboard',
            href: '/admin-dashboard',
            icon: LayoutDashboard
          },
          {
            title: 'Applications',
            href: '/applications',
            icon: Users
          },
          {
            title: 'Featured Artist',
            href: '/featured-artist',
            icon: Award
          },
          {
            title: 'Ghost Profiles',
            href: '/ghost-profiles',
            icon: Ghost
          }
        ]
      }
    ]
  },
  verified_artist: {
    role: 'verified_artist',
    navigation: [
      {
        title: 'Overview',
        items: [
          {
            title: 'Dashboard',
            href: '/artist/dashboard',
            icon: LayoutDashboard
          },
          {
            title: 'Portfolio',
            href: '/artist/portfolio',
            icon: Palette
          },
          {
            title: 'Artworks',
            href: '/artist/artworks',
            icon: GalleryVertical
          }
        ]
      },
      {
        title: 'Sales',
        items: [
          {
            title: 'Store',
            href: '/artist/store',
            icon: Store
          },
          {
            title: 'Analytics',
            href: '/artist/analytics',
            icon: LineChart
          }
        ]
      },
      {
        title: 'Community',
        items: [
          {
            title: 'Feed',
            href: '/artist/feed',
            icon: Activity
          },
          {
            title: 'Messages',
            href: '/artist/messages',
            icon: MessageSquare
          },
          {
            title: 'QR Code',
            href: '/artist/qr-code',
            icon: QrCode
          }
        ]
      }
    ]
  },
  emerging_artist: {
    role: 'emerging_artist',
    navigation: [
      {
        title: 'Overview',
        items: [
          {
            title: 'Dashboard',
            href: '/artist/dashboard',
            icon: LayoutDashboard
          },
          {
            title: 'Portfolio',
            href: '/artist/portfolio',
            icon: Palette
          },
          {
            title: 'Artworks',
            href: '/artist/artworks',
            icon: GalleryVertical
          }
        ]
      },
      {
        title: 'Artist',
        items: [
          {
            title: 'Get Verified',
            href: '/artist/verification',
            icon: BadgeCheck
          }
        ]
      },
      {
        title: 'Community',
        items: [
          {
            title: 'Feed',
            href: '/artist/feed',
            icon: Activity
          },
          {
            title: 'QR Code',
            href: '/artist/qr-code',
            icon: QrCode
          }
        ]
      }
    ]
  },
  user: {
    role: 'user',
    navigation: [
      {
        title: 'Overview',
        items: [
          {
            title: 'Profile',
            href: '/profile',
            icon: Users
          },
          {
            title: 'Settings',
            href: '/settings',
            icon: Settings
          },
          {
            title: 'Feed',
            href: '/feed',
            icon: Activity
          }
        ]
      }
    ]
  },
  artist: {
    role: 'artist',
    navigation: [] // Legacy role, empty navigation
  },
  patron: {
    role: 'patron',
    navigation: [
      {
        title: 'Overview',
        items: [
          {
            title: 'Dashboard',
            href: '/patron/dashboard',
            icon: LayoutDashboard
          },
          {
            title: 'Collections',
            href: '/patron/collections',
            icon: Gallery
          },
          {
            title: 'Favorites',
            href: '/patron/favorites',
            icon: Store
          }
        ]
      },
      {
        title: 'Analytics',
        items: [
          {
            title: 'Insights',
            href: '/patron/insights',
            icon: LineChart
          },
          {
            title: 'History',
            href: '/patron/history',
            icon: Clock
          }
        ]
      },
      {
        title: 'Community',
        items: [
          {
            title: 'Following',
            href: '/patron/following',
            icon: Users
          },
          {
            title: 'Messages',
            href: '/patron/messages',
            icon: MessageSquare
          },
          {
            title: 'Feed',
            href: '/patron/feed',
            icon: Activity
          }
        ]
      }
    ]
  }
}; 