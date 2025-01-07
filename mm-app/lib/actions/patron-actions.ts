'use server';

import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getGhostProfileByEmail, claimGhostProfile } from './ghost-profiles';

export async function retryClaimGhostProfileAction(userId: string) {
  const supabase = createServiceRoleClient();
  
  try {
    // Get user's email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user?.email) throw new Error('User email not found');

    // Check for unclaimed ghost profile
    const ghostProfile = await getGhostProfileByEmail(user.email);
    if (!ghostProfile || ghostProfile.isClaimed) {
      return { success: false, message: 'No unclaimed purchases found for your email.' };
    }

    // Claim the ghost profile
    await claimGhostProfile(ghostProfile.id, userId);
    
    return { 
      success: true, 
      message: 'Successfully claimed your previous purchases!' 
    };
  } catch (error) {
    console.error('Error in retryClaimGhostProfileAction:', error);
    return { 
      success: false, 
      message: 'Failed to check for previous purchases. Please try again.' 
    };
  }
} 