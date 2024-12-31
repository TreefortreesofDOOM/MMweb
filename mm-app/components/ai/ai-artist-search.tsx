'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

interface AIArtistSearchProps {
  onSearch: (query: string) => Promise<void>
  isSearching: boolean
}

export function AIArtistSearch({ onSearch, isSearching }: AIArtistSearchProps) {
  const [query, setQuery] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      toast({
        title: "Please enter a search query",
        description: "Try something like 'artists from Atlanta who work with installations'",
        variant: "destructive"
      })
      return
    }
    await onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        type="text"
        placeholder="Ask AI to find artists... (e.g., 'artists from Atlanta who work with installations')"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-24"
      />
      <Button 
        type="submit"
        size="sm"
        variant="ghost"
        className="absolute right-2 top-1/2 -translate-y-1/2"
        disabled={isSearching}
      >
        {isSearching ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Searching...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </span>
        )}
      </Button>
    </form>
  )
} 