'use client'

import { FC, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/supabase-client'
import { Loader2 } from 'lucide-react'

interface Collection {
  id: string
  name: string
}

interface MoveItemsDialogProps {
  isOpen: boolean
  onClose: () => void
  onMove: (targetCollectionId: string) => Promise<void>
  currentCollectionId: string
  itemCount: number
}

export const MoveItemsDialog: FC<MoveItemsDialogProps> = ({
  isOpen,
  onClose,
  onMove,
  currentCollectionId,
  itemCount
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
  const [isMoving, setIsMoving] = useState(false)

  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('collections')
        .select('id, name')
        .neq('id', currentCollectionId)
        .eq('is_purchased', false)
        .order('name')

      if (error) throw error
      return data
    }
  })

  const handleMove = async () => {
    if (!selectedCollectionId) return
    setIsMoving(true)
    try {
      await onMove(selectedCollectionId)
      onClose()
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Items to Collection</DialogTitle>
          <DialogDescription>
            Select a collection to move {itemCount} {itemCount === 1 ? 'item' : 'items'} to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Select
            value={selectedCollectionId}
            onValueChange={setSelectedCollectionId}
            disabled={isLoading || isMoving}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              {collections?.map((collection: Collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isMoving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={!selectedCollectionId || isMoving}
            >
              {isMoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                'Move Items'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 