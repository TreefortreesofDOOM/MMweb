'use client'

import { useUnifiedAIMode, useUnifiedAIVisibility, useUnifiedAIContext } from '@/lib/unified-ai/hooks'
import { useAnalysis } from '@/lib/unified-ai/use-analysis'
import { useChat } from '@/lib/unified-ai/use-chat'
import { UnifiedAIButton } from './unified-ai-button'
import { UnifiedAIContainer } from './unified-ai-container'
import { UnifiedAIPanel } from './unified-ai-panel'
import { UnifiedAITransition } from './unified-ai-transition'
import { UnifiedAIChatView } from './unified-ai-chat-view'
import { UnifiedAIAnalysisView } from './unified-ai-analysis-view'
import type { AnalysisResult, AIContext } from '@/lib/unified-ai/types'
import { updateProfileBio } from '@/lib/actions/profile'
import { useToast } from '@/components/ui/use-toast'
import { useContextAwareness } from '@/lib/unified-ai/hooks/use-context-awareness'

export const UnifiedAI = () => {
  const mode = useUnifiedAIMode()
  const { isOpen } = useUnifiedAIVisibility()
  const { pageContext } = useUnifiedAIContext()
  const websiteUrl = pageContext.data?.websiteUrl
  const { toast } = useToast()

  // Initialize analysis and chat hooks
  /*
  It looks like this is leftover code from an earlier implementation 
  where analysis was handled directly in the parent component, 
  but has since been moved down to child components 
  for better separation of concerns. 
  We could safely remove these unused destructured values

  const { isAnalyzing, analyze } = useAnalysis({
    onError: (error) => {
      console.error('Analysis error:', error)
    }
  })
*/
useContextAwareness()  

  const { sendMessage } = useChat({
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

  // Handle mode transitions
  const handleAnalysisRequest = async () => {
    try {
      // Remove sample analysis - this was a development placeholder
      // await analyze('content_analysis', 'Sample content for analysis')
    } catch (error) {
      console.error('Analysis request failed:', error)
    }
  }

  const handleChatRequest = async () => {
    try {
      await sendMessage('Hi!.')
    } catch (error) {
      console.error('Failed to start chat:', error)
    }
  }

  const handleApplyResult = async (result: AnalysisResult) => {
    try {
      if (result.type === 'bio_extraction' && result.status === 'success') {
        await updateProfileBio(result.content)
        toast({
          title: "Success",
          description: "Bio has been updated in your profile",
        })
        window.location.reload()
      }
      
      // Handle artwork analysis results
      if (result.type.startsWith('artwork_') && result.status === 'success') {
        const callbacks = pageContext.data?.artworkCallbacks
        if (!callbacks) {
          console.warn('No artwork callbacks registered')
          return
        }

        switch (result.type) {
          case 'artwork_description':
            callbacks.onApplyDescription(result.content)
            break
          case 'artwork_style':
            callbacks.onApplyStyles(result.results?.details || [])
            break
          case 'artwork_techniques':
            callbacks.onApplyTechniques(result.results?.details || [])
            break
          case 'artwork_keywords':
            callbacks.onApplyKeywords(result.results?.details || [])
            break
        }

        toast({
          title: "Success",
          description: "Applied analysis results to artwork form",
        })
      }
    } catch (error) {
      console.error('Failed to apply result:', error)
      toast({
        title: "Error",
        description: "Failed to apply results. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <UnifiedAITransition show={true}>
      <UnifiedAIContainer>
        <UnifiedAIButton />
        {isOpen && (
          <UnifiedAIPanel>
            {mode === 'chat' ? (
              <UnifiedAIChatView
                onAnalysisRequest={handleAnalysisRequest}
              />
            ) : (
              <UnifiedAIAnalysisView
                onChatRequest={handleChatRequest}
                websiteUrl={websiteUrl}
                onApplyResult={handleApplyResult}
              />
            )}
          </UnifiedAIPanel>
        )}
      </UnifiedAIContainer>
    </UnifiedAITransition>
  )
} 