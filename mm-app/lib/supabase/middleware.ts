import { createServerClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { type Database } from "@/lib/types/database.types";

type UpdateSessionResult = {
  response: NextResponse;
  supabase?: SupabaseClient<Database>;
  error?: unknown;
};

export const updateSession = async (request: NextRequest): Promise<UpdateSessionResult> => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // protected routes
    if ((request.nextUrl.pathname.startsWith("/protected") || 
         request.nextUrl.pathname.startsWith("/profile") ||
         request.nextUrl.pathname.startsWith("/artist") ||
         request.nextUrl.pathname.startsWith("/admin")) && 
         (userError || !user)) {
      return { response: NextResponse.redirect(new URL("/sign-in", request.url)) };
    }

    return { response, supabase };
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    console.error('Error in updateSession:', e);
    return {
      response: NextResponse.next({
        request: {
          headers: request.headers,
        },
      }),
      error: e,
    };
  }
};
