'use client';

import { useState } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';

const adminNavItems = [
  { href: '/admin/dashboard', title: 'Overview' },
  { href: '/admin/applications', title: 'Artist Applications' },
  { href: '/admin/artists', title: 'Artists' },
  { href: '/admin/artworks', title: 'Artworks' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <SidebarNav
        items={adminNavItems}
        title="Admin Dashboard"
        description="Manage your platform"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
          <div className="flex items-center gap-4">
            <SidebarNav.Trigger isOpen={isOpen} onOpenChange={setIsOpen} />
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 