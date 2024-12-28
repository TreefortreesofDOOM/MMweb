import {
  LayoutDashboard,
  Palette,
  Image,
  Users,
  Settings,
  BadgeCheck,
  Rocket,
  QrCode,
  LineChart,
  MessageSquare,
  Store,
  Award,
  GalleryVertical
} from 'lucide-react';
import type { RoleNavigation, UserRole } from './types';

export const navigationConfig: Record<UserRole, RoleNavigation> = {
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
            title: 'Gallery',
            href: '/artist/gallery',
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
          }
        ]
      },
      {
        title: 'Verification',
        items: [
          {
            title: 'Verification Journey',
            href: '/artist/verification',
            icon: BadgeCheck
          },
          {
            title: 'Requirements',
            href: '/artist/requirements',
            icon: Award
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
  admin: {
    role: 'admin',
    navigation: [
      {
        title: 'Overview',
        items: [
          {
            title: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard
          },
          {
            title: 'Artists',
            href: '/admin/artists',
            icon: Users
          },
          {
            title: 'Artworks',
            href: '/admin/artworks',
            icon: Image
          }
        ]
      },
      {
        title: 'Verification',
        items: [
          {
            title: 'Artist Verification',
            href: '/admin/verification',
            icon: BadgeCheck
          },
          {
            title: 'Requirements',
            href: '/admin/requirements',
            icon: Award
          }
        ]
      },
      {
        title: 'System',
        items: [
          {
            title: 'Settings',
            href: '/admin/settings',
            icon: Settings
          },
          {
            title: 'Analytics',
            href: '/admin/analytics',
            icon: LineChart
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
  }
}; 