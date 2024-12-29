import dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkEmbeddings() {
  try {
    // Count total embeddings
    const { data: count, error: countError } = await supabase
      .from('artwork_embeddings_gemini')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    console.log('Total embeddings:', count?.length);

    // Get a sample embedding
    const { data: sample, error: sampleError } = await supabase
      .from('artwork_embeddings_gemini')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) throw sampleError;
    if (sample) {
      console.log('\nSample embedding:');
      console.log('ID:', sample.id);
      console.log('Artwork ID:', sample.artwork_id);
      console.log('Type:', sample.embedding_type);
      console.log('Created at:', sample.created_at);
      console.log('Embedding length:', sample.embedding?.length);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEmbeddings(); 