import { type ArtistWithCount } from '@/app/(public)/artists/artists-client';
import { type SearchParams } from '@/lib/types/search-artist-types';
import { ArtistCache } from './artist-cache-utils';
import { ArtistQuery } from './artist-query-utils';

const ARTISTS_PER_PAGE = 12;
const cache = new ArtistCache();

// Start cache cleanup interval
cache.startCleanupInterval();

function transformArtistData(data: any[]): ArtistWithCount[] {
  return data.map(artist => ({
    ...artist,
    artist_type: artist.role === 'verified_artist' ? 'verified' : 'emerging',
    artworks: [{ count: artist.artworks?.[0]?.count || 0 }]
  })) as ArtistWithCount[];
}

function getPaginationRange(page: number): { from: number; to: number } {
  const from = (page - 1) * ARTISTS_PER_PAGE;
  return {
    from,
    to: from + ARTISTS_PER_PAGE - 1
  };
}

export async function searchArtists(params: SearchParams): Promise<{
  artists: ArtistWithCount[];
  hasMore: boolean;
}> {
  const cacheKey = cache.getCacheKey(params);
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return {
      artists: cached,
      hasMore: cached.length === ARTISTS_PER_PAGE
    };
  }

  const { from, to } = getPaginationRange(params.page);
  const queryBuilder = new ArtistQuery();
  
  if (params.query) {
    await queryBuilder.withSearch(params.query);
  }
  
  if (params.artistType) {
    queryBuilder.withArtistType(params.artistType as 'verified' | 'emerging');
  }
  
  const data = await queryBuilder
    .withSorting(params.sortBy, params.sortOrder)
    .withPagination(from, to)
    .execute();
  
  const artists = transformArtistData(data);
  cache.set(cacheKey, artists);
  
  return {
    artists,
    hasMore: artists.length === ARTISTS_PER_PAGE
  };
} 