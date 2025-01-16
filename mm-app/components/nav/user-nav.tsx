'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArtistBadge } from '@/components/ui/artist-badge';
import Link from 'next/link';
import { signOutAction } from '@/lib/actions';
import { Settings, User } from 'lucide-react';
import type { UserRole } from '@/lib/types/custom-types';

interface UserNavProps {
  userEmail?: string | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  userRole?: UserRole | null;
}

export function UserNav({ userEmail, avatarUrl, fullName, userRole }: UserNavProps) {
  // Get initials from full name or email
  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return userEmail?.[0].toUpperCase() || '?';
  };

  if (!userEmail) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/sign-in">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || undefined} alt={fullName || userEmail} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1">
            {fullName && (
              <p className="text-sm font-medium leading-none">{fullName}</p>
            )}
            {userEmail && (
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            )}
          </div>
        </div>
        {userRole && (userRole === 'verified_artist' || userRole === 'emerging_artist') && (
          <div className="p-2">
            <ArtistBadge role={userRole} />
          </div>
        )}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={async (event) => {
            event.preventDefault();
            await signOutAction();
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 