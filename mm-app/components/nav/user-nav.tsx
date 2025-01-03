'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { signOutAction } from '@/lib/actions';
import { ThemeSwitcher } from '@/components/nav/theme-switcher';
import { Settings, User } from 'lucide-react';

interface UserNavProps {
  userEmail?: string | null;
}

export function UserNav({ userEmail }: UserNavProps) {
  if (!userEmail) {
    return (
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <Link href="/sign-in">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button size="sm">Sign Up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ThemeSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <User className="h-4 w-4 mr-2" />
            <span className="text-sm text-muted-foreground max-w-[150px] truncate">
              {userEmail}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          <form action={signOutAction}>
            <DropdownMenuItem asChild>
              <button className="w-full">Sign out</button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 