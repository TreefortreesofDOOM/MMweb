'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useUnifiedAI } from '@/lib/unified-ai/context'
import { useAnalysis } from '@/lib/unified-ai/use-analysis'

interface WebsiteInputProps {
  website: string | null;
  required?: boolean;
}

export const WebsiteInput = ({ website, required }: WebsiteInputProps) => {
  const [currentWebsite, setCurrentWebsite] = useState(website || '')
  const [isValid, setIsValid] = useState(true)
  const { dispatch } = useUnifiedAI()
  const { isAnalyzing, analyze } = useAnalysis()

  const validateUrl = (url: string) => {
    if (!url) return true // Empty is valid unless required
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCurrentWebsite(value)
    setIsValid(validateUrl(value))
  }

  const handleShowAssistant = async () => {
    if (!currentWebsite || !isValid) return

    dispatch({ 
      type: 'SET_PAGE_CONTEXT', 
      payload: {
        route: '/profile',
        pageType: 'profile',
        persona: 'collector',
        data: { websiteUrl: currentWebsite }
      }
    })
    dispatch({ type: 'SET_MODE', payload: 'analysis' })
    dispatch({ type: 'SET_OPEN', payload: true })
    
    try {
      await analyze('bio_extraction', currentWebsite)
    } catch (error) {
      console.error('Failed to analyze website:', error)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="website">Website</Label>
      <div className="relative">
        <Input
          id="website"
          name="website"
          type="url"
          value={currentWebsite}
          onChange={handleWebsiteChange}
          placeholder="https://your-website.com"
          required={required}
          className={!isValid ? 'border-destructive' : undefined}
        />
        {!isValid && (
          <p className="text-sm text-destructive mt-1">
            Please enter a valid website URL
          </p>
        )}
        {currentWebsite && isValid && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={handleShowAssistant}
          >
            Extract Bio
          </Button>
        )}
      </div>
    </div>
  )
} 