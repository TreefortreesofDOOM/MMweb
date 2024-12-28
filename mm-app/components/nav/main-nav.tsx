'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { useArtist } from '@/hooks/use-artist';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import type { UserRole } from '@/lib/navigation/types';
import { useCallback } from 'react';

interface MainNavProps {
  userRole?: UserRole | null;
}

export function MainNav({ userRole }: MainNavProps) {
  const pathname = usePathname();
  const { isArtist, isVerifiedArtist, isEmergingArtist } = useArtist();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  }, []);

  return (
    <nav className="flex items-center space-x-6 lg:space-x-8" role="navigation" aria-label="Main">
      <Logo />
      
      {/* Public Routes */}
      <Link
        href="/gallery"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/gallery') ? "text-foreground" : "text-foreground/60"
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

      {/* Artist-specific links */}
      {isArtist && (
        <>
          <Link
            href="/artist/dashboard"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive('/artist/dashboard') ? 'text-black dark:text-white' : 'text-muted-foreground'
            )}
            role="link"
            aria-label="Artist Dashboard"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            Dashboard
          </Link>
          <Link
            href="/artist/artworks"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive('/artist/artworks') ? 'text-black dark:text-white' : 'text-muted-foreground'
            )}
            role="link"
            aria-label="Manage Artworks"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            Artworks
          </Link>
          {isVerifiedArtist ? (
            <Badge variant="outline" className="ml-2 gap-1" role="status" aria-label="Verified Artist Status">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Verified Artist
            </Badge>
          ) : (
            <Link
              href="/artist/verification"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive('/artist/verification') ? 'text-black dark:text-white' : 'text-muted-foreground'
              )}
              role="link"
              aria-label="Get Verified as an Artist"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              Get Verified
            </Link>
          )}
        </>
      )}

      {/* Admin-specific links */}
      {userRole === 'admin' && (
        <Link
          href="/admin/dashboard"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            isActive('/admin') ? 'text-black dark:text-white' : 'text-muted-foreground'
          )}
          role="link"
          aria-label="Admin Dashboard"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          Admin
        </Link>
      )}

      {/* Links for all authenticated users */}
      {userRole && (
        <Link
          href="/profile"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            isActive('/profile') ? 'text-black dark:text-white' : 'text-muted-foreground'
          )}
          role="link"
          aria-label="Your Profile"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          Profile
        </Link>
      )}
    </nav>
  );
} 