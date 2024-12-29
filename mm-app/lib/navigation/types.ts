import type { Database } from '@/lib/database.types';
import type { LucideIcon } from 'lucide-react';

export type UserRole = Database['public']['Enums']['user_role'];

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export interface RoleNavigation {
  role: UserRole;
  navigation: NavigationSection[];
} 