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
  Image as Gallery
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
        title: 'Collecting',
        items: [
          {
            title: 'Browse Art',
            href: '/browse',
            icon: Store
          },
          {
            title: 'My Collection',
            href: '/collection',
            icon: Gallery
          },
          {
            title: 'Following',
            href: '/following',
            icon: Users
          }
        ]
      }
    ]
  }
}; 