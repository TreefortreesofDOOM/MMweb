import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getOrCreateSession } from "@/lib/analytics/analytics";

// Export as default function
export default async function middleware(request: NextRequest) {
  try {
    // Update Supabase auth session and get response
    const { response, supabase, error } = await updateSession(request);
    
    if (error || !supabase) {
      return response;
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Create or update analytics session
      await getOrCreateSession(user.id);
    }

    return response;
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api routes
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
