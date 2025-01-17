'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useAnalysis } from '@/lib/unified-ai/use-analysis';
import { useUnifiedAIActions } from '@/lib/unified-ai/hooks';
import { createAnalysisResult } from '@/lib/unified-ai/utils';
import { useUnifiedAI } from '@/lib/unified-ai/context';

interface ArtworkAIAnalysisProps {
  imageUrl: string;
  mode: 'create' | 'edit';
  existingAnalysis?: {
    description?: string;
    styles?: string[];
    techniques?: string[];
    keywords?: string[];
  };
  onApplyDescription: (description: string) => void;
  onApplyStyles: (styles: string[]) => void;
  onApplyTechniques: (techniques: string[]) => void;
  onApplyKeywords: (keywords: string[]) => void;
}

export function ArtworkAIAnalysis({
  imageUrl,
  mode,
  existingAnalysis,
  onApplyDescription,
  onApplyStyles,
  onApplyTechniques,
  onApplyKeywords,
}: ArtworkAIAnalysisProps) {
  const [error, setError] = useState<string>()
  const { isAnalyzing, analyze } = useAnalysis({
    onError: (error) => setError(error)
  })
  const { setOpen, setMode, reset } = useUnifiedAIActions()
  const { state, dispatch } = useUnifiedAI()
  const hasStartedAnalysis = useRef(false)

  // Register callbacks with unified-ai context
  useEffect(() => {
    // Only set page context if we're in artwork mode
    if (mode === 'create' || mode === 'edit') {
      dispatch({
        type: 'SET_PAGE_CONTEXT',
        payload: {
          data: {
            artworkCallbacks: {
              onApplyDescription,
              onApplyStyles,
              onApplyTechniques,
              onApplyKeywords
            }
          },
          route: '/artwork',
          pageType: 'artwork',
          persona: 'advisor'
        }
      })
    }
  }, [onApplyDescription, onApplyStyles, onApplyTechniques, onApplyKeywords, dispatch, mode])

  // Only auto-analyze in create mode when imageUrl is first set
  useEffect(() => {
    if (mode === 'create' && imageUrl && !hasStartedAnalysis.current) {
      handleAnalyze()
    }
  }, [imageUrl, mode])

  // Set existing analysis in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingAnalysis && !hasStartedAnalysis.current) {
      // Apply existing analysis to the context
      if (existingAnalysis.description) {
        dispatch({
          type: 'ADD_ANALYSIS',
          payload: createAnalysisResult('artwork_description', existingAnalysis.description)
        })
      }
      if (existingAnalysis.styles?.length) {
        dispatch({
          type: 'ADD_ANALYSIS',
          payload: createAnalysisResult('artwork_style', existingAnalysis.styles.join(', '))
        })
      }
      if (existingAnalysis.techniques?.length) {
        dispatch({
          type: 'ADD_ANALYSIS',
          payload: createAnalysisResult('artwork_techniques', existingAnalysis.techniques.join(', '))
        })
      }
      if (existingAnalysis.keywords?.length) {
        dispatch({
          type: 'ADD_ANALYSIS',
          payload: createAnalysisResult('artwork_keywords', existingAnalysis.keywords.join(', '))
        })
      }
      hasStartedAnalysis.current = true
    }
  }, [mode, existingAnalysis, imageUrl, dispatch])

  const handleAnalyze = async () => {
    if (!imageUrl) return
    
    // Reset state and mark analysis as started
    hasStartedAnalysis.current = true
    setError(undefined)
    reset()
    setMode('analysis')
    setOpen(true)
    
    try {
      // Check if any analysis is already in progress
      const hasExistingAnalysis = state.context.analysis.some((a: { status: string; content: string }) => 
        a.status === 'pending' || 
        (a.status === 'success' && a.content === imageUrl)
      )
      if (hasExistingAnalysis) {
        console.log('Analysis already in progress or completed')
        return
      }

      // Start all analyses in parallel
      await Promise.all([
        analyze('artwork_description', imageUrl),
        analyze('artwork_style', imageUrl),
        analyze('artwork_techniques', imageUrl),
        analyze('artwork_keywords', imageUrl)
      ])
    } catch (err) {
      console.error('Error analyzing artwork:', err)
      setError('Failed to analyze artwork. Please try again.')
      hasStartedAnalysis.current = false
    }
  }

  // Allow manual re-analysis
  const handleReanalyze = () => {
    // Reset all state
    hasStartedAnalysis.current = false
    setError(undefined)
    
    // Clear the UnifiedAI context
    dispatch({ type: 'RESET' })
    reset()
    setMode('analysis')
    setOpen(true)
    
    // Start new analysis
    handleAnalyze()
  }

  return (
    <Card className="border-2 border-muted shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">AI Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isAnalyzing 
                ? "Analyzing your artwork..."
                : mode === 'edit'
                  ? "Click Analyze to update the AI analysis."
                  : "Click the chat icon to view insights and suggestions."}
            </p>
          </div>
          <div className="min-w-[120px] text-right">
            {isAnalyzing ? (
              <div className="flex items-center justify-end gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            ) : (
              <Badge variant="secondary">
                Ready
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            disabled={isAnalyzing || !imageUrl}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : mode === 'edit' ? (
              'Re-analyze'
            ) : (
              'Analyze'
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </CardContent>
    </Card>
  );
} 