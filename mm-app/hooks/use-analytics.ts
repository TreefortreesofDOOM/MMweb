import { useCallback } from 'react';
import { useUser } from '@/hooks/use-user';
import { trackEvent, trackFeatureUsage, EventType } from '@/lib/analytics';

export function useAnalytics() {
  const { user } = useUser();

  const trackUserEvent = useCallback(async (
    eventType: EventType,
    eventName: string,
    eventData?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      await trackEvent({
        userId: user.id,
        eventType,
        eventName,
        eventData,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user?.id]);

  const trackFeature = useCallback(async (
    featureName: string,
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      await trackFeatureUsage({
        userId: user.id,
        featureName,
        metadata,
      });
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }, [user?.id]);

  return {
    trackEvent: trackUserEvent,
    trackFeature,
  };
} 