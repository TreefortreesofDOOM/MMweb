'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useUnifiedAI } from '@/lib/unified-ai/context'
import { useAnalysis } from '@/lib/unified-ai/use-analysis'
import { updateProfileWebsite } from '@/lib/actions/profile'
import { useToast } from "@/components/ui/use-toast"

interface WebsiteInputProps {
  website: string | null;
  required?: boolean;
}

const SOCIAL_MEDIA_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'x.com'
]

export const WebsiteInput = ({ website, required }: WebsiteInputProps) => {
  const [currentWebsite, setCurrentWebsite] = useState(website || '')
  const [isValid, setIsValid] = useState(true)
  const { dispatch } = useUnifiedAI()
  const { isAnalyzing, analyze } = useAnalysis()
  const { toast } = useToast()

  const isSocialMediaUrl = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return SOCIAL_MEDIA_DOMAINS.some(domain => urlObj.hostname.includes(domain))
    } catch {
      return false
    }
  }

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

    if (isSocialMediaUrl(currentWebsite)) {
      toast({
        title: "Social Media Not Supported",
        description: "Bio extraction from social media sites is not supported due to access restrictions. Please enter your personal or portfolio website instead.",
        variant: "destructive"
      })
      return
    }

    // Save website URL to database first
    await updateProfileWebsite(currentWebsite)
    
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
      const result = await analyze('bio_extraction', currentWebsite)
      if (result.status === 'error') {
        let errorMessage = 'Failed to extract bio. Please try again.'
        
        if (result.error?.includes('Failed to fetch')) {
          errorMessage = "Unable to access this website. This might be due to access restrictions. Please try your personal or portfolio website instead."
        } else if (result.error?.includes('No bio content found')) {
          errorMessage = "No bio content found on this website. Please ensure your bio is publicly accessible on the webpage."
        }

        toast({
          title: "Bio Extraction Failed",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to analyze website:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      })
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
          placeholder="www.your-website.com"
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
      <p className="text-sm text-muted-foreground">
        Enter your personal or portfolio website. Social media profiles are not supported.
      </p>
    </div>
  )
} 