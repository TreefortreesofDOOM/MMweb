import { getAISettings } from '@/lib/actions/ai-settings-actions'
import { AISettingsForm } from '@/components/admin/ai-settings-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AISettingsPage() {
  const { data: settings, error } = await getAISettings()

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="rounded-lg border border-destructive p-4">
          <h2 className="text-lg font-semibold text-destructive">Error</h2>
          <p className="text-muted-foreground">Failed to load AI settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Provider Settings</h1>
          <p className="text-muted-foreground">
            Configure which AI providers to use for different operations.
          </p>
        </div>
        
        <div className="rounded-lg border p-4">
          <AISettingsForm settings={settings || null} />
        </div>
      </div>
    </div>
  )
} 