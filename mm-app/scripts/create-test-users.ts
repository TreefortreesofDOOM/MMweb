const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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

async function deleteUser(email: string) {
  try {
    // Find user by email
    const { data: users, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        console.log(`User not found:`, email);
        return;
      }
      throw findError;
    }

    if (!users?.id) {
      console.log(`User not found:`, email);
      return;
    }

    // Delete user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(users.id);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`Deleted user:`, email);
  } catch (error) {
    console.error(`Error deleting user:`, error);
    throw error;
  }
}

async function createUser(email: string, password: string, role: 'artist' | 'admin' | 'user') {
  try {
    // Create user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError) {
      throw createError;
    }

    if (!user.user) {
      throw new Error('User creation failed');
    }

    // Create profile with role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.user.id,
        email: email,
        role: role
      });

    if (profileError) {
      throw profileError;
    }

    console.log(`Created ${role} user:`, email);
    return user;
  } catch (error: any) {
    if (typeof error.message === 'string' && error.message.includes('duplicate key')) {
      console.log(`User already exists:`, email);
      return;
    }
    console.error(`Error creating ${role} user:`, error);
    throw error;
  }
}

async function createTestUsers() {
  const testUsers = [
    { email: 'artist@example.com', password: 'Password123!', role: 'artist' as const },
    { email: 'admin@example.com', password: 'Password123!', role: 'admin' as const },
    { email: 'user@example.com', password: 'Password123!', role: 'user' as const }
  ];

  try {
    // First delete existing users
    console.log('Deleting existing users...');
    for (const user of testUsers) {
      await deleteUser(user.email);
    }

    // Then create new users
    console.log('Creating new users...');
    for (const user of testUsers) {
      await createUser(user.email, user.password, user.role);
    }
    
    console.log('All test users created successfully');
  } catch (error) {
    console.error('Failed to create test users:', error);
  }
}

// Run the script
createTestUsers(); 