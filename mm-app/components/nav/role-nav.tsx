'use client';

import { useState, useCallback } from 'react';
import { navigationConfig } from '@/lib/navigation/config';
import { SideNav } from './side-nav';
import { MobileNav } from './mobile-nav';
import { useArtist } from '@/hooks/use-artist';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { UserRole } from '@/lib/navigation/types';

interface RoleNavProps {
  role: UserRole;
  children: React.ReactNode;
}

export function RoleNav({ role, children }: RoleNavProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isVerifiedArtist, isEmergingArtist, getVerificationStatus, getVerificationPercentage } = useArtist();
  
  const handleMobileNavToggle = useCallback((open: boolean) => {
    setIsMobileNavOpen(open);
  }, []);

  // Get the correct navigation config based on role and artist type
  const getNavConfig = () => {
    if (role === 'admin') return navigationConfig.admin;
    if (role === 'verified_artist') return navigationConfig.verified_artist;
    return navigationConfig.emerging_artist;
  };

  const config = getNavConfig();

  const renderVerificationStatus = () => {
    if (!isEmergingArtist) return null;
    
    const status = getVerificationStatus();
    const progress = getVerificationPercentage();

    return (
      <div className="px-4 py-2 border-b" role="complementary" aria-label="Verification Progress">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Verification Progress</span>
          <span className="text-sm text-muted-foreground" aria-label={`${progress}% complete`}>{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-2" 
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Verification progress indicator"
        />
        {status === 'ready_for_review' && (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            Your application is ready for review
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Navigation */}
      <div className="hidden md:block" role="complementary" aria-label="Desktop Navigation">
        <SideNav config={config} />
        {renderVerificationStatus()}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden" role="complementary" aria-label="Mobile Navigation">
        <MobileNav 
          config={config}
          isOpen={isMobileNavOpen}
          onOpenChange={handleMobileNavToggle}
        />
        {renderVerificationStatus()}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex h-16 items-center border-b px-4 md:px-6">
          <div className="md:hidden">
            <MobileNav 
              config={config}
              isOpen={isMobileNavOpen}
              onOpenChange={handleMobileNavToggle}
            />
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
} 