'use client'

import { useState } from 'react'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { updateAvatarAction, removeAvatarAction } from '@/lib/actions/update-avatar'
import { useToast } from '@/components/ui/use-toast'

interface ProfileAvatarFormProps {
  currentAvatarUrl?: string | null
  initials: string
}

export function ProfileAvatarForm({ currentAvatarUrl, initials }: ProfileAvatarFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleAvatarChange = async (file: File | null) => {
    if (!file && !currentAvatarUrl) return

    setIsUploading(true)
    try {
      if (file) {
        // Upload new avatar
        const formData = new FormData()
        formData.append('avatar', file)
        const result = await updateAvatarAction(formData)

        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Success',
            description: 'Profile picture updated successfully',
          })
        }
      } else {
        // Remove current avatar
        const result = await removeAvatarAction()

        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Success',
            description: 'Profile picture removed successfully',
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AvatarUpload
      currentAvatarUrl={currentAvatarUrl}
      onAvatarChange={handleAvatarChange}
      initials={initials}
      isUploading={isUploading}
    />
  )
} 