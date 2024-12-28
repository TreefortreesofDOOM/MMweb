import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter that allows 5 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { userId } = params;

    // Get the current user's session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
      `gallery_visit_${ip}`
    );

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many visits recorded. Please try again later.',
          limit,
          reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // Validate user exists
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check for duplicate visits within the last minute
    const { data: recentVisits } = await supabase
      .from('gallery_visits')
      .select('id')
      .eq('user_id', userId)
      .eq('scanned_by', session.user.id)
      .gte('created_at', new Date(Date.now() - 60000).toISOString())
      .limit(1);

    if (recentVisits && recentVisits.length > 0) {
      return NextResponse.json(
        { error: 'Visit already recorded' },
        { status: 409 }
      );
    }

    // Record the gallery visit
    const { error } = await supabase
      .from('gallery_visits')
      .insert({
        user_id: userId,
        scanned_by: session.user.id,
        visit_type: 'physical',
        metadata: {
          timestamp: new Date().toISOString(),
          location: 'gallery',
          ip: ip.split(',')[0].trim(), // Store only the original client IP
          userAgent: request.headers.get('user-agent'),
        }
      });

    if (error) {
      console.error('Error recording gallery visit:', error);
      return NextResponse.json(
        { error: 'Failed to record gallery visit' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Gallery visit recorded successfully',
      remaining,
      reset,
    });
  } catch (error) {
    console.error('Error in gallery visit endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 