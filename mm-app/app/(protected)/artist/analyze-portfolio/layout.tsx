'use client'

import { Suspense } from 'react'
import { PortfolioProgressProvider } from '@/components/providers/portfolio-progress-provider'

export default function AnalyzePortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense>
      <PortfolioProgressProvider>
        <Suspense>
          {children}
        </Suspense>
      </PortfolioProgressProvider>
    </Suspense>
  )
} 