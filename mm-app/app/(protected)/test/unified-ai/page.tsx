'use client'

import { UnifiedAIProvider, UnifiedAI } from '@/components/unified-ai'

export default function UnifiedAITestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Unified AI Test Page</h1>
      
      {/* Test content */}
      <div className="grid gap-8">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Sample Content</h2>
          <p className="mb-4">
            This is a sample artwork description. The AI assistant can analyze this content
            and provide insights about its style, theme, and technical aspects.
          </p>
          <p className="mb-4">
            You can also chat with the AI assistant to get more information or
            request specific analysis.
          </p>
        </div>
      </div>

      {/* Unified AI Component */}
      <UnifiedAIProvider>
        <UnifiedAI />
      </UnifiedAIProvider>
    </div>
  )
} 