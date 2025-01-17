'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils/core/common-utils';
import { RoleNavigation, NavItem } from '@/lib/navigation/types';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SideNavProps {
  config: RoleNavigation;
}

function NavLink({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
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
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Link 
        ref={linkRef}
        href={item.href}
        target={item.isExternal ? "_blank" : undefined}
        rel={item.isExternal ? "noopener noreferrer" : undefined}
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "w-full"
        )}
        role="menuitem"
        tabIndex={0}
        aria-current={isActive ? "page" : undefined}
        onKeyDown={(e) => {
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
        {!isCollapsed && (
          <>
            <span className="ml-2">{item.title}</span>
            {item.isExternal && (
              <ExternalLink 
                className="ml-auto h-3 w-3" 
                aria-label="Opens in new tab"
              />
            )}
          </>
        )}
      </Link>
    </Button>
  );
}

export function SideNav({ config }: SideNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <nav 
      className={cn(
        "relative border-r bg-background transition-all duration-300",
        isCollapsed ? "w-[56px]" : "w-[240px]"
      )}
      role="navigation"
      aria-label={`${config.role} navigation`}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "absolute right-0 top-6 translate-x-[100%] rounded-l-none border border-l-0",
          "hover:bg-muted",
          "focus-visible:ring-offset-[1px] focus-visible:ring-offset-border",
          "h-12 w-5 p-0",
          "z-20"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <ScrollArea className="h-full w-full py-6">
        {config.navigation.map((section) => (
          <div 
            key={section.title} 
            className={cn(
              "w-full",
              isCollapsed ? "px-2 py-2" : "px-3 py-2"
            )}
            role="menu"
            aria-label={section.title}
          >
            {!isCollapsed && (
              <h2 
                className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground"
                id={`nav-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {section.title}
              </h2>
            )}
            <div 
              className="space-y-1 w-full"
              role="group"
              aria-labelledby={`nav-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {section.items.map((item) => (
                <NavLink 
                  key={item.href} 
                  item={item} 
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </nav>
  );
} 