import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/supabase-client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    // Get initial user
    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
} 