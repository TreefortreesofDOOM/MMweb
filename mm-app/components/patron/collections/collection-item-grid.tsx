'use client'

import { type FC, useState, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Trash2, CheckSquare, Square, GripVertical } from 'lucide-react'
import type { CollectionWithItems } from '@/lib/types/patron-types'
import { useCollection} from '@/hooks/use-collection'  
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils/common-utils'
import { EditNotesDialog } from './edit-notes-dialog'
import { CollectionArtworkCard } from './collection-artwork-card'

interface SortableItemProps {
  id: string
  children: React.ReactNode
  isSelected: boolean
  onSelect: (id: string) => void
  isDragDisabled?: boolean
}

const SortableItem: FC<SortableItemProps> = ({ id, children, isSelected, onSelect, isDragDisabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDragDisabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none relative group",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div
        className="absolute top-2 left-2 z-10"
        onClick={(e) => {
          e.stopPropagation()
          onSelect(id)
        }}
      >
        <Checkbox 
          checked={isSelected}
          className="bg-background/80 backdrop-blur-sm"
          aria-label={isSelected ? "Deselect artwork" : "Select artwork"}
        />
      </div>
      {!isDragDisabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-1 rounded-md bg-black/50 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-white" />
        </div>
      )}
      {children}
    </div>
  )
}

interface CollectionItemGridProps {
  collectionId: string
  items: CollectionWithItems['collection_items']
  selectedItems?: Set<string>
  onSelectionChange?: (selected: Set<string>) => void
}

type SortOption = 'custom' | 'title' | 'price' | 'date'

type CollectionItem = CollectionWithItems['collection_items'][number]

const getItemKey = (item: CollectionItem) => `${item.artwork_id}-${item.added_at}`;

const ItemErrorFallback: FC<{ error: Error }> = ({ error }) => (
  <Alert variant="destructive" className="col-span-1">
    <AlertDescription>
      Failed to load artwork: {error.message}
    </AlertDescription>
  </Alert>
)

export const CollectionItemGrid: FC<CollectionItemGridProps> = ({ 
  collectionId, 
  items,
  selectedItems = new Set(),
  onSelectionChange
}) => {
  const { updateOrder, updateNotes } = useCollection()
  const [sortedItems, setSortedItems] = useState<CollectionItem[]>(items)
  const [sortBy, setSortBy] = useState<SortOption>('custom')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setSortedItems(items)
  }, [items])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex(item => item.artwork_id === active.id)
      const newIndex = sortedItems.findIndex(item => item.artwork_id === over.id)

      const newItems = arrayMove(sortedItems, oldIndex, newIndex)
      setSortedItems(newItems)

      try {
        await updateOrder(
          collectionId,
          newItems.map((item, index) => ({
            id: item.artwork_id,
            order: index
          }))
        )
      } catch (error) {
        console.error('Error updating item order:', error)
        toast.error('Failed to update item order')
        setSortedItems(items)
      }
    }
  }

  const handleSort = (value: string) => {
    const option = value as SortOption
    setSortBy(option)

    const sorted = [...sortedItems].sort((a, b) => {
      switch (option) {
        case 'title':
          return a.artworks.title.localeCompare(b.artworks.title)
        case 'price':
          return (b.transactions?.amount_total ?? 0) - (a.transactions?.amount_total ?? 0)
        case 'date':
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
        default:
          return (a.display_order ?? 0) - (b.display_order ?? 0)
      }
    })

    setSortedItems(sorted)
  }

  const toggleItemSelection = (artworkId: string) => {
    if (!onSelectionChange) return
    
    const newSelection = new Set(selectedItems)
    if (newSelection.has(artworkId)) {
      newSelection.delete(artworkId)
    } else {
      newSelection.add(artworkId)
    }
    onSelectionChange(newSelection)
  }

  const toggleSelectAll = () => {
    if (!onSelectionChange) return

    if (selectedItems.size === sortedItems.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(sortedItems.map(item => item.artwork_id)))
    }
  }

  const handleUpdateNotes = async (artworkId: string, notes: string) => {
    try {
      await updateNotes(collectionId, artworkId, notes)
      setSortedItems(items.map(item => 
        item.artwork_id === artworkId 
          ? { ...item, notes }
          : item
      ))
      toast.success('Notes updated')
    } catch (error) {
      console.error('Error updating notes:', error)
      toast.error('Failed to update notes')
    }
  }

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {sortedItems.map((item) => (
          <Card key={getItemKey(item)}>
            <CardContent className="p-4">
              <CollectionArtworkCard
                artwork={item.artworks}
                amount_paid={item.transactions?.amount_total}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onSelectionChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="flex items-center gap-2"
            >
              {selectedItems.size === sortedItems.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedItems.size === 0 ? (
                'Select All'
              ) : selectedItems.size === sortedItems.length ? (
                'Deselect All'
              ) : (
                `Selected ${selectedItems.size}`
              )}
            </Button>
          )}
        </div>
        <Select value={sortBy} onValueChange={handleSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom Order</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="date">Date Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedItems.map(getItemKey)} strategy={rectSortingStrategy}>
            {sortedItems.map((item) => (
              <SortableItem
                key={getItemKey(item)}
                id={getItemKey(item)}
                isSelected={selectedItems.has(item.artwork_id)}
                onSelect={() => toggleItemSelection(item.artwork_id)}
                isDragDisabled={sortBy !== 'custom'}
              >
                <ErrorBoundary
                  FallbackComponent={ItemErrorFallback}
                  onReset={() => {
                    // Reset the error state
                  }}
                >
                  <CollectionArtworkCard
                    artwork={item.artworks}
                    amount_paid={item.transactions?.amount_total}
                    onImageError={() => {
                      console.error(`Failed to load image for artwork: ${item.artwork_id}`)
                    }}
                    onImageLoad={() => {
                      // Handle successful image load
                    }}
                    onNavigate={() => {
                      // Handle navigation
                    }}
                  />
                </ErrorBoundary>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
} 