'use client';

import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import type { UserRole } from '@/lib/navigation/types';

interface SiteHeaderProps {
  userRole?: UserRole | null;
  userEmail?: string | null;
}

export function SiteHeader({ userRole, userEmail }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MainNav userRole={userRole} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav userEmail={userEmail} />
        </div>
      </div>
    </header>
  );
} 