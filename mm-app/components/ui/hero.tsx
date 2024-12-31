'use client';

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth";

export default function Hero() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center text-center space-y-8 py-12">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
        AI-Powered Art Marketplace
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
        Join our community of artists and collectors.
      </p>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/gallery">
            Explore Art
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={user ? "/profile/application" : "/sign-in"}>
            Create Art
          </Link>
        </Button>
      </div>

      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </div>
  )
}
