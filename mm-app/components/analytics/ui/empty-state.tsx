interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-4xl mb-4">📊</div>
      <h3 className="text-lg font-medium mb-2">No data available</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
} 