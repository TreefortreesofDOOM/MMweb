import { AnalyticsDashboard } from '@/components/analytics/dashboard'

export default function AnalyticsPage() {
  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      <div className="lg:col-span-2">
        <AnalyticsDashboard />
      </div>
    </div>
  )
} 