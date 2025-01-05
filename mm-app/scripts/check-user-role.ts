import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { Database } from '@/lib/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];

async function checkUserRole(email: string) {
  const supabase = createServiceRoleClient();

  try {
    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role, artist_status, artist_type')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return;
    }

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User details:', {
      email: user.email,
      role: user.role,
      artist_status: user.artist_status,
      artist_type: user.artist_type,
      id: user.id
    });

    // Check if role is valid
    const validRoles: UserRole[] = ['user', 'artist', 'admin', 'emerging_artist', 'verified_artist'];
    if (user.role && !validRoles.includes(user.role as UserRole)) {
      console.log('Warning: User has invalid role:', user.role);
      console.log('Valid roles are:', validRoles.join(', '));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

checkUserRole(email); 