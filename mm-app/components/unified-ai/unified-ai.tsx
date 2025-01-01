'use client'

import { useUnifiedAIMode, useUnifiedAIVisibility } from '@/lib/unified-ai/hooks'
import { useAnalysis } from '@/lib/unified-ai/use-analysis'
import { useChat } from '@/lib/unified-ai/use-chat'
import { UnifiedAIButton } from './unified-ai-button'
import { UnifiedAIContainer } from './unified-ai-container'
import { UnifiedAIPanel } from './unified-ai-panel'
import { UnifiedAITransition } from './unified-ai-transition'
import { UnifiedAIChatView } from './unified-ai-chat-view'
import { UnifiedAIAnalysisView } from './unified-ai-analysis-view'

export const UnifiedAI = () => {
  const mode = useUnifiedAIMode()
  const { isOpen, isMinimized } = useUnifiedAIVisibility()

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
              />
            )}
          </UnifiedAIPanel>
        </UnifiedAIContainer>
      </UnifiedAITransition>
    </>
  )
} 