'use client';

import { useState } from 'react';
import { MainNav } from '@/components/nav/main-nav';
import { UserNav } from '@/components/nav/user-nav';
import { MobileNav } from '@/components/nav/mobile-nav';
import { useNavigation } from '@/hooks/use-navigation';
import type { UserRole } from '@/lib/navigation/types';

interface SiteHeaderProps {
  userRole?: UserRole | null;
  userEmail?: string | null;
  userAvatarUrl?: string | null;
  userFullName?: string | null;
}

export function SiteHeader({ userRole, userEmail, userAvatarUrl, userFullName }: SiteHeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { config } = useNavigation(userRole);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1">
          <MainNav userRole={userRole} />
        </div>
        <nav className="flex items-center space-x-2">
          <UserNav 
            userEmail={userEmail}
            avatarUrl={userAvatarUrl}
            fullName={userFullName}
            userRole={userRole}
          />
          <MobileNav 
            config={config}
            isOpen={isMobileNavOpen}
            onOpenChange={setIsMobileNavOpen}
          />
        </nav>
      </div>
    </header>
  );
} 