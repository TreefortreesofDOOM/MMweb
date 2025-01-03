import { createClient } from '@/lib/supabase/supabase-server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Tool, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/types/database.types';
import { getGeminiResponse } from '@/lib/ai/gemini';
import { AI_TEMPERATURE } from '@/lib/ai/prompts';
import { buildSystemInstruction } from '@/lib/ai/instructions';

type UserSession = Database['public']['Tables']['user_sessions']['Row'];
type UserEvent = Database['public']['Tables']['user_events']['Row'];
type RoleConversion = Database['public']['Tables']['role_conversions']['Row'];

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_TEXT_MODEL;

console.log('Gemini config:', {
  keyExists: !!GEMINI_API_KEY,
  keyLength: GEMINI_API_KEY?.length,
  model: GEMINI_MODEL
});

if (!GEMINI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is not set');
}

if (!GEMINI_MODEL) {
  throw new Error('GEMINI_TEXT_MODEL is not set');
}

// Validate API key format (should be a string starting with "AI")
if (!GEMINI_API_KEY.startsWith('AI')) {
  throw new Error('GOOGLE_AI_API_KEY appears to be invalid (should start with "AI")');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: GEMINI_MODEL,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

// Define analytics function declarations
const analyticsTools: Tool[] = [{
  functionDeclarations: [{
    name: "getMetricsOverview",
    description: "Get overview of key analytics metrics for a specific time period",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: {
          type: SchemaType.STRING,
          description: "Start date in ISO format"
        },
        endDate: {
          type: SchemaType.STRING,
          description: "End date in ISO format"
        }
      },
      required: ["startDate", "endDate"]
    }
  }, {
    name: "getTopPages",
    description: "Get most visited pages and their view counts",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: { type: SchemaType.STRING, description: "Start date in ISO format" },
        endDate: { type: SchemaType.STRING, description: "End date in ISO format" },
        limit: { type: SchemaType.NUMBER, description: "Number of pages to return (default: 5)" }
      },
      required: ["startDate", "endDate"]
    }
  }, {
    name: "getUserEngagement",
    description: "Get user engagement metrics including sessions and events over time",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: { type: SchemaType.STRING, description: "Start date in ISO format" },
        endDate: { type: SchemaType.STRING, description: "End date in ISO format" }
      },
      required: ["startDate", "endDate"]
    }
  }, {
    name: "getConversionMetrics",
    description: "Get artist conversion rates and statistics",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: { type: SchemaType.STRING, description: "Start date in ISO format" },
        endDate: { type: SchemaType.STRING, description: "End date in ISO format" }
      },
      required: ["startDate", "endDate"]
    }
  }, {
    name: "getFeatureUsage",
    description: "Get feature adoption and usage statistics",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: { type: SchemaType.STRING, description: "Start date in ISO format" },
        endDate: { type: SchemaType.STRING, description: "End date in ISO format" },
        feature: { type: SchemaType.STRING, description: "Specific feature to analyze (optional)" }
      },
      required: ["startDate", "endDate"]
    }
  }, {
    name: "getGalleryVisits",
    description: "Get gallery visit statistics (physical and virtual)",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: { type: SchemaType.STRING, description: "Start date in ISO format" },
        endDate: { type: SchemaType.STRING, description: "End date in ISO format" }
      },
      required: ["startDate", "endDate"]
    }
  }, {
    name: "getSocialMetrics",
    description: "Get social engagement metrics (follows, favorites)",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: { type: SchemaType.STRING, description: "Start date in ISO format" },
        endDate: { type: SchemaType.STRING, description: "End date in ISO format" }
      },
      required: ["startDate", "endDate"]
    }
  }, {
    name: "getArtworkMetrics",
    description: "Get artwork statistics and trends",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: { type: SchemaType.STRING, description: "Start date in ISO format" },
        endDate: { type: SchemaType.STRING, description: "End date in ISO format" },
        status: { type: SchemaType.STRING, description: "Filter by artwork status (optional)" }
      },
      required: ["startDate", "endDate"]
    }
  }, {
    name: "getVerificationMetrics",
    description: "Get artist verification funnel and progress metrics",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: { type: SchemaType.STRING, description: "Start date in ISO format" },
        endDate: { type: SchemaType.STRING, description: "End date in ISO format" }
      },
      required: ["startDate", "endDate"]
    }
  }, {
    name: "getArtistFeatureMetrics",
    description: "Get artist feature enablement and usage statistics",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        startDate: { type: SchemaType.STRING, description: "Start date in ISO format" },
        endDate: { type: SchemaType.STRING, description: "End date in ISO format" },
        artistType: { type: SchemaType.STRING, description: "Filter by artist type (optional)" }
      },
      required: ["startDate", "endDate"]
    }
  }]
}];

