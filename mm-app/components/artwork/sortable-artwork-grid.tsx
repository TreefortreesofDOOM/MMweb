'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableArtworkCard } from './sortable-artwork-card';
import type { ArtworkImage } from './artwork-upload';

// Prevent SSR for DndContext
const DndContextClient = dynamic(
  () => Promise.resolve(DndContext),
  { ssr: false }
);

interface SortableArtworkGridProps {
  artworks: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    images: ArtworkImage[];
  }>;
  onReorder: (artworks: string[]) => void;
  showStatus?: boolean;
  showEdit?: boolean;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  isLoading?: string | null;
  isEmergingArtist?: boolean;
  isAtPublishLimit?: boolean;
}

export function SortableArtworkGrid({
  artworks,
  onReorder,
  showStatus,
  showEdit,
  onPublish,
  onUnpublish,
  isLoading,
  isEmergingArtist,
  isAtPublishLimit,
}: SortableArtworkGridProps) {
  const [mounted, setMounted] = useState(false);

  // Handle client-side only mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = artworks.findIndex((item) => item.id === active.id);
      const newIndex = artworks.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(artworks, oldIndex, newIndex);
      // Call onReorder in the next tick to avoid state updates during render
      setTimeout(() => {
        onReorder(newItems.map(item => item.id));
      }, 0);
    }
  }, [artworks, onReorder]);

  if (!mounted) {
    return (
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="list"
        aria-label="Artwork Gallery"
      >
        {artworks.map((artwork) => (
          <SortableArtworkCard
            key={artwork.id}
            artwork={artwork}
            showStatus={showStatus}
            showEdit={showEdit}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            isLoading={isLoading === artwork.id}
            isEmergingArtist={isEmergingArtist}
            isAtPublishLimit={isAtPublishLimit}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContextClient
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={artworks.map(artwork => artwork.id)}
        strategy={rectSortingStrategy}
      >
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Sortable Artwork Gallery"
        >
          {artworks.map((artwork) => (
            <SortableArtworkCard
              key={artwork.id}
              artwork={artwork}
              showStatus={showStatus}
              showEdit={showEdit}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              isLoading={isLoading === artwork.id}
              isEmergingArtist={isEmergingArtist}
              isAtPublishLimit={isAtPublishLimit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContextClient>
  );
} 