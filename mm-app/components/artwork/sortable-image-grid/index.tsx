'use client';

import React from 'react';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImageItem } from './image-item';
import type { ArtworkImage } from '../artwork-upload';

interface SortableImageGridProps {
  images: ArtworkImage[];
  onReorder: (images: ArtworkImage[]) => void;
  onMakePrimary: (url: string) => void;
  onRemove: (url: string) => void;
}

export function SortableImageGrid({
  images,
  onReorder,
  onMakePrimary,
  onRemove
}: SortableImageGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.url === active.id);
      const newIndex = images.findIndex(img => img.url === over.id);

      const newImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
        ...img,
        order: index,
      }));

      onReorder(newImages);
    }

    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={({ active }: DragStartEvent) => setActiveId(active.id as string)}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" role="grid" aria-label="Sortable image grid">
        <SortableContext items={images.map(img => img.url)} strategy={rectSortingStrategy}>
          {images.map((image) => (
            <SortableImageItem
              key={image.url}
              image={image}
              isActive={activeId === image.url}
              onMakePrimary={onMakePrimary}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
} 