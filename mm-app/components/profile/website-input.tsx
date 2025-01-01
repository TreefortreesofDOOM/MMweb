'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createRoot } from 'react-dom/client'
import { WebsiteBioAssistant } from './website-bio-assistant'

interface WebsiteInputProps {
  website: string | null;
  required?: boolean;
}

export const WebsiteInput = ({ website, required }: WebsiteInputProps) => {
  const [currentWebsite, setCurrentWebsite] = useState(website || '')
  const [isValid, setIsValid] = useState(true)

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

  const handleShowAssistant = () => {
    if (!currentWebsite || !isValid) return

    const assistantDiv = document.createElement('div')
    assistantDiv.id = 'bio-assistant'
    document.body.appendChild(assistantDiv)
    
    const root = createRoot(assistantDiv)
    root.render(
      <WebsiteBioAssistant
        website={currentWebsite.startsWith('http') ? currentWebsite : `https://${currentWebsite}`}
        onBioExtracted={(bio) => {
          const bioTextarea = document.getElementById('bio') as HTMLTextAreaElement
          if (bioTextarea) {
            bioTextarea.value = bio
          }
        }}
        onClose={() => {
          root.unmount()
          assistantDiv.remove()
        }}
      />
    )
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