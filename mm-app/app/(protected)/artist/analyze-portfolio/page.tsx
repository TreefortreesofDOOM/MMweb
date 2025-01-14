'use client'

import { PortfolioAnalysis } from '@/components/portfolio/portfolio-analysis'
import { useAuth } from '@/hooks/use-auth'

export default function AnalyzePortfolioPage() {
  const { user } = useAuth()
  
  if (!user?.id) {
    return null // Auth layout will handle redirect
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Portfolio</h1>
      
      <PortfolioAnalysis 
        profileId={user.id}
        onAnalysisComplete={(results) => {
          console.log('Analysis results:', results)
          // Handle analysis results (e.g., save to database, update UI)
        }}
      />
    </div>
  )
} 