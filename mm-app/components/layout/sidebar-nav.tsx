'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  title: string;
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
        {items.map((item) => (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className="w-full justify-start"
          >
            <Link href={item.href}>
              {item.title}
            </Link>
          </Button>
        ))}
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