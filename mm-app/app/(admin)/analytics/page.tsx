import { AnalyticsDashboard } from '@/components/analytics/dashboard'
import { AnalyticsAIChat } from '@/components/analytics/ai-chat'

export default function AnalyticsPage() {
  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <AnalyticsDashboard />
        </div>
        
        <div className="lg:col-span-2">
          <AnalyticsAIChat />
        </div>
      </div>
    </div>
  )
} 