import { createClient } from '@supabase/supabase-js';
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

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing environment variables');
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const stripeArtists = [
  {
    email: 'dumasi1993@yahoo.com',
    password: 'Password123!',
    first_name: 'Imani',
    last_name: 'Dumas',
    website: 'www.imanidumas.com',
    stripe_account_id: 'acct_1QSJNRRJHKZex4RD',
    stripe_onboarding_complete: true,
    exhibition_badge: true,
    artist_type: 'verified',
    role: 'artist',
    artist_status: 'approved'
  },
  {
    email: 'davidbaerwalde@gmail.com',
    password: 'Password123!',
    first_name: 'David',
    last_name: 'Baerwalde',
    website: 'davidbaerwalde.com',
    stripe_account_id: 'acct_1PifYxI3Y0rQmR6p',
    stripe_onboarding_complete: true,
    exhibition_badge: true,
    artist_type: 'verified',
    role: 'artist',
    artist_status: 'approved'
  },
  {
    email: 'msif.presents@gmail.com',
    password: 'Password123!',
    first_name: 'Michael',
    last_name: 'Stasny',
    website: 'www.mikestasny.com',
    stripe_account_id: 'acct_1Paf2BIkr48ljqys',
    stripe_onboarding_complete: true,
    exhibition_badge: true,
    artist_type: 'verified',
    role: 'artist',
    artist_status: 'approved'
  }
];

async function deleteArtist(email: string) {
  try {
    const { data: user, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        console.log(`Artist not found:`, email);
        return;
      }
      throw findError;
    }

    if (!user?.id) {
      console.log(`Artist not found:`, email);
      return;
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`Deleted artist:`, email);
  } catch (error) {
    console.error(`Error deleting artist:`, error);
    throw error;
  }
}

async function createArtist(artist: typeof stripeArtists[0]) {
  try {
    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: artist.email,
      password: artist.password,
      email_confirm: true
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user returned from auth creation');
    }

    // Create profile with all fields
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: artist.first_name,
        last_name: artist.last_name,
        full_name: `${artist.first_name} ${artist.last_name}`,
        website: artist.website,
        stripe_account_id: artist.stripe_account_id,
        stripe_onboarding_complete: artist.stripe_onboarding_complete,
        exhibition_badge: artist.exhibition_badge,
        artist_type: artist.artist_type,
        role: artist.role,
        artist_status: artist.artist_status,
        verification_progress: 100,
        verification_requirements: {
          portfolio_complete: true,
          identity_verified: true,
          gallery_connection: true,
          sales_history: true,
          community_engagement: true
        }
      })
      .eq('id', authData.user.id);

    if (profileError) {
      throw profileError;
    }

    console.log(`Created artist:`, artist.email);
  } catch (error) {
    console.error(`Error creating artist:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Delete existing artists first
    for (const artist of stripeArtists) {
      await deleteArtist(artist.email);
    }

    // Create new artists
    for (const artist of stripeArtists) {
      await createArtist(artist);
    }

    console.log('Successfully created all Stripe artists');
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main(); 