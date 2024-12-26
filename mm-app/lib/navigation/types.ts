import { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  isExternal?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface RoleNavigation {
  role: 'user' | 'artist' | 'admin';
  navigation: NavSection[];
} 