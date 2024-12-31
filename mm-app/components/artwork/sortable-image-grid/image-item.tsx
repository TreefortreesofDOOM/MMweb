'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils/common-utils';
import type { ArtworkImage } from '../artwork-upload';

interface SortableImageItemProps {
  image: ArtworkImage;
  isActive: boolean;
  onMakePrimary: (url: string) => void;
  onRemove: (url: string) => void;
}

export function SortableImageItem({
  image,
  isActive,
  onMakePrimary,
  onRemove
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group touch-none',
        isDragging && 'opacity-50',
        isActive && 'ring-2 ring-primary'
      )}
      {...attributes}
    >
      <div
        {...listeners}
        className="absolute top-2 left-2 p-1 rounded-md bg-black/50 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        role="button"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>

      <Image
        src={image.url}
        alt={`Artwork image ${image.order + 1}`}
        width={200}
        height={200}
        className="rounded-lg object-cover w-full h-40 transition-transform duration-300"
      />

      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
        <Button
          variant={image.isPrimary ? "secondary" : "outline"}
          size="sm"
          onClick={() => onMakePrimary(image.url)}
          className={cn(
            "mr-2 bg-white/10 hover:bg-white/20",
            image.isPrimary && "border-primary"
          )}
          disabled={image.isPrimary}
        >
          {image.isPrimary ? 'Primary' : 'Make Primary'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(image.url)}
          className="bg-white/10 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 