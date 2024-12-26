import Link from 'next/link';
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/supabase/check-env-vars";
import { Button } from '@/components/ui/button';
import { Badge } from "./ui/badge";
import { signOutAction } from "@/lib/actions";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex-1">
            <Badge variant={"default"} className="font-normal pointer-events-none">
              Please update .env.local file with anon key and url
            </Badge>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">MindMap</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Docs
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add search functionality here if needed */}
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="ghost" className="text-base hover:bg-accent hover:text-accent-foreground">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <form action={signOutAction}>
                  <Button 
                    type="submit" 
                    variant="ghost"
                    className="text-base hover:bg-accent hover:text-accent-foreground"
                  >
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" className="text-base hover:bg-accent hover:text-accent-foreground">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button variant="ghost" className="text-base hover:bg-accent hover:text-accent-foreground">
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
