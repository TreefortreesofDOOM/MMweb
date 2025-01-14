'use client';

import { useState, useCallback } from 'react';
import { SideNav } from './side-nav';
import { MobileNav } from './mobile-nav';
import { useArtist } from '@/hooks/use-artist';
import { useNavigation } from '@/hooks/use-navigation';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useUnifiedAIVisibility } from '@/lib/unified-ai/hooks';
import { UnifiedAI } from '@/components/unified-ai/unified-ai';
import { cn } from '@/lib/utils';

interface RoleNavProps {
  role: unknown;
  children: React.ReactNode;
}

export function RoleNav({ role, children }: RoleNavProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isEmergingArtist, getVerificationStatus, getVerificationPercentage } = useArtist();
  const { isOpen: isAIOpen, isCollapsed: isAICollapsed } = useUnifiedAIVisibility();
  
  const handleMobileNavToggle = useCallback((open: boolean) => {
    setIsMobileNavOpen(open);
  }, []);

  // Get navigation config with error handling
  const { config } = useNavigation(role);

  // If there's no navigation for the role, show a fallback UI
  if (config.navigation.length === 0 && role !== 'user') {
    return (
      <div className="flex min-h-screen">
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Navigation not available. Please contact support if this persists.
          </AlertDescription>
        </Alert>
        <main className="flex-1 p-4 md:p-6" role="main">
          {children}
        </main>
      </div>
    );
  }

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

      {/* Main Content Area with AI Integration */}
      <div className="relative flex-1">
        <main 
          className={cn(
            "p-4 md:p-6 transition-all duration-200 ease-in-out",
            isAIOpen && !isAICollapsed && "mr-[400px]",
          )} 
          role="main"
        >
          {children}
        </main>
        <UnifiedAI />
      </div>
    </div>
  );
} 