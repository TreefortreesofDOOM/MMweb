'use server';

import { createActionClient } from '@/lib/supabase/action';
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/lib/utils";
import { Database } from "@/lib/database.types";

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
        location
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
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  // Get current profile to check artist status
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role, artist_type, verification_progress')
    .eq('id', user.id)
    .single();

  const isArtist = currentProfile?.role === 'artist';
  const isVerifiedArtist = isArtist && currentProfile?.artist_type === 'verified';

  // Build update data, filtering out null/empty values
  const updateData: Partial<Profile> = {};
  const fields = ['first_name', 'last_name', 'bio', 'website', 'instagram'] as const;
  
  // Validate required fields for artists
  if (isArtist) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const bio = formData.get('bio') as string;

    if (!firstName?.trim() || !lastName?.trim() || !bio?.trim()) {
      return encodedRedirect(
        "error",
        "/profile/edit",
        "Name and bio are required for artists"
      );
    }

    // Additional validation for verified artists
    if (isVerifiedArtist) {
      const website = formData.get('website') as string;
      const instagram = formData.get('instagram') as string;

      if (!website?.trim() || !instagram?.trim()) {
        return encodedRedirect(
          "error",
          "/profile/edit",
          "Website and Instagram are required for verified artists"
        );
      }
    }
  }

  fields.forEach(field => {
    const value = formData.get(field) as string;
    if (value?.trim()) {
      updateData[field] = value.trim();
    }
  });

  // Construct full_name from first_name and last_name for backward compatibility
  if (updateData.first_name || updateData.last_name) {
    updateData.full_name = [updateData.first_name, updateData.last_name]
      .filter(Boolean)
      .join(' ');
  }

  // Update verification progress for emerging artists
  if (isArtist && currentProfile?.artist_type === 'emerging') {
    const progress = calculateVerificationProgress({
      hasName: Boolean(updateData.first_name && updateData.last_name),
      hasBio: Boolean(updateData.bio),
      hasWebsite: Boolean(updateData.website),
      hasInstagram: Boolean(updateData.instagram)
    });
    updateData.verification_progress = progress;
  }

  console.log('Updating profile with data:', updateData);
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    console.error('Profile update error:', error);
    return encodedRedirect(
      "error",
      "/profile/edit",
      "Failed to update profile"
    );
  }

  return redirect('/profile');
};

interface VerificationProgress {
  hasName: boolean;
  hasBio: boolean;
  hasWebsite: boolean;
  hasInstagram: boolean;
}

function calculateVerificationProgress(progress: VerificationProgress): number {
  const weights = {
    hasName: 25,
    hasBio: 25,
    hasWebsite: 25,
    hasInstagram: 25
  };

  let total = 0;
  if (progress.hasName) total += weights.hasName;
  if (progress.hasBio) total += weights.hasBio;
  if (progress.hasWebsite) total += weights.hasWebsite;
  if (progress.hasInstagram) total += weights.hasInstagram;

  return total;
} 