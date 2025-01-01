'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { FloatingAssistant } from '@/components/ai/floating-assistant';

interface FloatingAssistantContextType {
  setAnalysisState: (state: {
    isAnalyzing: boolean;
    analysis?: {
      description?: string;
      styles?: string[];
      techniques?: string[];
      keywords?: string[];
    };
    onApplyDescription?: () => void;
    onApplyStyles?: () => void;
    onApplyTechniques?: () => void;
    onApplyKeywords?: () => void;
    applied?: {
      description: boolean;
      styles: boolean;
      techniques: boolean;
      keywords: boolean;
    };
  }) => void;
}

const FloatingAssistantContext = createContext<FloatingAssistantContextType | null>(null);

export function useFloatingAssistant() {
  const context = useContext(FloatingAssistantContext);
  if (!context) {
    throw new Error('useFloatingAssistant must be used within a FloatingAssistantProvider');
  }
  return context;
}

export function FloatingAssistantProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    isAnalyzing: boolean;
    analysis?: {
      description?: string;
      styles?: string[];
      techniques?: string[];
      keywords?: string[];
    };
    onApplyDescription?: () => void;
    onApplyStyles?: () => void;
    onApplyTechniques?: () => void;
    onApplyKeywords?: () => void;
    applied?: {
      description: boolean;
      styles: boolean;
      techniques: boolean;
      keywords: boolean;
    };
  }>({
    isAnalyzing: false,
    applied: {
      description: false,
      styles: false,
      techniques: false,
      keywords: false
    }
  });

  const setAnalysisState = useCallback((newState: typeof state) => {
    setState(newState);
  }, []);

  return (
    <FloatingAssistantContext.Provider value={{ setAnalysisState }}>
      {children}
      <FloatingAssistant
        isAnalyzing={state.isAnalyzing}
        analysis={state.analysis}
        onApplyDescription={state.onApplyDescription || (() => {})}
        onApplyStyles={state.onApplyStyles || (() => {})}
        onApplyTechniques={state.onApplyTechniques || (() => {})}
        onApplyKeywords={state.onApplyKeywords || (() => {})}
        applied={state.applied || {
          description: false,
          styles: false,
          techniques: false,
          keywords: false
        }}
      />
    </FloatingAssistantContext.Provider>
  );
} 