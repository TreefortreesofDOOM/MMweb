import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database.types';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
  throw new Error('Missing environment variables');
}

// Create clients
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
const stripe = new Stripe(stripeSecretKey);

const artistAccounts = [
  {
    name: 'Imani Dumas',
    account_id: 'acct_1QSJNRRJHKZex4RD',
    aliases: ['imani dumas', 'imanidumas']
  },
  {
    name: 'David Baerwalde',
    account_id: 'acct_1PifYxI3Y0rQmR6p',
    aliases: ['david baerwalde', 'davidbaerwalde']
  },
  {
    name: 'Michael Stasny',
    account_id: 'acct_1Paf2BIkr48ljqys',
    aliases: ['mike stasny', 'michael stasny', 'mikestasny', 'michaelstasny']
  }
];

type ArtworkInsert = Database['public']['Tables']['artworks']['Insert'];

async function getArtistIdByName(artistName: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', artistName)
    .single();

  if (error) throw error;
  return data.id;
}

async function createArtwork(artwork: ArtworkInsert) {
  try {
    // Check if artwork already exists for this artist with this title
    const { data: existing } = await supabase
      .from('artworks')
      .select('id, title')
      .eq('title', artwork.title)
      .eq('artist_id', artwork.artist_id)
      .single();

    if (existing) {
      console.log(`Artwork already exists: ${artwork.title}`);
      return;
    }

    const { error } = await supabase
      .from('artworks')
      .insert({
        title: artwork.title,
        description: artwork.description,
        price: artwork.price,
        images: artwork.images,
        artist_id: artwork.artist_id,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    console.log(`Created new artwork: ${artwork.title}`);
  } catch (error) {
    console.error(`Error creating artwork ${artwork.title}:`, error);
    throw error;
  }
}

// Add a mapping for products with missing metadata
const productArtistMapping: Record<string, string> = {
  'Cardboard Surveillance Camera': 'David Baerwalde',
  'Guns & Drugs: Dragon': 'David Baerwalde',
  'Mini Filing Cabinets': 'David Baerwalde'
};

async function setupArtworks() {
  try {
    // Get all products
    const products = await stripe.products.list({
      limit: 100,
      active: true
    });

    console.log(`Found ${products.data.length} products in Stripe`);

    // Keep track of created artworks
    let createdCount = 0;

    // Process each product
    for (const product of products.data) {
      // First try to get artist from metadata, if not found check the mapping
      let artistMetadata = product.metadata?.artist?.toLowerCase();
      if (!artistMetadata && productArtistMapping[product.name]) {
        artistMetadata = productArtistMapping[product.name].toLowerCase();
        console.log(`Using mapped artist for ${product.name}: ${productArtistMapping[product.name]}`);
      }
      
      if (!artistMetadata) {
        console.log(`Skipping product ${product.name} - no artist metadata or mapping found`);
        continue;
      }

      // Find matching artist using aliases
      const artist = artistAccounts.find(a => {
        const aliases = a.aliases || [];
        return aliases.some(alias => artistMetadata!.includes(alias));
      });

      if (artist) {
        // Get price for the product
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          limit: 1
        });

        if (prices.data.length > 0) {
          const price = prices.data[0];
          const artistId = await getArtistIdByName(artist.name);

          const artworkData: ArtworkInsert = {
            title: product.name,
            description: product.description,
            price: price.unit_amount ? price.unit_amount / 100 : 0,
            images: product.images.map(url => ({ url })),
            artist_id: artistId,
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          await createArtwork(artworkData);
          createdCount++;
        }
      } else {
        console.log(`Skipping product ${product.name} - no matching artist found for "${artistMetadata}"`);
      }
    }

    console.log(`Successfully created ${createdCount} new artworks from Stripe products`);
  } catch (error) {
    console.error('Error in setupArtworks:', error);
    process.exit(1);
  }
}

setupArtworks(); 