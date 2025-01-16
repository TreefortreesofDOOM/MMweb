import { createBrowserClient } from '@/lib/supabase/supabase-client';
import { type SearchResult } from '@/lib/types/search-artist-types';

export class ArtistQuery {
  private query: any;

  constructor() {
    const supabase = createBrowserClient();
    this.query = supabase
      .from('profiles')
      .select(`
        id, first_name, last_name, full_name, avatar_url,
        bio, instagram, website, created_at, exhibition_badge,
        view_count, role, location, artworks!artworks_artist_id_fkey (count)
      `);
  }

  async withSearch(searchQuery: string): Promise<this> {
    const supabase = createBrowserClient();
    const { data: searchResults } = await supabase
      .rpc('search_profiles', { search_query: searchQuery });
    
    if (searchResults?.length) {
      this.query = this.query.in('id', searchResults.map((r: SearchResult) => r.id));
    }
    return this;
  }

  withArtistType(type: 'verified' | 'emerging'): this {
    this.query = this.query.eq('role', 
      type === 'verified' ? 'verified_artist' : 'emerging_artist'
    );
    return this;
  }

  withSorting(sortBy?: string, sortOrder?: 'asc' | 'desc'): this {
    if (sortBy) {
      this.query = this.query.order(sortBy, { 
        ascending: sortOrder === 'asc',
        nullsFirst: false 
      });
      return this;
    }
    
    this.query = this.query
      .order('role', { ascending: true, nullsFirst: false })
      .order('exhibition_badge', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });
    
    return this;
  }

  withPagination(from: number, to: number): this {
    this.query = this.query.range(from, to);
    return this;
  }

  async execute() {
    const { data, error } = await this.query;
    if (error) throw new Error('Failed to fetch artists');
    return data;
  }
} 