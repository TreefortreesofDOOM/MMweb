'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

interface MainNavProps {
  userRole?: string | null;
}

export function MainNav({ userRole }: MainNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="flex items-center space-x-6 lg:space-x-8">
      <Logo />

      {/* Artist-specific links */}
      {userRole === 'artist' && (
        <>
          <Link
            href="/artist/dashboard"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive('/artist/dashboard') ? 'text-black dark:text-white' : 'text-muted-foreground'
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/artist/artworks"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              isActive('/artist/artworks') ? 'text-black dark:text-white' : 'text-muted-foreground'
            )}
          >
            Artworks
          </Link>
        </>
      )}

      {/* Admin-specific links */}
      {userRole === 'admin' && (
        <Link
          href="/admin"
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            isActive('/admin') ? 'text-black dark:text-white' : 'text-muted-foreground'
          )}
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
        >
          Profile
        </Link>
      )}
    </nav>
  );
} 