'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeArtwork } from '@/lib/actions';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

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
  }>({
    description: false,
    styles: false,
    techniques: false,
    keywords: false
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('imageUrl', imageUrl);
      const result = await analyzeArtwork(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setAnalysis(result.analysis);
      // Reset applied state when new analysis is performed
      setApplied({
        description: false,
        styles: false,
        techniques: false,
        keywords: false
      });
    } catch (error) {
      toast.error('Failed to analyze artwork');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyDescription = () => {
    if (analysis.description) {
      onApplyDescription(analysis.description);
      setApplied(prev => ({ ...prev, description: true }));
      toast.success('Description applied successfully');
    }
  };

  const handleApplyStyles = () => {
    if (analysis.styles?.length) {
      onApplyStyles(analysis.styles);
      setApplied(prev => ({ ...prev, styles: true }));
      toast.success('Styles applied successfully');
    }
  };

  const handleApplyTechniques = () => {
    if (analysis.techniques?.length) {
      onApplyTechniques(analysis.techniques);
      setApplied(prev => ({ ...prev, techniques: true }));
      toast.success('Techniques applied successfully');
    }
  };

  const handleApplyKeywords = () => {
    if (analysis.keywords?.length) {
      onApplyKeywords(analysis.keywords);
      setApplied(prev => ({ ...prev, keywords: true }));
      toast.success('Keywords applied successfully');
    }
  };

  return (
    <Card className="border-2 border-muted shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">AI Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Get AI-powered suggestions for your artwork
            </p>
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            variant="secondary"
            className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Image'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {analysis.description && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">Description</h3>
            <p className="text-sm text-muted-foreground">{analysis.description}</p>
            <Button 
              onClick={handleApplyDescription} 
              disabled={applied.description}
              variant="outline"
              className="mt-2 text-sm"
            >
              {applied.description ? 'Applied' : 'Apply Description'}
            </Button>
          </div>
        )}

        {analysis.styles && analysis.styles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">Styles</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.styles.map((style, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {style}
                </Badge>
              ))}
            </div>
            <Button 
              onClick={handleApplyStyles} 
              disabled={applied.styles}
              variant="outline"
              className="mt-2 text-sm"
            >
              {applied.styles ? 'Applied' : 'Apply Styles'}
            </Button>
          </div>
        )}

        {analysis.techniques && analysis.techniques.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">Techniques</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.techniques.map((technique, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {technique}
                </Badge>
              ))}
            </div>
            <Button 
              onClick={handleApplyTechniques} 
              disabled={applied.techniques}
              variant="outline"
              className="mt-2 text-sm"
            >
              {applied.techniques ? 'Applied' : 'Apply Techniques'}
            </Button>
          </div>
        )}

        {analysis.keywords && analysis.keywords.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
            <Button 
              onClick={handleApplyKeywords} 
              disabled={applied.keywords}
              variant="outline"
              className="mt-2 text-sm"
            >
              {applied.keywords ? 'Applied' : 'Apply Keywords'}
            </Button>
          </div>
        )}

        {!isAnalyzing && !analysis.description && (
          <div className="py-8 text-center text-muted-foreground">
            <p>Click 'Analyze Image' to get AI-powered suggestions for your artwork</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 