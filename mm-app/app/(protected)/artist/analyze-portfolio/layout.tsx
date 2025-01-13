'use client'

import { Suspense } from 'react'
import { UnifiedAIProvider } from '@/components/unified-ai/unified-ai-provider'
import { PortfolioProgressProvider } from '@/components/providers/portfolio-progress-provider'

export default function AnalyzePortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense>
      <PortfolioProgressProvider>
        <UnifiedAIProvider>
          <Suspense>
            {children}
          </Suspense>
        </UnifiedAIProvider>
      </PortfolioProgressProvider>
    </Suspense>
  )
} 