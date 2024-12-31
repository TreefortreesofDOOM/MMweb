'use server';

import { createActionClient } from '@/lib/supabase/action';
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/lib/utils";
import { Database } from "@/lib/database.types";
import { trackProfileCompletion } from '@/lib/actions/analytics';

type Profile = Database['public']['Tables']['profiles']['Row'];

export async function getProfileAction() {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        full_name,
        bio,
        website,
        instagram,
        role,
        artist_type,
        artist_status,
        verification_progress,
        verification_requirements,
        avatar_url,
        exhibition_badge,
        location,
        medium
      `)
      .eq('id', user.id)
      .single();

    if (error) throw error;

    // Ensure verification_requirements has the expected structure
    if (!profile.verification_requirements) {
      profile.verification_requirements = {
        portfolio_complete: false,
        identity_verified: false,
        gallery_connection: false,
        sales_history: false,
        community_engagement: false
      };
    }

    return { profile };
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return { error: error.message };
  }
}

export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createActionClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return redirect('/sign-in');
  }

  try {
    // Get current profile to check if anything changed
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, bio, location, website, instagram')
      .eq('id', user.id)
      .single();

    const firstName = formData.get('firstName')?.toString();
    const lastName = formData.get('lastName')?.toString();
    const bio = formData.get('bio')?.toString();
    const location = formData.get('location')?.toString();
    const website = formData.get('website')?.toString();
    const instagram = formData.get('instagram')?.toString();

    // Check if any values actually changed
    const hasChanges = 
      firstName !== currentProfile?.first_name ||
      lastName !== currentProfile?.last_name ||
      bio !== currentProfile?.bio ||
      location !== currentProfile?.location ||
      website !== currentProfile?.website ||
      instagram !== currentProfile?.instagram;

    // If nothing changed, redirect with success message
    if (!hasChanges) {
      redirect('/profile?success=' + encodeURIComponent('No changes to save'));
    }

    const updateData = {
      first_name: firstName || null,
      last_name: lastName || null,
      bio: bio || null,
      location: location || null,
      website: website || null,
      instagram: instagram || null,
      full_name: firstName && lastName ? `${firstName} ${lastName}` : null,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      redirect('/profile?error=' + encodeURIComponent('Failed to update profile'));
    }

    // Track profile field completions
    await trackProfileCompletion({
      fieldName: 'name',
      completed: !!(firstName && lastName),
      metadata: { userId: user.id }
    });

    await trackProfileCompletion({
      fieldName: 'bio',
      completed: !!bio,
      metadata: { userId: user.id }
    });

    await trackProfileCompletion({
      fieldName: 'location',
      completed: !!location,
      metadata: { userId: user.id }
    });

    await trackProfileCompletion({
      fieldName: 'website',
      completed: !!website,
      metadata: { userId: user.id }
    });

    await trackProfileCompletion({
      fieldName: 'instagram',
      completed: !!instagram,
      metadata: { userId: user.id }
    });

    redirect('/profile?success=' + encodeURIComponent('Profile updated successfully'));
  } catch (error) {
    console.error('Error in updateProfileAction:', error);
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    redirect('/profile?error=' + encodeURIComponent('Failed to update profile'));
  }
};

export async function updateAvatarAction(formData: FormData) {
  try {
    const supabase = await createActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return encodedRedirect(
        'error',
        '/profile/edit',
        'Not authenticated'
      );
    }

    const avatarFile = formData.get('avatar') as File;
    if (!avatarFile) {
      return encodedRedirect(
        'error',
        '/profile/edit',
        'No avatar file provided'
      );
    }

    // Upload avatar to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(`${user.id}/${avatarFile.name}`, avatarFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return encodedRedirect(
        'error',
        '/profile/edit',
        'Failed to upload avatar'
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    // Update profile with avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile with avatar:', updateError);
      return encodedRedirect(
        'error',
        '/profile/edit',
        'Failed to update profile with avatar'
      );
    }

    // Track avatar completion
    await trackProfileCompletion({
      fieldName: 'avatar',
      completed: true,
      metadata: { userId: user.id }
    });

    return encodedRedirect(
      'success',
      '/profile/edit',
      'Avatar updated successfully'
    );
  } catch (error) {
    console.error('Error in updateAvatarAction:', error);
    return encodedRedirect(
      'error',
      '/profile/edit',
      'Failed to update avatar'
    );
  }
}

export async function updateProfileMediums(mediums: string[]) {
  const supabase = await createActionClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ medium: mediums })
    .eq('id', user.id)

  if (error) {
    throw new Error('Failed to update mediums')
  }

  // Track medium completion
  await trackProfileCompletion({
    fieldName: 'medium',
    completed: mediums.length > 0,
    metadata: { userId: user.id }
  })

  return { success: true }
} 