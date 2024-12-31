'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useDebounce } from '@/hooks/use-debounce'
import { formatPrice } from '@/lib/utils/common-utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils/common-utils'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

interface PortfolioFiltersProps {
  onFilterChange: (filters: PortfolioFilters) => void
  mediums: string[]
  priceRange: { min: number; max: number }
}

interface PortfolioFilters {
  search: string
  medium: string
  priceRange: [number, number]
  dateRange: [Date | null, Date | null]
}

export function PortfolioFilters({
  onFilterChange,
  mediums,
  priceRange
}: PortfolioFiltersProps) {
  // Local state for filters
  const [search, setSearch] = useState('')
  const [medium, setMedium] = useState('')
  const [price, setPrice] = useState<[number, number]>([priceRange.min, priceRange.max])
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])

  // Debounce search input
  const debouncedSearch = useDebounce(search, 300)

  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    setPrice([value[0], value[1]])
  }

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange([range?.from ?? null, range?.to ?? null])
  }

  // Update filters when any value changes
  useEffect(() => {
    onFilterChange({
      search: debouncedSearch,
      medium: medium === 'all' ? '' : medium,
      priceRange: price,
      dateRange
    })
  }, [debouncedSearch, medium, price, dateRange, onFilterChange])

  // Reset all filters
  const handleReset = () => {
    setSearch('')
    setMedium('all')
    setPrice([priceRange.min, priceRange.max])
    setDateRange([null, null])
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <CardTitle className="text-base font-medium">Filter Artworks</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleReset}
          className="h-7 px-2"
        >
          Reset
          <X className="ml-2 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 p-3">
        <div className="grid gap-3 sm:grid-cols-4">
          {/* Search Input */}
          <Input
            placeholder="Search artworks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />

          {/* Medium Select */}
          <Select value={medium} onValueChange={setMedium}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Medium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All mediums</SelectItem>
              {mediums.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-muted-foreground">
              Price: {formatPrice(price[0])} - {formatPrice(price[1])}
            </span>
            <Slider
              min={priceRange.min}
              max={priceRange.max}
              step={100}
              value={[price[0], price[1]]}
              onValueChange={handlePriceChange}
              className="py-1.5"
            />
          </div>

          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-8 justify-start text-left font-normal",
                  !dateRange[0] && !dateRange[1] && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {dateRange[0] ? (
                  dateRange[1] ? (
                    <>
                      {format(dateRange[0], "LLL dd, y")} -{" "}
                      {format(dateRange[1], "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange[0], "LLL dd, y")
                  )
                ) : (
                  "Date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange[0] ?? undefined}
                selected={{
                  from: dateRange[0] ?? undefined,
                  to: dateRange[1] ?? undefined,
                }}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
} 