'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  onSelect?: (type: GalleryWallType, price: number) => void;
}

export const WallTypeSelect = ({
  artworkId,
  currentType,
  currentPrice = 0,
  onSelect
}: WallTypeSelectProps) => {
  const [value, setValue] = useState<GalleryWallType | undefined>(currentType);
  const [price, setPrice] = useState<number>(currentPrice);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSelect = async (type: GalleryWallType) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setValue(type);
    
    try {
      await updateArtworkWallType(artworkId, type, price);
      
      if (onSelect) {
        onSelect(type, price);
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

  const handlePriceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value);
    if (!isNaN(newPrice) && newPrice >= 0) {
      setPrice(newPrice);
      
      if (value) {
        setIsLoading(true);
        try {
          await updateArtworkWallType(artworkId, value, newPrice);
          
          if (onSelect) {
            onSelect(value, newPrice);
          }

          toast({
            title: 'Success',
            description: 'Gallery price updated successfully',
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update price',
            variant: 'destructive',
          });
          // Revert on error
          setPrice(currentPrice);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <div className="space-y-2">
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

      <div className="flex items-center space-x-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={handlePriceChange}
          placeholder="Gallery Price"
          disabled={isLoading || !value}
          className="w-full"
        />
      </div>
    </div>
  );
}; 