'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils/common-utils';
import { RoleNavigation, NavItem } from '@/lib/navigation/types';
import { ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SideNavProps {
  config: RoleNavigation;
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Auto-focus active item on mount for keyboard users, but prevent scrolling
  useEffect(() => {
    if (isActive && linkRef.current) {
      linkRef.current.focus({ preventScroll: true });
    }
  }, [isActive]);

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2",
        isActive && "bg-muted font-medium",
        "focus-visible:ring-2 focus-visible:ring-offset-2"
      )}
    >
      <Link 
        ref={linkRef}
        href={item.href}
        target={item.isExternal ? "_blank" : undefined}
        rel={item.isExternal ? "noopener noreferrer" : undefined}
        className="flex items-center"
        role="menuitem"
        tabIndex={0}
        aria-current={isActive ? "page" : undefined}
        onKeyDown={(e) => {
          // Handle enter and space for activation
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
      >
        {Icon && (
          <Icon 
            className="h-4 w-4" 
            aria-hidden="true"
          />
        )}
        <span>{item.title}</span>
        {item.isExternal && (
          <ExternalLink 
            className="ml-auto h-3 w-3" 
            aria-label="Opens in new tab"
          />
        )}
      </Link>
    </Button>
  );
}

export function SideNav({ config }: SideNavProps) {
  return (
    <nav 
      className="w-64 border-r bg-background"
      role="navigation"
      aria-label={`${config.role} navigation`}
    >
      <ScrollArea className="h-full py-6">
        {config.navigation.map((section) => (
          <div 
            key={section.title} 
            className="px-3 py-2"
            role="menu"
            aria-label={section.title}
          >
            <h2 
              className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground"
              id={`nav-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {section.title}
            </h2>
            <div 
              className="space-y-1"
              role="group"
              aria-labelledby={`nav-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </nav>
  );
} 