'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import type { GhostProfile } from '@/lib/types/ghost-profiles';

interface GhostProfileNotificationProps {
  ghostProfile: GhostProfile;
}

export function GhostProfileNotification({ ghostProfile }: GhostProfileNotificationProps) {
  useEffect(() => {
    toast.success(
      `We've transferred your previous purchase history (${ghostProfile.totalPurchases} ${
        ghostProfile.totalPurchases === 1 ? 'purchase' : 'purchases'
      } worth ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(ghostProfile.totalSpent / 100)}) to your new account.`,
      {
        duration: 6000,
      }
    );
  }, [ghostProfile]);

  return null;
} 