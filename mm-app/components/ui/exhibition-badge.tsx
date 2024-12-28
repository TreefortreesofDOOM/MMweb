'use client';

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Medal } from "lucide-react";

interface ExhibitionBadgeProps {
  className?: string;
  showTooltip?: boolean;
}

export const ExhibitionBadge = ({ className, showTooltip = true }: ExhibitionBadgeProps) => {
  const badge = (
    <Badge 
      variant="outline" 
      className={className}
      role="status"
      aria-label="Exhibition Artist Status"
      tabIndex={0}
    >
      <Medal className="h-3 w-3 mr-1" aria-hidden="true" />
      Exhibition Artist
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
          aria-label="About exhibition artist status"
        >
          <p>Selected for exhibition in our physical gallery</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 