'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArtworkCard } from './artwork-card';
import type { ArtworkImage } from './artwork-upload';

interface SortableArtworkCardProps {
  artwork: {
    id: string;
    title: string;
    price: number;
    status: string;
    images: ArtworkImage[];
  };
  showStatus?: boolean;
  showEdit?: boolean;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  isLoading?: boolean;
  isEmergingArtist?: boolean;
  isAtPublishLimit?: boolean;
}

export function SortableArtworkCard({
  artwork,
  showStatus,
  showEdit,
  onPublish,
  onUnpublish,
  isLoading,
  isEmergingArtist,
  isAtPublishLimit,
}: SortableArtworkCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: artwork.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none relative"
      role="listitem"
      aria-label={`Drag handle for ${artwork.title}`}
    >
      {/* Drag handle overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          // Prevent click from reaching the card if we're dragging
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      />
      <div className="relative z-20">
        <ArtworkCard
          artwork={artwork}
          showStatus={showStatus}
          showEdit={showEdit}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          isLoading={isLoading}
          isEmergingArtist={isEmergingArtist}
          isAtPublishLimit={isAtPublishLimit}
        />
      </div>
    </div>
  );
} 