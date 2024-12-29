'use client';

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Public Portfolio</h1>
          <p className="text-muted-foreground">
            This is how collectors and other artists see your work.
          </p>
          <div className="mt-2">
            <Link 
              href="/artist/artworks" 
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to artwork management</span>
            </Link>
          </div>
        </div>
      </div>

      <Alert className="mb-6">
        <p>
          Your portfolio displays all your published artworks in the order you've set.
          To make changes, visit the <Link href="/artist/artworks" className="underline">artwork management</Link> page.
        </p>
      </Alert>

      {/* Portfolio content here */}
    </div>
  );
} 