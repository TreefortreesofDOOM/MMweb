'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { extractBioAction } from "@/lib/actions/extract-bio"

interface WebsiteBioAssistantProps {
  onBioExtracted: (bio: string) => void;
  website: string;
  onClose: () => void;
}

export const WebsiteBioAssistant = ({ 
  onBioExtracted, 
  website,
  onClose 
}: WebsiteBioAssistantProps) => {
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string>()

  const handleExtractBio = async () => {
    if (!website) return
    
    setIsExtracting(true)
    setError(undefined)
    
    try {
      const response = await extractBioAction(website)
      if (response.error) {
        setError(response.error)
      } else if (response.bio) {
        onBioExtracted(response.bio)
      }
    } catch (err) {
      setError('Failed to extract bio. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-80 shadow-lg",
      "transition-transform duration-200 ease-in-out",
      "border-2 border-muted",
      "hover:shadow-xl"
    )}>
      <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Bio Assistant</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          I can help extract a bio from your website. Click below to start.
        </p>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={handleExtractBio}
            disabled={isExtracting || !website}
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              'Extract Bio'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 