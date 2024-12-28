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

const testArtists = [
  {
    email: 'sarah.chen@example.com',
    password: 'Password123!',
    first_name: 'Sarah',
    last_name: 'Chen',
    bio: 'Contemporary artist specializing in large-scale abstract paintings that explore themes of urban life and nature.',
    location: 'New York, NY',
    website: 'https://sarahchen.example.com',
    instagram: '@sarahchenart',
    exhibition_badge: true
  },
  {
    email: 'marcus.rodriguez@example.com',
    password: 'Password123!',
    first_name: 'Marcus',
    last_name: 'Rodriguez',
    bio: 'Digital artist and photographer merging traditional techniques with modern technology.',
    location: 'Los Angeles, CA',
    website: 'https://mrodriguez.example.com',
    instagram: '@mrodriguezart',
    exhibition_badge: false
  },
  {
    email: 'emma.taylor@example.com',
    password: 'Password123!',
    first_name: 'Emma',
    last_name: 'Taylor',
    bio: 'Sculptor working primarily with recycled materials to create environmental statements.',
    location: 'Portland, OR',
    website: 'https://emmataylor.example.com',
    instagram: '@emmataylorart',
    exhibition_badge: true
  },
  {
    email: 'kai.patel@example.com',
    password: 'Password123!',
    first_name: 'Kai',
    last_name: 'Patel',
    bio: 'Mixed media artist exploring cultural identity through traditional Indian art forms and modern techniques.',
    location: 'Chicago, IL',
    website: 'https://kaipatel.example.com',
    instagram: '@kaipatelart',
    exhibition_badge: true
  },
  {
    email: 'sofia.garcia@example.com',
    password: 'Password123!',
    first_name: 'Sofia',
    last_name: 'Garcia',
    bio: 'Street artist and muralist creating vibrant works that celebrate community and diversity.',
    location: 'Miami, FL',
    website: 'https://sofiagarcia.example.com',
    instagram: '@sofiagarciaart',
    exhibition_badge: false
  },
  {
    email: 'james.kim@example.com',
    password: 'Password123!',
    first_name: 'James',
    last_name: 'Kim',
    bio: 'Minimalist painter focusing on geometric abstractions and color theory.',
    location: 'Seattle, WA',
    website: 'https://jameskim.example.com',
    instagram: '@jameskimart',
    exhibition_badge: true
  },
  {
    email: 'olivia.brown@example.com',
    password: 'Password123!',
    first_name: 'Olivia',
    last_name: 'Brown',
    bio: 'Textile artist weaving contemporary narratives through traditional techniques.',
    location: 'Boston, MA',
    website: 'https://oliviabrown.example.com',
    instagram: '@oliviabrownart',
    exhibition_badge: false
  },
  {
    email: 'lucas.silva@example.com',
    password: 'Password123!',
    first_name: 'Lucas',
    last_name: 'Silva',
    bio: 'Installation artist creating immersive experiences with light and sound.',
    location: 'Austin, TX',
    website: 'https://lucassilva.example.com',
    instagram: '@lucassilvaart',
    exhibition_badge: true
  },
  {
    email: 'maya.patel@example.com',
    password: 'Password123!',
    first_name: 'Maya',
    last_name: 'Patel',
    bio: 'Ceramicist blending traditional pottery with contemporary sculpture.',
    location: 'Denver, CO',
    website: 'https://mayapatel.example.com',
    instagram: '@mayapatelart',
    exhibition_badge: false
  },
  {
    email: 'david.lee@example.com',
    password: 'Password123!',
    first_name: 'David',
    last_name: 'Lee',
    bio: 'Printmaker exploring urban landscapes through traditional woodblock techniques.',
    location: 'San Francisco, CA',
    website: 'https://davidlee.example.com',
    instagram: '@davidleeart',
    exhibition_badge: true
  },
  {
    email: 'nina.williams@example.com',
    password: 'Password123!',
    first_name: 'Nina',
    last_name: 'Williams',
    bio: 'Performance artist documenting ephemeral works through photography and video.',
    location: 'New Orleans, LA',
    website: 'https://ninawilliams.example.com',
    instagram: '@ninawilliamsart',
    exhibition_badge: false
  },
  {
    email: 'alex.zhang@example.com',
    password: 'Password123!',
    first_name: 'Alex',
    last_name: 'Zhang',
    bio: 'New media artist working with AI and generative art to explore human-machine creativity.',
    location: 'Philadelphia, PA',
    website: 'https://alexzhang.example.com',
    instagram: '@alexzhangart',
    exhibition_badge: true
  },
  {
    email: 'isabella.russo@example.com',
    password: 'Password123!',
    first_name: 'Isabella',
    last_name: 'Russo',
    bio: 'Glass artist creating sculptural pieces inspired by natural phenomena.',
    location: 'Minneapolis, MN',
    website: 'https://isabellarusso.example.com',
    instagram: '@isabellarussoart',
    exhibition_badge: true
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

async function createArtist(artist: typeof testArtists[0]) {
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
        bio: artist.bio,
        location: artist.location,
        website: artist.website,
        instagram: artist.instagram,
        exhibition_badge: artist.exhibition_badge,
        artist_type: 'verified',
        role: 'artist',
        artist_status: 'approved'
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
    // Delete existing test artists first
    for (const artist of testArtists) {
      await deleteArtist(artist.email);
    }

    // Create new test artists
    for (const artist of testArtists) {
      await createArtist(artist);
    }

    console.log('Successfully created all test artists');
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main(); 