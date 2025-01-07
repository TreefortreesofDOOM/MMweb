'use client'

import { FC, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from 'lucide-react'

interface BulkNotesDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (notes: string) => Promise<void>
  itemCount: number
}

export const BulkNotesDialog: FC<BulkNotesDialogProps> = ({
  isOpen,
  onClose,
  onUpdate,
  itemCount
}) => {
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await onUpdate(notes)
      onClose()
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Notes</DialogTitle>
          <DialogDescription>
            Update notes for {itemCount} selected {itemCount === 1 ? 'item' : 'items'}.
            This will replace any existing notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Enter notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isUpdating}
            className="min-h-[100px]"
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!notes.trim() || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Notes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 