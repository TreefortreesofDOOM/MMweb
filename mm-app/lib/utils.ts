import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createBrowserClient } from "./supabase/supabase-client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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