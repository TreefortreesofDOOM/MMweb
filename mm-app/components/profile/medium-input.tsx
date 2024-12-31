'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { SUGGESTED_MEDIUMS, MAX_MEDIUM_LENGTH, MAX_MEDIUMS_PER_PROFILE } from '@/lib/constants/mediums'

interface MediumInputProps {
  value: string[]
  onChange: (value: string[]) => void
  maxMediums?: number
  disabled?: boolean
  error?: string
}

export function MediumInput({
  value,
  onChange,
  maxMediums = MAX_MEDIUMS_PER_PROFILE,
  disabled = false,
  error
}: MediumInputProps) {
  console.log('MediumInput: Received value:', value)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  const handleSelect = React.useCallback((medium: string) => {
    console.log('MediumInput: handleSelect called with:', medium)
    if (value.includes(medium)) {
      onChange(value.filter((v) => v !== medium))
    } else if (value.length < maxMediums) {
      onChange([...value, medium])
    }
    setInputValue('')
  }, [value, onChange, maxMediums])

  const handleRemove = React.useCallback((medium: string) => {
    console.log('MediumInput: handleRemove called with:', medium)
    onChange(value.filter((v) => v !== medium))
  }, [value, onChange])

  const handleCustomMedium = React.useCallback(() => {
    console.log('MediumInput: handleCustomMedium called with inputValue:', inputValue)
    const trimmedValue = inputValue.trim()
    if (
      trimmedValue &&
      !value.includes(trimmedValue) &&
      value.length < maxMediums &&
      trimmedValue.length <= MAX_MEDIUM_LENGTH
    ) {
      onChange([...value, trimmedValue])
      setInputValue('')
    }
  }, [inputValue, value, onChange, maxMediums])

  const suggestions = React.useMemo(() => 
    SUGGESTED_MEDIUMS.filter(medium =>
      !value.includes(medium) &&
      medium.toLowerCase().includes(inputValue.toLowerCase())
    ), [value, inputValue]
  )

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault()
      handleCustomMedium()
    }
  }, [inputValue, handleCustomMedium])

  console.log('MediumInput: Rendering with value:', value)
  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select mediums"
            className={cn(
              'w-full justify-between',
              error && 'border-destructive',
              !value.length && 'text-muted-foreground'
            )}
            disabled={disabled || value.length >= maxMediums}
          >
            Select mediums
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <Input
                placeholder="Type to search or enter your own medium..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <p className="text-xs text-muted-foreground px-1">
                Press Enter or click Add to create a custom medium
              </p>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {inputValue && !suggestions.includes(inputValue) && (
                <button
                  onClick={handleCustomMedium}
                  className={cn(
                    'flex w-full items-center justify-between px-2 py-2 text-sm rounded-sm',
                    'bg-accent/50 hover:bg-accent',
                    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                    'border-b mb-2'
                  )}
                  disabled={inputValue.length > MAX_MEDIUM_LENGTH}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium">Add "{inputValue}"</span>
                    {inputValue.length > MAX_MEDIUM_LENGTH && (
                      <span className="text-xs text-destructive">
                        (Too long - max {MAX_MEDIUM_LENGTH} characters)
                      </span>
                    )}
                  </span>
                </button>
              )}
              {suggestions.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground px-1 py-1">Suggested mediums:</p>
                  {suggestions.map((medium) => (
                    <button
                      key={medium}
                      onClick={() => handleSelect(medium)}
                      className={cn(
                        'flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-sm',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus:bg-accent focus:text-accent-foreground focus:outline-none'
                      )}
                    >
                      {medium}
                      {value.includes(medium) && (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              {!suggestions.length && !inputValue && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  Type to search suggestions or create your own medium
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((medium) => (
            <Badge
              key={medium}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {medium}
              <button
                className="rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRemove(medium)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleRemove(medium)
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
} 