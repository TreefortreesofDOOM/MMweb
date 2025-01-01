'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bot, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/common-utils';

interface FloatingAssistantProps {
  isAnalyzing: boolean;
  analysis?: {
    description?: string;
    styles?: string[];
    techniques?: string[];
    keywords?: string[];
  };
  onApplyDescription: () => void;
  onApplyStyles: () => void;
  onApplyTechniques: () => void;
  onApplyKeywords: () => void;
  applied: {
    description: boolean;
    styles: boolean;
    techniques: boolean;
    keywords: boolean;
  };
}

export function FloatingAssistant({ 
  isAnalyzing, 
  analysis,
  onApplyDescription,
  onApplyStyles,
  onApplyTechniques,
  onApplyKeywords,
  applied 
}: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewInsights, setHasNewInsights] = useState(false);

  // Watch for new analysis results
  useEffect(() => {
    if (analysis && Object.keys(analysis).length > 0) {
      setHasNewInsights(true);
    }
  }, [analysis]);

  const floatingButtonVariants = {
    idle: {
      scale: 1,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    },
    analyzing: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    },
    hasInsights: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.5,
        repeat: 3,
        repeatType: "reverse" as const
      }
    }
  };

  const panelVariants = {
    closed: {
      width: "48px",
      height: "48px",
      borderRadius: "24px",
    },
    open: {
      width: "380px",
      height: "600px",
      borderRadius: "24px",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-[9999]"
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={panelVariants}
      style={{ 
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        pointerEvents: 'auto',
        isolation: 'isolate'
      }}
    >
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              className={cn(
                "h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300",
                hasNewInsights && "bg-primary text-primary-foreground"
              )}
              onClick={() => setIsOpen(true)}
            >
              <motion.div
                variants={floatingButtonVariants}
                animate={
                  isAnalyzing 
                    ? "analyzing" 
                    : hasNewInsights 
                    ? "hasInsights" 
                    : "idle"
                }
              >
                {isAnalyzing ? (
                  <Loader2 className="h-6 w-6" />
                ) : (
                  <Bot className="h-6 w-6" />
                )}
              </motion.div>
            </Button>
            {hasNewInsights && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
            )}
          </motion.div>
        ) : (
          <Card className="w-full h-full p-4 relative shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="space-y-4">
              <h3 className="font-semibold">AI Analysis Results</h3>
              {analysis ? (
                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                  {analysis.description && (
                    <div>
                      <h4 className="text-sm font-medium">Description</h4>
                      <p className="text-sm text-muted-foreground">{analysis.description}</p>
                      <Button
                        onClick={onApplyDescription}
                        disabled={applied.description}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        {applied.description ? 'Applied' : 'Apply Description'}
                      </Button>
                    </div>
                  )}
                  {analysis.styles && analysis.styles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium">Styles</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysis.styles.map((style, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                            {style}
                          </span>
                        ))}
                      </div>
                      <Button
                        onClick={onApplyStyles}
                        disabled={applied.styles}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        {applied.styles ? 'Applied' : 'Apply Styles'}
                      </Button>
                    </div>
                  )}
                  {analysis.techniques && analysis.techniques.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium">Techniques</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysis.techniques.map((technique, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                            {technique}
                          </span>
                        ))}
                      </div>
                      <Button
                        onClick={onApplyTechniques}
                        disabled={applied.techniques}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        {applied.techniques ? 'Applied' : 'Apply Techniques'}
                      </Button>
                    </div>
                  )}
                  {analysis.keywords && analysis.keywords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium">Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysis.keywords.map((keyword, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <Button
                        onClick={onApplyKeywords}
                        disabled={applied.keywords}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        {applied.keywords ? 'Applied' : 'Apply Keywords'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <p>Analyzing your artwork...</p>
                    </div>
                  ) : (
                    <p>No analysis results yet</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 