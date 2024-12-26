import { RoleNavigation } from './types';
import { 
  LayoutDashboard, 
  Image, 
  Upload, 
  Users, 
  CreditCard,
  Settings
} from 'lucide-react';

export const navigationConfig: Record<'admin' | 'artist', RoleNavigation> = {
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
          }
        ]
      },
      {
        title: 'Management',
        items: [
          { 
            title: 'Artist Applications', 
            href: '/admin/applications', 
            icon: Users 
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
      }
    ]
  },
  artist: {
    role: 'artist',
    navigation: [
      {
        title: 'Overview',
        items: [
          { 
            title: 'Dashboard', 
            href: '/artist/dashboard', 
            icon: LayoutDashboard 
          }
        ]
      },
      {
        title: 'Gallery',
        items: [
          { 
            title: 'My Artworks', 
            href: '/artist/artworks', 
            icon: Image 
          },
          { 
            title: 'Upload New Artwork', 
            href: '/artist/artworks/new', 
            icon: Upload 
          }
        ]
      },
      {
        title: 'Payments',
        items: [
          {
            title: 'Stripe Dashboard',
            href: 'https://connect.stripe.com/express-login',
            icon: CreditCard,
            isExternal: true
          }
        ]
      }
    ]
  }
} as const; 