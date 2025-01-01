'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useFloatingAssistant } from '@/components/providers/floating-assistant-provider'
import { extractBioAction } from '@/lib/actions/extract-bio'

interface WebsiteInputProps {
  website: string | null;
  required?: boolean;
}

type FloatingAssistantState = {
  isAnalyzing: boolean;
  analysis?: {
    description?: string;
    styles?: string[];
    techniques?: string[];
    keywords?: string[];
    bio?: {
      content: string;
      source: string;
      status: 'success' | 'error';
      error?: string;
    };
  };
  onApplyDescription?: () => void;
  onApplyStyles?: () => void;
  onApplyTechniques?: () => void;
  onApplyKeywords?: () => void;
  onApplyBio?: () => void;
  applied?: {
    description: boolean;
    styles: boolean;
    techniques: boolean;
    keywords: boolean;
    bio: boolean;
  };
}

export const WebsiteInput = ({ website, required }: WebsiteInputProps) => {
  const [currentWebsite, setCurrentWebsite] = useState(website || '')
  const [isValid, setIsValid] = useState(true)
  const { setAnalysisState } = useFloatingAssistant()

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

    // Initial state while loading
    const initialState: FloatingAssistantState = {
      isAnalyzing: true,
      analysis: undefined,
      onApplyBio: () => {},
      applied: {
        description: false,
        styles: false,
        techniques: false,
        keywords: false,
        bio: false
      }
    }
    setAnalysisState(initialState)

    try {
      const { bio, error } = await extractBioAction(
        currentWebsite.startsWith('http') ? currentWebsite : `https://${currentWebsite}`
      )

      // Update state with bio result
      const successState: FloatingAssistantState = {
        isAnalyzing: false,
        analysis: {
          bio: {
            content: bio,
            source: currentWebsite,
            status: error ? 'error' : 'success',
            error
          }
        },
        onApplyBio: () => {
          const bioTextarea = document.getElementById('bio') as HTMLTextAreaElement
          if (bioTextarea && bio) {
            bioTextarea.value = bio
          }
        },
        applied: {
          description: false,
          styles: false,
          techniques: false,
          keywords: false,
          bio: false
        }
      }
      setAnalysisState(successState)
    } catch (err) {
      // Update state with error
      const errorState: FloatingAssistantState = {
        isAnalyzing: false,
        analysis: {
          bio: {
            content: '',
            source: currentWebsite,
            status: 'error',
            error: err instanceof Error ? err.message : 'Failed to extract bio'
          }
        },
        onApplyBio: () => {},
        applied: {
          description: false,
          styles: false,
          techniques: false,
          keywords: false,
          bio: false
        }
      }
      setAnalysisState(errorState)
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