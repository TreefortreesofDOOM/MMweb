'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeArtwork } from '@/app/actions';
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
      const result = await analyzeArtwork(imageUrl);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setAnalysis(result);
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
    <Card className="border-2 border-muted">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>AI Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Get AI-powered suggestions for your artwork
            </p>
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            variant="secondary"
            className="min-w-[120px]"
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
      <CardContent className="space-y-6">
        {/* Description Section */}
        {analysis.description && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Description</h3>
              <Button
                onClick={handleApplyDescription}
                size="sm"
                variant={applied.description ? "secondary" : "default"}
                disabled={applied.description}
                className="min-w-[100px]"
              >
                {applied.description ? 'Applied ✓' : 'Apply'}
              </Button>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{analysis.description}</p>
          </div>
        )}

        {/* Styles Section */}
        {analysis.styles && analysis.styles.length > 0 && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Styles</h3>
              <Button
                onClick={handleApplyStyles}
                size="sm"
                variant={applied.styles ? "secondary" : "default"}
                disabled={applied.styles}
                className="min-w-[100px]"
              >
                {applied.styles ? 'Applied ✓' : 'Apply'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.styles.map((style, index) => (
                <Badge key={index} variant="outline" className="bg-background">
                  {style}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Techniques Section */}
        {analysis.techniques && analysis.techniques.length > 0 && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Techniques</h3>
              <Button
                onClick={handleApplyTechniques}
                size="sm"
                variant={applied.techniques ? "secondary" : "default"}
                disabled={applied.techniques}
                className="min-w-[100px]"
              >
                {applied.techniques ? 'Applied ✓' : 'Apply'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.techniques.map((technique, index) => (
                <Badge key={index} variant="outline" className="bg-background">
                  {technique}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Keywords Section */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Keywords</h3>
              <Button
                onClick={handleApplyKeywords}
                size="sm"
                variant={applied.keywords ? "secondary" : "default"}
                disabled={applied.keywords}
                className="min-w-[100px]"
              >
                {applied.keywords ? 'Applied ✓' : 'Apply'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="bg-background">
                  {keyword}
                </Badge>
              ))}
            </div>
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