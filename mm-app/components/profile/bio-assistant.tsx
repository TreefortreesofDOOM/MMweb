'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAnalysis } from '@/lib/unified-ai/use-analysis'
import { useUnifiedAIActions } from '@/lib/unified-ai/hooks'

interface BioAssistantProps {
  onBioExtracted: (bio: string) => void;
  website: string;
  onClose: () => void;
}

export const BioAssistant = ({ 
  onBioExtracted, 
  website,
  onClose 
}: BioAssistantProps) => {
  const [error, setError] = useState<string>()
  const { isAnalyzing, analyze } = useAnalysis({
    onError: (error) => setError(error)
  })
  const { setOpen, setMode, reset } = useUnifiedAIActions()

  const handleExtractBio = async () => {
    if (!website) return
    
    setError(undefined)
    reset()
    
    setMode('analysis')
    setOpen(true)
    
    try {
      const result = await analyze('bio_extraction', website)
      if (result.status === 'success') {
        onBioExtracted(result.results.summary)
      } else {
        setError(result.error || 'Failed to extract bio')
      }
    } catch (err) {
      setError('Failed to extract bio. Please try again.')
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
            disabled={isAnalyzing || !website}
          >
            {isAnalyzing ? (
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