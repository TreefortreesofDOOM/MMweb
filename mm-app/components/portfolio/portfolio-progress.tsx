import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePortfolioProgress } from '@/components/providers/portfolio-progress-provider'
import { XCircle } from 'lucide-react'

interface PortfolioProgressProps {
  onCancel?: () => void
}

export function PortfolioProgress({ onCancel }: PortfolioProgressProps) {
  const { state, cancelAll } = usePortfolioProgress()
  const { overallProgress, analyses, isCancelled } = state

  const handleCancel = () => {
    cancelAll()
    onCancel?.()
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Individual Analysis Progress */}
      <div className="space-y-3">
        {analyses.map(analysis => (
          <div key={analysis.type} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">
                {analysis.type.replace('portfolio_', '')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {Math.round(analysis.progress)}%
                </span>
                {analysis.status === 'error' && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            <Progress 
              value={analysis.progress} 
              className={`h-1.5 ${analysis.status === 'error' ? 'bg-destructive/20' : ''}`}
            />
            {analysis.error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{analysis.error}</AlertDescription>
              </Alert>
            )}
          </div>
        ))}
      </div>

      {/* Cancel Button */}
      {!isCancelled && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCancel}
          className="w-full"
        >
          Cancel Analysis
        </Button>
      )}
    </div>
  )
} 