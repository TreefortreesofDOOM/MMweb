'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeArtwork } from '@/lib/actions';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useFloatingAssistant } from '@/components/providers/floating-assistant-provider';

interface ArtworkAIAnalysisProps {
  imageUrl: string;
  onApplyDescription: (description: string) => void;
  onApplyStyles: (styles: string[]) => void;
  onApplyTechniques: (techniques: string[]) => void;
  onApplyKeywords: (keywords: string[]) => void;
}

export function ArtworkAIAnalysis({
  imageUrl,
  onApplyDescription,
  onApplyStyles,
  onApplyTechniques,
  onApplyKeywords,
}: ArtworkAIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    description?: string;
    styles?: string[];
    techniques?: string[];
    keywords?: string[];
  }>({});
  const [applied, setApplied] = useState<{
    description: boolean;
    styles: boolean;
    techniques: boolean;
    keywords: boolean;
    bio: boolean;
  }>({
    description: false,
    styles: false,
    techniques: false,
    keywords: false,
    bio: false
  });

  const { setAnalysisState } = useFloatingAssistant();

  // Update floating assistant state when local state changes
  useEffect(() => {
    setAnalysisState({
      isAnalyzing,
      analysis,
      onApplyDescription: handleApplyDescription,
      onApplyStyles: handleApplyStyles,
      onApplyTechniques: handleApplyTechniques,
      onApplyKeywords: handleApplyKeywords,
      applied
    });
  }, [isAnalyzing, analysis, applied]);

  // Auto-analyze when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      handleAnalyze();
    }
  }, [imageUrl]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('imageUrl', imageUrl);
      const result = await analyzeArtwork(formData);
      if (result.error) {
        setAnalysis({});
        return;
      }
      setAnalysis(result.analysis ?? { description: '', styles: [], techniques: [], keywords: [] });
      // Reset applied state when new analysis is performed
      setApplied({
        description: false,
        styles: false,
        techniques: false,
        keywords: false,
        bio: false
      });
    } catch (error) {
      console.error('Error analyzing artwork:', error);
      setAnalysis({});
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyDescription = () => {
    if (analysis.description) {
      onApplyDescription(analysis.description);
      setApplied(prev => ({ ...prev, description: true }));
    }
  };

  const handleApplyStyles = () => {
    if (analysis.styles?.length) {
      onApplyStyles(analysis.styles);
      setApplied(prev => ({ ...prev, styles: true }));
    }
  };

  const handleApplyTechniques = () => {
    if (analysis.techniques?.length) {
      onApplyTechniques(analysis.techniques);
      setApplied(prev => ({ ...prev, techniques: true }));
    }
  };

  const handleApplyKeywords = () => {
    if (analysis.keywords?.length) {
      onApplyKeywords(analysis.keywords);
      setApplied(prev => ({ ...prev, keywords: true }));
    }
  };

  return (
    <Card className="border-2 border-muted shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">AI Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isAnalyzing 
                ? "Analyzing your artwork..."
                : analysis && Object.keys(analysis).length > 0
                ? "Analysis complete! Click the floating assistant in the bottom right to view insights and suggestions."
                : "Upload an image to get AI-powered suggestions for your artwork"}
            </p>
          </div>
          <div className="min-w-[120px] text-right">
            {isAnalyzing ? (
              <div className="flex items-center justify-end gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing...</span>
              </div>
            ) : analysis && Object.keys(analysis).length > 0 ? (
              <Badge variant="secondary">
                Ready
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
} 