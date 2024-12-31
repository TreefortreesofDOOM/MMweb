'use client'

import { useState, useCallback } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils/common-utils'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  onAvatarChange: (file: File | null) => void
  initials: string
  isUploading?: boolean
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarChange, 
  initials,
  isUploading = false 
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onAvatarChange(file)
      
      // Cleanup preview URL when component unmounts
      return () => URL.revokeObjectURL(url)
    }
  }, [onAvatarChange])

  const handleRemove = useCallback(() => {
    setPreviewUrl(null)
    onAvatarChange(null)
  }, [onAvatarChange])

  return (
    <div className="space-y-4">
      <Label>Profile Picture</Label>
      <div className="flex items-start gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={previewUrl || undefined} 
            alt="Profile picture preview"
          />
          <AvatarFallback className="text-lg">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              initials
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "relative",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isUploading}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*"
                disabled={isUploading}
              />
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Upload a square image in JPG, PNG format.
            <br />
            Maximum file size: 5MB.
          </p>
        </div>
      </div>
    </div>
  )
} 