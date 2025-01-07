import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArtworkCard } from '@/components/artwork/artwork-card'
import { addItemToCollection } from '@/lib/actions/patron/collection-actions'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/supabase-client'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface ArtworkSelectionDialogProps {
  collectionId: string
  trigger?: React.ReactNode
}

export function ArtworkSelectionDialog({ collectionId, trigger }: ArtworkSelectionDialogProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [artworks, setArtworks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchArtworks = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const supabase = createBrowserClient()
      let query = supabase
        .from('artworks')
        .select(`
          *,
          profiles (
            id,
            name: full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
      }

      const { data, error } = await query
      
      if (error) throw error
      setArtworks(data || [])
    } catch (error) {
      console.error('Error fetching artworks:', error)
      toast.error('Failed to load artworks')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchArtworks(search)
    }
  }, [open, search])

  const handleSelect = async (artworkId: string) => {
    try {
      await addItemToCollection(collectionId, { artworkId })
      toast.success('Artwork added to collection')
      setOpen(false)
    } catch (error) {
      console.error('Error adding artwork to collection:', error)
      toast.error('Failed to add artwork to collection')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Artwork</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Artwork to Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artworks..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : artworks.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No artworks found
              </div>
            ) : (
              artworks.map((artwork) => (
                <div key={artwork.id} className="cursor-pointer" onClick={() => handleSelect(artwork.id)}>
                  <ArtworkCard
                    artwork={{
                      ...artwork,
                      images: artwork.images.map((img: any, index: number) => ({
                        ...img,
                        isPrimary: index === 0,
                        order: index
                      }))
                    }}
                    showFavorite={false}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 