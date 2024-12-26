'use client';

import { useState } from 'react';
import { navigationConfig } from '@/lib/navigation/config';
import { SideNav } from './side-nav';
import { MobileNav } from './mobile-nav';

interface RoleNavProps {
  role: 'admin' | 'artist';
  children: React.ReactNode;
}

export function RoleNav({ role, children }: RoleNavProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const config = navigationConfig[role];

  return (
    <div className="flex min-h-screen">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <SideNav config={config} />
      </div>

      {/* Mobile Navigation */}
      <MobileNav 
        config={config}
        isOpen={isMobileNavOpen}
        onOpenChange={setIsMobileNavOpen}
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex h-16 items-center border-b px-4 md:px-6">
          <div className="md:hidden">
            <MobileNav 
              config={config}
              isOpen={isMobileNavOpen}
              onOpenChange={setIsMobileNavOpen}
            />
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 