'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Loader2, Wand2 } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'
import { generateArtwork } from '@/lib/actions/admin/generate-artwork'
import { Badge } from '@/components/ui/badge'
import type { GenerateArtworkResult } from '@/lib/actions/admin/generate-artwork'

interface GenerationStatus {
  step: 'idle' | 'generating' | 'downloading' | 'uploading' | 'analyzing' | 'complete' | 'error'
  tempImageUrl?: string
  error?: string
}

export default function PostMMaiArtwork() {
  const { toast } = useToast()
  const [status, setStatus] = useState<GenerationStatus>({ step: 'idle' })
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<Partial<GenerateArtworkResult>>({})

  const resetState = () => {
    setStatus({ step: 'idle' })
    setResult({})
  }

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt first',
        variant: 'destructive',
      })
      return
    }

    try {
      // Reset any previous state
      setResult({})
      setStatus({ step: 'generating' })

      const response = await generateArtwork(prompt)
      
      if (!response || !response.imageUrl) {
        throw new Error('Failed to generate artwork: No image returned')
      }

      setResult(response)
      setStatus({ step: 'complete' })
      
      toast({
        title: 'Success',
        description: 'Generated and posted new artwork',
      })

      // Reset prompt for next generation
      setPrompt('')
    } catch (error) {
      console.error('Generation error:', error)
      setStatus({ 
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate artwork'
      })
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate artwork',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Generate & Post MM AI Artwork</h1>
      
      <div className="space-y-6">
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-1">
                Generation Prompt
              </label>
              <div className="flex gap-2">
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  className="flex-1"
                  placeholder="Describe the artwork you want to generate..."
                  disabled={status.step !== 'idle' && status.step !== 'error' && status.step !== 'complete'}
                />
                <Button 
                  onClick={status.step === 'error' || status.step === 'complete' ? resetState : handleGenerate}
                  disabled={(!prompt && status.step === 'idle') || (status.step !== 'idle' && status.step !== 'error' && status.step !== 'complete')}
                  variant="secondary"
                >
                  {status.step !== 'idle' && status.step !== 'error' && status.step !== 'complete' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : status.step === 'error' ? (
                    'Try Again'
                  ) : status.step === 'complete' ? (
                    'Generate New'
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {status.step !== 'idle' && (
              <div className="text-sm text-muted-foreground">
                {status.step === 'generating' && 'Generating image with DALL-E...'}
                {status.step === 'downloading' && 'Downloading generated image...'}
                {status.step === 'uploading' && 'Uploading to permanent storage...'}
                {status.step === 'analyzing' && 'Analyzing image and generating content...'}
                {status.step === 'complete' && 'Generation complete!'}
                {status.step === 'error' && (
                  <span className="text-destructive">{status.error || 'An error occurred'}</span>
                )}
              </div>
            )}

            {result.imageUrl && (
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={result.imageUrl}
                    alt={result.title || 'Generated artwork'}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {result.title && (
                  <div>
                    <h2 className="text-lg font-semibold">{result.title}</h2>
                  </div>
                )}

                {result.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>
                )}

                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
} 