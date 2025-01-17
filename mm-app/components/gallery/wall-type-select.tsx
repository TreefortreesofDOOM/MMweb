'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GalleryWallType } from '@/lib/types/gallery-types';
import { updateArtworkWallType } from '@/lib/actions/gallery';
import { GalleryBadge } from './ui/badge';

const wallTypes = [
  { value: 'trust_wall' as const, label: 'Trust Wall' },
  { value: 'collectors_wall' as const, label: 'Collectors Wall' },
  { value: 'added_value_pedestal' as const, label: 'Added Value Pedestal' },
  { value: 'featured_work' as const, label: 'Featured Work' },
] as const;

interface WallTypeSelectProps {
  artworkId: string;
  currentType?: GalleryWallType;
  currentPrice?: number;
  onSelect?: (type: GalleryWallType) => void;
}

export const WallTypeSelect = ({
  artworkId,
  currentType,
  currentPrice,
  onSelect
}: WallTypeSelectProps) => {
  const [value, setValue] = useState<GalleryWallType | undefined>(currentType);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSelect = async (type: GalleryWallType) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setValue(type);
    
    try {
      await updateArtworkWallType(artworkId, type, currentPrice || 0);
      
      if (onSelect) {
        onSelect(type);
      }

      toast({
        title: 'Success',
        description: 'Wall type updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update wall type',
        variant: 'destructive',
      });
      // Revert on error
      setValue(currentType);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select
      value={value}
      onValueChange={handleSelect}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select wall type">
          {value ? <GalleryBadge wallType={value} /> : "Select wall type..."}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {wallTypes.map((type) => (
          <SelectItem
            key={type.value}
            value={type.value}
          >
            <div className="flex items-center">
              {type.label}
              {value === type.value && (
                <Check className="ml-2 h-4 w-4" />
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 