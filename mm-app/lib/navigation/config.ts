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
      /* Future Features:
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
      */
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
  }
}; 