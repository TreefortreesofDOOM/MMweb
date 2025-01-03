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
import { Settings } from 'lucide-react';
import type { UserRole } from '@/lib/navigation/types';

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

  const getArtistBadgeType = () => {
    if (userRole === 'verified_artist') return 'verified';
    if (userRole === 'emerging_artist') return 'emerging';
    return null;
  };

  if (!userEmail) {
    return (
      <div className="flex items-center gap-4">
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

  const badgeType = getArtistBadgeType();

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || ''} alt={fullName || userEmail} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex flex-col gap-2 p-2">
            <div className="flex flex-col space-y-1">
              {fullName && (
                <p className="text-sm font-medium">{fullName}</p>
              )}
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
            {badgeType && (
              <ArtistBadge 
                type={badgeType} 
                showTooltip={false}
                className="w-fit"
              />
            )}
          </div>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
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