'use client'

import { type FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { StickyNote } from 'lucide-react'

interface EditNotesDialogProps {
  initialNotes?: string | null
  onSave: (notes: string) => Promise<void>
  disabled?: boolean
}

export const EditNotesDialog: FC<EditNotesDialogProps> = ({
  initialNotes,
  onSave,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState(initialNotes || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(notes)
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          disabled={disabled}
        >
          <StickyNote className="h-4 w-4" />
          {initialNotes ? 'Edit Notes' : 'Add Notes'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Item Notes</DialogTitle>
          <DialogDescription>
            Add personal notes about this artwork in your collection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your notes here..."
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isLoading}
          >
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 