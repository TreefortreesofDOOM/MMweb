import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';
import type { Database } from '../lib/types/database.types';
import { generateEmbedding } from '../lib/ai/embeddings';

// Set up environment variables
const envLocalPath = resolve(__dirname, '../.env.local');
const result = dotenv.config({ path: envLocalPath });

if (result.error) {
  console.error('Error loading .env.local:', result.error);
  process.exit(1);
}

// Set up environment variables if not loaded from .env.local
const ENV = {
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || 'AIzaSyA9Rqhyk6lLYBYCkQYcbGvo0epgTZ_MZkA',
  PG_CONNECTION: 'postgresql://postgres:postgres@192.168.86.29:54322/postgres'
};

// Apply environment variables
Object.entries(ENV).forEach(([key, value]) => {
  process.env[key] = value;
});

console.log('Environment variables check:', {
  GOOGLE_AI_API_KEY: !!process.env.GOOGLE_AI_API_KEY,
  PG_CONNECTION: process.env.PG_CONNECTION
});

interface EmbeddingRecord {
  id: string;
  artwork_id: string;
  embedding_type: 'title' | 'description' | 'combined';
  title?: string;
  description?: string;
}

async function migrateEmbeddings() {
  const client = new Client({
    connectionString: process.env.PG_CONNECTION
  });

  try {
    console.log('Starting embeddings migration...');
    console.log('Connecting to PostgreSQL...');
    
    await client.connect();
    console.log('Successfully connected to PostgreSQL');

    // Create new table for Gemini embeddings
    console.log('Creating new table for Gemini embeddings...');
    await client.query(`
      -- Create the table if it doesn't exist
      CREATE TABLE IF NOT EXISTS artwork_embeddings_gemini (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
        embedding_type text NOT NULL,
        embedding vector(768) NOT NULL,
        metadata jsonb DEFAULT '{}'::jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      -- Create index for similarity search
      CREATE INDEX IF NOT EXISTS artwork_embeddings_gemini_embedding_idx 
      ON artwork_embeddings_gemini 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);

      -- Add RLS policies
      ALTER TABLE artwork_embeddings_gemini ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Enable read access for all users" ON artwork_embeddings_gemini;
      CREATE POLICY "Enable read access for all users" 
      ON artwork_embeddings_gemini FOR SELECT 
      USING (true);
      
      DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON artwork_embeddings_gemini;
      CREATE POLICY "Enable insert for authenticated users only" 
      ON artwork_embeddings_gemini FOR INSERT 
      TO authenticated 
      WITH CHECK (true);
      
      DROP POLICY IF EXISTS "Enable update for authenticated users only" ON artwork_embeddings_gemini;
      CREATE POLICY "Enable update for authenticated users only" 
      ON artwork_embeddings_gemini FOR UPDATE 
      TO authenticated 
      USING (true);
    `);
    console.log('Successfully created new table and indexes');

    // Get all existing artwork embeddings with their related artworks
    const { rows: existingEmbeddings } = await client.query<EmbeddingRecord>(`
      SELECT ae.*, a.title, a.description 
      FROM artwork_embeddings ae 
      LEFT JOIN artworks a ON ae.artwork_id = a.id 
      ORDER BY ae.created_at ASC
    `);

    console.log(`Found ${existingEmbeddings?.length || 0} existing embeddings to migrate`);

    // Process embeddings in batches to avoid rate limits
    const batchSize = 10;
    const batches = existingEmbeddings ? Math.ceil(existingEmbeddings.length / batchSize) : 0;

    for (let i = 0; i < batches; i++) {
      const batch = existingEmbeddings.slice(i * batchSize, (i + 1) * batchSize);
      console.log(`Processing batch ${i + 1}/${batches} (${batch.length} embeddings)`);

      // Process each embedding in the batch
      await Promise.all(batch.map(async (record) => {
        try {
          // Get the content based on embedding type
          let content = '';
          if (record.title || record.description) {
            switch (record.embedding_type) {
              case 'title':
                content = record.title || '';
                break;
              case 'description':
                content = record.description || '';
                break;
              case 'combined':
                content = `${record.title || ''} ${record.description || ''}`;
                break;
            }
          }

          if (!content) {
            console.warn(`No content found for artwork ${record.artwork_id} (${record.embedding_type})`);
            return;
          }

          // Generate new embedding using Gemini
          const [newEmbedding] = await generateEmbedding(content, { provider: 'gemini' });
          
          // Verify the embedding is a proper array of numbers
          if (!Array.isArray(newEmbedding) || !newEmbedding.every(n => typeof n === 'number')) {
            throw new Error('Invalid embedding format - expected array of numbers');
          }
          
          console.log(`Generated embedding with ${newEmbedding.length} dimensions`);

          // Insert into the new Gemini embeddings table using parameterized query
          const formattedEmbedding = `[${newEmbedding.join(',')}]`;
          const result = await client.query(
            'INSERT INTO artwork_embeddings_gemini (artwork_id, embedding_type, embedding) VALUES ($1, $2, $3::vector)',
            [record.artwork_id, record.embedding_type, formattedEmbedding]
          );

          console.log(`Created Gemini embedding for artwork ${record.artwork_id} (${record.embedding_type})`);
        } catch (error) {
          console.error(`Failed to create Gemini embedding for artwork ${record.artwork_id}:`, error);
        }
      }));

      // Add a small delay between batches to respect rate limits
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Check the count of embeddings
    const { rows: [{ count }] } = await client.query('SELECT COUNT(*) FROM artwork_embeddings_gemini');
    console.log(`\nTotal embeddings in artwork_embeddings_gemini: ${count}`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration
migrateEmbeddings(); 