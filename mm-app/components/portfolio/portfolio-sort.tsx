'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type PortfolioSortField = 'display_order' | 'price' | 'created_at' | 'title'
export type PortfolioSortDirection = 'asc' | 'desc'

export interface PortfolioSort {
  field: PortfolioSortField
  direction: PortfolioSortDirection
}

interface PortfolioSortProps {
  onSortChange: (sort: PortfolioSort) => void
  defaultSort?: PortfolioSort
}

export function PortfolioSort({ 
  onSortChange, 
  defaultSort = { field: 'display_order', direction: 'asc' } 
}: PortfolioSortProps) {
  const handleFieldChange = (field: PortfolioSortField) => {
    onSortChange({ ...defaultSort, field })
  }

  const handleDirectionChange = (direction: PortfolioSortDirection) => {
    onSortChange({ ...defaultSort, direction })
  }

  return (
    <div className="flex gap-2">
      <Select
        value={defaultSort.field}
        onValueChange={(value) => handleFieldChange(value as PortfolioSortField)}
      >
        <SelectTrigger className="h-8 w-[130px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="display_order">Custom Order</SelectItem>
          <SelectItem value="price">Price</SelectItem>
          <SelectItem value="created_at">Date Created</SelectItem>
          <SelectItem value="title">Title</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={defaultSort.direction}
        onValueChange={(value) => handleDirectionChange(value as PortfolioSortDirection)}
      >
        <SelectTrigger className="h-8 w-[100px]">
          <SelectValue placeholder="Direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 