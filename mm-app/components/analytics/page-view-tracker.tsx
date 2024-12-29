import { trackPageView } from '@/lib/actions/analytics'
import { headers } from 'next/headers'

interface PageViewTrackerProps {
  pathname: string
}

export async function PageViewTracker({ pathname }: PageViewTrackerProps) {
  // Track the page view
  await trackPageView(pathname)
  
  // Return null as this is just a tracking component
  return null
} 