import dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../lib/ai/embeddings';
import type { Database } from '../lib/types/database.types';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Match {
  id: string;
  artwork_id: string;
  similarity: number;
}

async function testSimilaritySearch() {
  const queries = [
    "art installation with lights",
    "striking and unsettling artwork",
    "ripped up paper texture"  // Added a query related to your new artwork
  ];

  for (const query of queries) {
    console.log(`\nTesting query: "${query}"`);
    
    try {
      // Generate embedding for the query
      const [embedding] = await generateEmbedding(query);
      const formattedEmbedding = `[${embedding.join(',')}]`;

      // Search for similar artworks
      const { data: matches, error } = await supabase.rpc(
        'match_artworks_gemini',
        {
          query_embedding: formattedEmbedding,
          match_threshold: 0.1,
          match_count: 5
        }
      );

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      // Deduplicate matches by artwork_id
      const uniqueMatches = matches ? 
        Array.from(new Map(matches.map(m => [m.artwork_id, m])).values()) :
        [];

      console.log(`Found ${uniqueMatches.length} unique matches`);

      // Fetch artwork details for the matches
      if (uniqueMatches.length > 0) {
        const artworkIds = uniqueMatches.map(m => m.artwork_id);
        const { data: artworks, error: artworksError } = await supabase
          .from('artworks')
          .select('id, title, description')
          .in('id', artworkIds);

        if (artworksError) throw artworksError;

        console.log('\nTop matches:');
        for (const match of uniqueMatches) {
          const artwork = artworks?.find(a => a.id === match.artwork_id);
          if (artwork) {
            console.log(`\nSimilarity: ${(match.similarity * 100).toFixed(1)}%`);
            console.log(`Title: ${artwork.title}`);
            console.log(`Description: ${artwork.description?.substring(0, 100)}...`);
          }
        }
      } else {
        console.log('No matches found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

testSimilaritySearch(); 