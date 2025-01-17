'use client';

import { cn } from '@/lib/utils/core/common-utils';
import { Badge } from '@/components/ui/badge';
import { GalleryWallType } from '@/lib/types/gallery-types';

interface GalleryBadgeProps {
  wallType: GalleryWallType;
  className?: string;
}

export const GalleryBadge = ({ wallType, className }: GalleryBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "capitalize",
        {
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100': wallType === 'trust_wall',
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100': wallType === 'collectors_wall',
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100': wallType === 'added_value_pedestal',
          'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100': wallType === 'featured_work',
        },
        className
      )}
    >
      {wallType.replace(/_/g, ' ')}
    </Badge>
  );
}; 