'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { MediumInput } from './medium-input'
import { updateProfileMediums } from '@/lib/actions/profile'
import { useToast } from '@/components/ui/use-toast'

interface ProfileMediumFormProps {
  initialMediums?: string[] | null
  isArtist?: boolean
}

export function ProfileMediumForm({ 
  initialMediums, 
  isArtist = false 
}: ProfileMediumFormProps) {
  console.log('ProfileMediumForm: initialMediums received:', initialMediums)
  const [mediums, setMediums] = useState<string[]>(initialMediums ?? [])
  console.log('ProfileMediumForm: mediums state initialized:', mediums)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleMediumsChange = async (newMediums: string[]) => {
    console.log('ProfileMediumForm: handleMediumsChange called with:', newMediums)
    setMediums(newMediums)
    setIsUpdating(true)

    try {
      await updateProfileMediums(newMediums)
      toast({
        title: 'Success',
        description: 'Your mediums have been updated.',
      })
    } catch (error) {
      console.error('ProfileMediumForm: Error updating mediums:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update mediums. Please try again.',
      })
      setMediums(initialMediums ?? [])
    } finally {
      setIsUpdating(false)
    }
  }

  console.log('ProfileMediumForm: Rendering with mediums:', mediums)
  return (
    <div className="space-y-2">
      <Label htmlFor="mediums">
        Mediums
        {isArtist && <span className="text-destructive ml-1">*</span>}
      </Label>
      <MediumInput
        value={mediums}
        onChange={handleMediumsChange}
        disabled={isUpdating}
        error={isArtist && mediums.length === 0 ? 'At least one medium is required' : undefined}
      />
    </div>
  )
} 