'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/core/common-utils';
import { Logo } from '@/components/nav/logo';
import type { UserRole } from '@/lib/navigation/types';
import { LayoutDashboard } from 'lucide-react';

interface MainNavProps {
  userRole?: UserRole | null;
}

export function MainNav({ userRole }: MainNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin-dashboard';
      case 'verified_artist':
      case 'emerging_artist':
        return '/artist/dashboard';
      case 'patron':
        return '/patron/dashboard';
      default:
        return null;
    }
  };

  const getDashboardLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin Dashboard';
      case 'verified_artist':
        return 'Artist Dashboard';
      case 'emerging_artist':
        return 'Artist Dashboard';
      case 'patron':
        return 'Patron Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <div className="flex flex-1">
      <nav className="flex items-center space-x-6 lg:space-x-8" role="navigation" aria-label="Main">
        <Logo />
        
        {/* Public Routes */}
        <Link
          href="/gallery-showcase"
          className={cn(
            "text-sm font-medium transition-colors hover:text-foreground/80",
            isActive('/gallery-showcase') ? "text-foreground" : "text-foreground/60"
          )}
          role="link"
          aria-label="Browse Gallery"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          Gallery
        </Link>
        <Link
          href="/artists"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            isActive('/artists') ? "text-foreground" : "text-foreground/60"
          )}
          role="link"
          aria-label="Browse Artists"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          Artists
        </Link>
      </nav>

      {/* Dashboard Link */}
      {dashboardLink && userRole !== 'user' && (
        <div className="flex flex-1 justify-end">
          <Link
            href={dashboardLink}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive(dashboardLink) ? "text-foreground" : "text-foreground/60",
              "flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent"
            )}
            role="link"
            aria-label={getDashboardLabel()}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      )}
    </div>
  );
} 