'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils/common-utils";
import { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  title: string;
  icon?: LucideIcon;
  external?: boolean;
  className?: string;
}

interface SidebarNavProps {
  items: NavItem[];
  title: string;
  description: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface TriggerProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Trigger({ isOpen, onOpenChange }: TriggerProps) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="block md:hidden"
      onClick={() => onOpenChange?.(!isOpen)}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle navigation menu</span>
    </Button>
  );
}

export function SidebarNav({ items, title, description, isOpen, onOpenChange }: SidebarNavProps) {
  const content = (
    <div className="space-y-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const LinkComponent = (
            <Link 
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2"
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.title}
              {item.external && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              )}
            </Link>
          );

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn("w-full justify-start", item.className)}
            >
              {LinkComponent}
            </Button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-6">
          {content}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-muted p-6 border-r">
        {content}
      </div>
    </>
  );
}

SidebarNav.Trigger = Trigger; 