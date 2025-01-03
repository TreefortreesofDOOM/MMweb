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
import type { AnalysisResult } from '@/lib/unified-ai/types'
import { updateProfileBio } from '@/lib/actions/profile'
import { useToast } from '@/components/ui/use-toast'

export const UnifiedAI = () => {
  const mode = useUnifiedAIMode()
  const { isOpen, isMinimized } = useUnifiedAIVisibility()
  const context = useUnifiedAIContext()
  const websiteUrl = context.pageContext?.data?.websiteUrl
  const { toast } = useToast()

  // Initialize analysis and chat hooks
  const { isAnalyzing, analyze } = useAnalysis({
    onError: (error) => {
      console.error('Analysis error:', error)
    }
  })

  const { isLoading: isChatLoading, sendMessage } = useChat({
    onError: (error) => {
      console.error('Chat error:', error)
    }
  })

  // Handle mode transitions
  const handleAnalysisRequest = async () => {
    try {
      await analyze('content_analysis', 'Sample content for analysis')
    } catch (error) {
      console.error('Failed to start analysis:', error)
    }
  }

  const handleChatRequest = async () => {
    try {
      await sendMessage('Hello! I need some assistance.')
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
    } catch (error) {
      console.error('Failed to apply result:', error)
      toast({
        title: "Error",
        description: "Failed to update bio. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && <UnifiedAIButton />}

      {/* Panel */}
      <UnifiedAITransition show={isOpen && !isMinimized}>
        <UnifiedAIContainer>
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
        </UnifiedAIContainer>
      </UnifiedAITransition>
    </>
  )
} 