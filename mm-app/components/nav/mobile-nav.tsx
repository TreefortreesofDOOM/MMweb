'use client';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { RoleNavigation } from "@/lib/navigation/types";
import { SideNav } from "./side-nav";
import { useEffect, useRef } from "react";

interface MobileNavProps {
  config: RoleNavigation;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ config, isOpen, onOpenChange }: MobileNavProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onOpenChange]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button 
          ref={triggerRef}
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="p-0"
        role="dialog"
        aria-label={`${config.role} navigation menu`}
        id="mobile-nav"
      >
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>{config.role === 'user' ? 'Navigation' : `${config.role} Navigation`}</SheetTitle>
        </SheetHeader>
        <SideNav config={config} />
      </SheetContent>
    </Sheet>
  );
} 