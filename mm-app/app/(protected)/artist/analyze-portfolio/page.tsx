'use client'

import { Card } from '@/components/ui/card'
import { useUnifiedAI } from '@/lib/unified-ai/context'
import { useEffect } from 'react'
import { useArtist } from '@/components/providers/artist-provider'
import { UnifiedAI } from '@/components/unified-ai/unified-ai'
import { PortfolioProgressProvider } from '@/components/providers/portfolio-progress-provider'

export default function AnalyzePortfolioPage() {
  const { dispatch } = useUnifiedAI()
  const { profile } = useArtist()

  useEffect(() => {
    if (profile?.id) {
      dispatch({ 
        type: 'SET_PAGE_CONTEXT', 
        payload: {
          pageType: 'portfolio',
          profileId: profile.id
        }
      })
      // Open the UnifiedAI panel in analysis mode
      dispatch({ type: 'SET_MODE', payload: 'analysis' })
      dispatch({ type: 'SET_OPEN', payload: true })
      dispatch({ type: 'SET_MINIMIZED', payload: false })
    }
  }, [profile?.id, dispatch])

  return (
    <div className="container py-8 space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Portfolio Analysis</h1>
        <p className="text-muted-foreground">
          Get AI-powered insights to optimize your portfolio presentation and performance.
        </p>
      </div>
      
      <Card className="p-6">
        <p>Click the AI Assistant button in the bottom right to start analyzing your portfolio.</p>
      </Card>

      <PortfolioProgressProvider>
        <UnifiedAI />
      </PortfolioProgressProvider>
    </div>
  )
} 