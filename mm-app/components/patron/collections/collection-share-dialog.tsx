'use client'

import { type FC, useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Share2, Copy, Twitter, Facebook, Link } from 'lucide-react'
import { toast } from 'sonner'

interface CollectionShareDialogProps {
  collectionId: string
  collectionName: string
  isPrivate: boolean
}

export const CollectionShareDialog: FC<CollectionShareDialogProps> = ({
  collectionId,
  collectionName,
  isPrivate,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [publicUrl, setPublicUrl] = useState('')

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/collections/${collectionId}`)
  }, [collectionId])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success('Link copied to clipboard')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy link')
    }
  }

  const handleShare = (platform: 'twitter' | 'facebook') => {
    const text = `Check out my art collection "${collectionName}" on Meaning Machine`
    const url = encodeURIComponent(publicUrl)
    
    let shareUrl = ''
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
    }
    
    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isPrivate}
        >
          <Share2 className="h-4 w-4" />
          Share Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Collection</DialogTitle>
          <DialogDescription>
            Share your collection with others or copy the link to share it directly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label>Collection Link</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={publicUrl}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Sharing Details</h4>
            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-2">
              <li>
                Anyone with the link can view this collection
              </li>
              <li>
                Only you can modify the collection contents
              </li>
              <li>
                You can make the collection private at any time
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 