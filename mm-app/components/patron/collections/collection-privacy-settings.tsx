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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Lock, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface CollectionPrivacySettingsProps {
  collectionId: string
  isPrivate: boolean
}

export const CollectionPrivacySettings: FC<CollectionPrivacySettingsProps> = ({
  collectionId,
  isPrivate: initialIsPrivate,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/collections/${collectionId}/privacy`, {
        method: 'PATCH',
        body: JSON.stringify({ isPrivate }),
      })
      if (!res.ok) throw new Error('Failed to update privacy')
      toast.success('Collection privacy settings updated')
      setIsOpen(false)
    } catch (error) {
      console.error('Error updating collection privacy:', error)
      toast.error('Failed to update collection privacy settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isPrivate ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          {isPrivate ? 'Private Collection' : 'Public Collection'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Collection Privacy Settings</DialogTitle>
          <DialogDescription>
            Control who can view your collection and its contents.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label>Private Collection</Label>
              <p className="text-sm text-muted-foreground">
                {isPrivate
                  ? 'Only you can view this collection'
                  : 'Anyone can view this collection'}
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              aria-label="Toggle collection privacy"
            />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Visibility Details</h4>
            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-2">
              <li>
                Private collections are only visible to you
              </li>
              <li>
                Public collections can be viewed by anyone, but only you can modify them
              </li>
              <li>
                Collection privacy can be changed at any time
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isLoading}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 