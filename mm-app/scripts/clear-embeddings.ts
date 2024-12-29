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

async function clearEmbeddings() {
  try {
    const { error } = await supabase
      .from('artwork_embeddings_gemini')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) throw error;
    console.log('Successfully cleared embeddings table');
  } catch (error) {
    console.error('Error:', error);
  }
}

clearEmbeddings(); 