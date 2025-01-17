import { createBrowserClient } from '@/lib/supabase/supabase-client'

/**
 * Converts a storage path to a public URL
 * If the path is already a full URL, returns it as is
 * Otherwise, generates a public URL using Supabase storage
 */
export function getImageUrl(path: string) {
  if (!path) return '';
  
  // If the path is already a full URL, return it
  if (path.startsWith('http')) {
    return path;
  }

  const supabase = createBrowserClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from('artworks').getPublicUrl(path);

  return publicUrl;
} 