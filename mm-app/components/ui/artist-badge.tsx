'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Star } from 'lucide-react';
import { type UserRole } from '@/lib/types/custom-types';
import { isVerifiedArtist } from '@/lib/utils/role-utils';

export interface ArtistBadgeProps {
  role: UserRole;
  className?: string;
  showTooltip?: boolean;
}

export const ArtistBadge = ({ role, className, showTooltip = true }: ArtistBadgeProps) => {
  const isVerified = isVerifiedArtist(role);
  
  const badge = (
    <Badge
      variant={isVerified ? 'default' : 'secondary'}
      className={className}
      role="status"
      aria-label={isVerified ? 'Verified Artist Status' : 'Emerging Artist Status'}
      tabIndex={0}
    >
      {isVerified ? (
        <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
      ) : (
        <Star className="h-3 w-3 mr-1" aria-hidden="true" />
      )}
      {isVerified ? 'Verified Artist' : 'Emerging Artist'}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent
          role="tooltip"
          aria-label={isVerified ? 'About verified artist status' : 'About emerging artist status'}
        >
          <p>
            {isVerified
              ? 'This artist has been verified by our team'
              : 'This artist is building their portfolio'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 