'use client'

import { FC } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Trash2, FolderPlus, Edit } from 'lucide-react'

interface BatchOperationsMenuProps {
  selectedCount: number
  onRemove: () => void
  onMove: () => void
  onUpdateNotes: () => void
  disabled?: boolean
}

export const BatchOperationsMenu: FC<BatchOperationsMenuProps> = ({
  selectedCount,
  onRemove,
  onMove,
  onUpdateNotes,
  disabled = false
}) => {
  if (selectedCount === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={disabled}
          className="flex items-center gap-2"
        >
          Batch Actions ({selectedCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onRemove} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Selected
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMove}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Move to Collection
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUpdateNotes}>
          <Edit className="mr-2 h-4 w-4" />
          Update Notes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 