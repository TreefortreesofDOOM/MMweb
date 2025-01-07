import { LucideIcon } from 'lucide-react'

export type UserRole = 'admin' | 'verified_artist' | 'emerging_artist' | 'artist' | 'patron' | 'user'

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon
  isExternal?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export interface RoleNavigation {
  role: string
  navigation: NavSection[]
} 