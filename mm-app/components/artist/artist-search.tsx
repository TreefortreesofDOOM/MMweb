'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UserRole } from '@/lib/types/custom-types'

export type ArtistTypeValue = 'all' | 'verified_artist' | 'emerging_artist'
export type SortByValue = 'created_at' | 'view_count' | 'name'
export type SortOrderValue = 'asc' | 'desc'

export interface ArtistFilters {
  readonly query: string
  readonly artistType: ArtistTypeValue
  readonly sortBy: SortByValue
  readonly sortOrder: SortOrderValue
}

export interface ArtistSearchProps {
  readonly filters: ArtistFilters
  readonly setFilters: (filters: Partial<ArtistFilters>) => void
}

export const ArtistSearch = ({ 
  filters,
  setFilters
}: ArtistSearchProps) => {
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters({ query: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Input
        type="search"
        placeholder="Search artists..."
        value={filters.query}
        onChange={handleQueryChange}
        className="sm:max-w-xs"
        aria-label="Search artists"
      />
      <div className="flex gap-2">
        <Select 
          value={filters.artistType} 
          onValueChange={(value: ArtistTypeValue) => setFilters({ artistType: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Artist type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="verified_artist">Verified</SelectItem>
            <SelectItem value="emerging_artist">Emerging</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.sortBy}
          onValueChange={(value: SortByValue) => setFilters({ sortBy: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date joined</SelectItem>
            <SelectItem value="view_count">Popularity</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.sortOrder}
          onValueChange={(value: SortOrderValue) => setFilters({ sortOrder: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}; 