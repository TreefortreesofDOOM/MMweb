'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signOut } from '@/app/actions';
import { ThemeSwitcher } from '@/components/theme-switcher';

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
      <span className="text-sm text-muted-foreground">{userEmail}</span>
      <form action={signOut}>
        <Button variant="ghost" size="sm" type="submit">
          Sign Out
        </Button>
      </form>
    </div>
  );
} 