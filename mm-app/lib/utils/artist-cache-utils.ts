import { type CacheEntry } from '@/lib/types/search-artist-types';
import { type ArtistWithCount } from '@/app/(public)/artists/artists-client';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class ArtistCache {
  private cache = new Map<string, CacheEntry<ArtistWithCount[]>>();

  getCacheKey(params: unknown): string {
    return JSON.stringify(params);
  }

  isValid(entry: CacheEntry<ArtistWithCount[]>): boolean {
    return Date.now() - entry.timestamp < CACHE_DURATION;
  }

  get(key: string): ArtistWithCount[] | null {
    const entry = this.cache.get(key);
    if (!entry || !this.isValid(entry)) return null;
    return entry.data;
  }

  set(key: string, data: ArtistWithCount[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  cleanup(): void {
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (!this.isValid(entry)) {
        this.cache.delete(key);
      }
    });
  }

  startCleanupInterval(): void {
    setInterval(() => this.cleanup(), CACHE_DURATION);
  }
} 