'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bot, X, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/common-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArtistAssistant } from './artist-assistant';

interface FloatingAssistantProps {
  isAnalyzing: boolean;
  analysis?: {
    description?: string;
    styles?: string[];
    techniques?: string[];
    keywords?: string[];
    bio?: {
      content: string;
      source: string;
      status: 'success' | 'error';
      error?: string;
    };
  };
  onApplyDescription: () => void;
  onApplyStyles: () => void;
  onApplyTechniques: () => void;
  onApplyKeywords: () => void;
  onApplyBio: () => void;
  applied: {
    description: boolean;
    styles: boolean;
    techniques: boolean;
    keywords: boolean;
    bio: boolean;
  };
  artworkId?: string;
  imageUrl?: string;
}

export function FloatingAssistant({
  isAnalyzing,
  analysis,
  onApplyDescription,
  onApplyStyles,
  onApplyTechniques,
  onApplyKeywords,
  onApplyBio,
  applied,
  artworkId,
  imageUrl
}: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewInsights, setHasNewInsights] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');

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

  const renderAnalysisContent = () => (
    <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
      {analysis ? (
        <>
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

          {analysis.bio && (
            <div>
              <h4 className="text-sm font-medium">Bio from Website</h4>
              {analysis.bio.status === 'error' ? (
                <div className="rounded-md bg-destructive/10 p-3 mt-2 text-sm text-destructive">
                  {analysis.bio.error || 'Failed to extract bio'}
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{analysis.bio.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">Source: {analysis.bio.source}</p>
                  <Button
                    onClick={onApplyBio}
                    disabled={applied.bio}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    {applied.bio ? 'Applied' : 'Apply Bio'}
                  </Button>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Analyzing...</p>
            </div>
          ) : (
            <p>No analysis results yet</p>
          )}
        </div>
      )}
    </div>
  );

  const renderChatContent = () => (
    <div className="h-full overflow-hidden">
      <ArtistAssistant artworkId={artworkId} imageUrl={imageUrl} />
    </div>
  );

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
          <Card className="w-full h-full shadow-2xl flex flex-col">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'analysis' | 'chat')} 
              className="flex flex-col h-full"
            >
              <div className="shrink-0 px-4 pt-4 flex items-center justify-between border-b pb-4">
                <TabsList className="grid w-[200px] grid-cols-2">
                  <TabsTrigger value="analysis" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Analysis
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                </TabsList>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 min-h-0">
                <TabsContent value="analysis" className="h-full">
                  <div className="p-4 h-full overflow-y-auto">
                    {renderAnalysisContent()}
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="h-full">
                  {renderChatContent()}
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 