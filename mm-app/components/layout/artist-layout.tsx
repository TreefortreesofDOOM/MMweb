'use client';

import { useState } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';

const artistNavItems = [
  { href: '/artist/dashboard', title: 'Overview' },
  { href: '/artist/artworks', title: 'My Artworks' },
  { href: '/artist/artworks/new', title: 'Upload New Artwork' },
];

interface ArtistLayoutProps {
  children: React.ReactNode;
}

export function ArtistLayout({ children }: ArtistLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <SidebarNav
        items={artistNavItems}
        title="Artist Dashboard"
        description="Manage your artworks"
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