'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Star } from 'lucide-react';

export interface ArtistBadgeProps {
  type: 'verified' | 'emerging';
  className?: string;
  showTooltip?: boolean;
}

export const ArtistBadge = ({ type, className, showTooltip = true }: ArtistBadgeProps) => {
  const badge = (
    <Badge
      variant={type === 'verified' ? 'default' : 'secondary'}
      className={className}
      role="status"
      aria-label={type === 'verified' ? 'Verified Artist Status' : 'Emerging Artist Status'}
      tabIndex={0}
    >
      {type === 'verified' ? (
        <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
      ) : (
        <Star className="h-3 w-3 mr-1" aria-hidden="true" />
      )}
      {type === 'verified' ? 'Verified Artist' : 'Emerging Artist'}
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
          aria-label={type === 'verified' ? 'About verified artist status' : 'About emerging artist status'}
        >
          <p>
            {type === 'verified'
              ? 'This artist has been verified by our team'
              : 'This artist is building their portfolio'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 