// Function to execute analytics queries
async function executeAnalyticsFunction(name: string, args: any) {
  const supabase = createServiceRoleClient();
  const { startDate, endDate, status, artistType, feature } = args;

  switch (name) {
    case 'getMetricsOverview': {
      const { data: pageViews } = await supabase
        .from('user_events')
        .select('*')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const uniqueVisitors = new Set(sessions?.map((s: UserSession) => s.user_id)).size;
      const totalSessions = sessions?.length || 0;
      const averageSessionDuration = (sessions || []).reduce((acc: number, s: UserSession) => {
        if (s.ended_at) {
          return acc + (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime());
        }
        return acc;
      }, 0) / (totalSessions || 1) / 1000 / 60; // Convert to minutes

      return {
        totalPageViews: pageViews?.length || 0,
        uniqueVisitors,
        averageSessionDuration: averageSessionDuration.toFixed(1),
        bounceRate: ((sessions?.filter((s: UserSession) => !s.ended_at).length || 0) / totalSessions * 100).toFixed(1)
      };
    }

    case 'getTopPages': {
      const { data: pageViews } = await supabase
        .from('user_events')
        .select('event_data')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      type EventData = { url: string };
      const pageViewsMap = (pageViews || []).reduce<Record<string, number>>((acc, pv) => {
        const eventData = pv.event_data as EventData;
        const path = eventData?.url || 'unknown';
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(pageViewsMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, args.limit || 5)
        .map(([path, views]) => ({ path, views }));
    }

    case 'getUserEngagement': {
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      type EngagementData = { date: string; sessions: number; events: number };
      const engagement = (sessions || []).reduce<Record<string, EngagementData>>((acc, s) => {
        const date = new Date(s.created_at).toLocaleDateString();
        acc[date] = acc[date] || { date, sessions: 0, events: 0 };
        acc[date].sessions++;
        return acc;
      }, {});

      return Object.values(engagement).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    case 'getConversionMetrics': {
      const { data: conversions } = await supabase
        .from('role_conversions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('user_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const uniqueVisitors = new Set((sessions || []).map(s => s.user_id)).size;

      return [
        {
          type: 'Artist Applications',
          count: conversions?.filter((c: RoleConversion) => c.to_role === 'emerging_artist').length || 0,
          rate: ((conversions?.filter((c: RoleConversion) => c.to_role === 'emerging_artist').length || 0) / uniqueVisitors * 100).toFixed(1)
        },
        {
          type: 'Verified Artists',
          count: conversions?.filter((c: RoleConversion) => c.to_role === 'verified_artist').length || 0,
          rate: ((conversions?.filter((c: RoleConversion) => c.to_role === 'verified_artist').length || 0) / uniqueVisitors * 100).toFixed(1)
        }
      ];
    }

    case 'getFeatureUsage': {
      const query = supabase
        .from('feature_usage')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (feature) {
        query.eq('feature_name', feature);
      }

      const { data: features } = await query;

      const usageStats = (features || []).reduce<Record<string, { name: string; totalUses: number; uniqueUsers: number }>>((acc, f) => {
        acc[f.feature_name] = acc[f.feature_name] || { name: f.feature_name, totalUses: 0, uniqueUsers: 0 };
        acc[f.feature_name].totalUses += f.usage_count || 0;
        acc[f.feature_name].uniqueUsers++;
        return acc;
      }, {});

      return Object.values(usageStats);
    }

    case 'getGalleryVisits': {
      const { data: visits } = await supabase
        .from('gallery_visits')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const physicalVisits = visits?.filter(v => v.visit_type === 'physical').length || 0;
      const virtualVisits = visits?.filter(v => v.visit_type === 'virtual').length || 0;
      const uniqueVisitors = new Set(visits?.map(v => v.user_id)).size;

      return {
        totalVisits: (visits || []).length,
        physicalVisits,
        virtualVisits,
        uniqueVisitors,
        averageVisitsPerDay: (visits || []).length / ((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
      };
    }

    case 'getSocialMetrics': {
      const { data: follows } = await supabase
        .from('follows')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: favorites } = await supabase
        .from('artwork_favorites')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const uniqueFollowers = new Set(follows?.map(f => f.follower_id)).size;
      const uniqueFollowed = new Set(follows?.map(f => f.following_id)).size;

      return {
        newFollows: follows?.length || 0,
        uniqueFollowers,
        uniqueFollowed,
        newFavorites: favorites?.length || 0,
        uniqueUsers: new Set(favorites?.map(f => f.user_id)).size,
        uniqueArtworks: new Set(favorites?.map(f => f.artwork_id)).size
      };
    }

    case 'getArtworkMetrics': {
      const { data: artworks } = await supabase
        .from('artworks')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      // Filter by status if provided
      const filteredArtworks = status 
        ? artworks?.filter(a => a.status === status)
        : artworks;

      return {
        total: filteredArtworks?.length || 0,
        published: filteredArtworks?.filter(a => a.status === 'published').length || 0,
        draft: filteredArtworks?.filter(a => a.status === 'draft').length || 0,
        artworks: filteredArtworks?.slice(0, 10) // Return first 10 artworks for reference
      };
    }

    case 'getVerificationMetrics': {
      const { data: verifications } = await supabase
        .from('verification_progress')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const stepCounts = (verifications || []).reduce<Record<string, number>>((acc, v) => {
        acc[v.current_step] = (acc[v.current_step] || 0) + 1;
        return acc;
      }, {});

      const completedSteps = (verifications || []).reduce<Record<string, number>>((acc, v) => {
        (v.steps_completed || []).forEach((step: string) => {
          acc[step] = (acc[step] || 0) + 1;
        });
        return acc;
      }, {});

      return {
        totalInProgress: verifications?.length || 0,
        stepBreakdown: stepCounts,
        completedStepBreakdown: completedSteps,
        averageStepsCompleted: (verifications || []).reduce((acc, v) => acc + (v.steps_completed?.length || 0), 0) / (verifications?.length || 1)
      };
    }

    case 'getArtistFeatureMetrics': {
      const query = supabase
        .from('artist_features')
        .select('*, artist:user_id(role, artist_type)')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (artistType) {
        query.eq('artist.artist_type', artistType);
      }

      const { data: features } = await query;

      const featureStats = (features || []).reduce<Record<string, { name: string; enabled: number; total: number }>>((acc, f) => {
        const featureName = f.feature_name || 'unknown';
        acc[featureName] = acc[featureName] || { name: featureName, enabled: 0, total: 0 };
        acc[featureName].total++;
        if (typeof f.enabled === 'boolean' && f.enabled) {
          acc[featureName].enabled++;
        }
        return acc;
      }, {});

      return Object.values(featureStats).map(stat => ({
        ...stat,
        enablementRate: ((stat.enabled / stat.total) * 100).toFixed(1)
      }));
    }

    default:
      throw new Error(`Unknown function: ${name}`);
  }
}

interface GeminiResponse {
    text: () => string;
    functionCall?: {
        name: string;
        args: any;
    };
}

export async function POST(request: Request) {
  try {
    const { prompt, timeRange = '30d', chatHistory = [] } = await request.json();
    console.log('Analytics request:', { prompt, timeRange });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default: // 30d
        startDate.setDate(endDate.getDate() - 30);
    }

    console.log('Date range:', { startDate, endDate });

    // Generate response with function calling
    const chat = model.startChat({
      history: [],
      tools: analyticsTools
    });

    console.log('Sending message to Gemini...');
    const response = await getGeminiResponse(prompt, {
        systemInstruction: buildSystemInstruction('advisor', {}).instruction,
        temperature: AI_TEMPERATURE.factual,
        chatHistory: chatHistory || []
    }) as unknown as GeminiResponse;
    console.log('Received response from Gemini');

    let finalAnswer = '';

    // Handle function calls if any
    const functionCall = response?.functionCall;
    if (functionCall) {
      console.log('Function call:', functionCall);
      const data = await executeAnalyticsFunction(
        functionCall.name, 
        { 
          ...functionCall.args, 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        }
      );
      console.log('Function result:', data);

      // Get final response with the data
      console.log('Sending follow-up message to Gemini...');
      const followUp = await chat.sendMessage(
        JSON.stringify(data)
      );
      console.log('Received follow-up response from Gemini');

      finalAnswer = followUp.response.text() || 'Unable to analyze the data.';
    } else {
      finalAnswer = response.text() || 'Unable to analyze the data.';
    }

    console.log('Final answer:', finalAnswer);
    return NextResponse.json({ response: finalAnswer });
  } catch (error) {
    console.error('Analytics AI Error:', error);
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to analyze analytics data: ${errorMessage}` },
      { status: 500 }
    );
  }
} 