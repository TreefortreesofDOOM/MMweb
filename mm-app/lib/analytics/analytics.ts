import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { v4 as uuidv4 } from 'uuid';

export type EventType = 
  | 'page_view'
  | 'feature_use'
  | 'role_conversion'
  | 'artwork_interaction'
  | 'gallery_interaction'
  | 'profile_interaction'
  | 'social_interaction'
  | 'onboarding'
  | 'profile_completion'
  | 'artist_verification';

interface TrackEventParams {
  userId: string;
  eventType: EventType;
  eventName: string;
  eventData?: Record<string, any>;
  sessionId?: string;
}

interface TrackSessionParams {
  userId: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface TrackFeatureParams {
  userId: string;
  featureName: string;
  metadata?: Record<string, any>;
}

interface TrackRoleConversionParams {
  userId: string;
  fromRole: string;
  toRole: string;
  conversionType: 'upgrade' | 'downgrade' | 'initial';
  metadata?: Record<string, any>;
}

export async function getOrCreateSession(userId: string): Promise<string> {
  const supabase = await createActionClient();
  const sessionId = uuidv4();

  // Check for an active session
  const { data: activeSession } = await supabase
    .from('user_sessions')
    .select('session_id')
    .eq('user_id', userId)
    .is('ended_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (activeSession) {
    return activeSession.session_id;
  }

  // Create new session
  const { error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_id: sessionId,
    });

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return sessionId;
}

export async function trackEvent({
  userId,
  eventType,
  eventName,
  eventData = {},
  sessionId,
}: TrackEventParams) {
  try {
    const supabase = await createActionClient();
    
    // Get or create session if not provided
    const actualSessionId = sessionId || await getOrCreateSession(userId);

    const { error } = await supabase
      .from('user_events')
      .insert({
        user_id: userId,
        session_id: actualSessionId,
        event_type: eventType,
        event_name: eventName,
        event_data: eventData,
      });

    if (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in trackEvent:', error);
  }
}

export async function trackFeatureUsage({
  userId,
  featureName,
  metadata = {},
}: TrackFeatureParams) {
  try {
    const supabase = await createActionClient();

    // Upsert feature usage
    const { error } = await supabase
      .from('feature_usage')
      .upsert({
        user_id: userId,
        feature_name: featureName,
        usage_count: 1,
        last_used_at: new Date().toISOString(),
        metadata,
      }, {
        onConflict: 'user_id,feature_name',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error tracking feature usage:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in trackFeatureUsage:', error);
  }
}

export async function trackRoleConversion({
  userId,
  fromRole,
  toRole,
  conversionType,
  metadata = {},
}: TrackRoleConversionParams) {
  try {
    const supabase = await createActionClient();

    const { error } = await supabase
      .from('role_conversions')
      .insert({
        user_id: userId,
        from_role: fromRole,
        to_role: toRole,
        conversion_type: conversionType,
        metadata,
      });

    if (error) {
      console.error('Error tracking role conversion:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in trackRoleConversion:', error);
  }
}

export async function endSession(userId: string, sessionId: string) {
  try {
    const supabase = await createActionClient();

    const { error } = await supabase
      .from('user_sessions')
      .update({
        ended_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in endSession:', error);
  }
} 