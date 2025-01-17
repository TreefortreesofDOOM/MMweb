'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArtworkCard } from '../artwork-card';
import type { ArtworkImage } from '../artwork-upload';

interface SortableArtworkCardProps {
  artwork: {
    id: string;
    title: string;
    price: number | null;
    status: 'draft' | 'published';
    images: ArtworkImage[];
    description: string | null;
    artist_id: string;
    profiles?: {
      id: string;
      avatar_url: string;
      name: string;
    };
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
      {/* Card content at base layer */}
      <div className="relative">
        <ArtworkCard
          artwork={artwork}
          showStatus={showStatus}
          showEdit={showEdit}
          showFavorite={false}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          isLoading={isLoading}
          isEmergingArtist={isEmergingArtist}
          isAtPublishLimit={isAtPublishLimit}
        />
      </div>

      {/* Drag handle avoiding only the bottom button area */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-x-0 top-0 bottom-[72px] cursor-grab active:cursor-grabbing"
      />
    </div>
  );
} 