'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { encodedRedirect } from '@/lib/utils/common-utils';
import { trackOnboardingStep } from '@/lib/actions/analytics';
import type { UserRole } from '@/lib/types/custom-types';

interface ArtistApplication {
  user_id: string;
  bio: string;
  portfolioUrl: string;
  instagram: string;
  termsAccepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export async function submitArtistApplication(formData: FormData) {
  try {
    const supabase = await createActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return encodedRedirect(
        'error',
        '/profile/application',
        'Not authenticated'
      );
    }

    const termsAccepted = formData.get('termsAccepted') === 'true';
    if (!termsAccepted) {
      return encodedRedirect(
        'error',
        '/profile/application',
        'You must accept the terms and conditions'
      );
    }

    // First create the application record
    const applicationData: ArtistApplication = {
      user_id: user.id,
      bio: formData.get('bio')?.toString() || '',
      portfolioUrl: formData.get('portfolioUrl')?.toString() || '',
      instagram: formData.get('instagram')?.toString() || '',
      termsAccepted,
      status: 'pending'
    };

    const { error: insertError } = await supabase
      .from('artist_applications')
      .insert(applicationData);

    if (insertError) {
      console.error('Error submitting application:', insertError);
      return encodedRedirect(
        'error',
        '/profile/application',
        'Failed to submit application'
      );
    }

    // Update profile with application data and status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        application_status: 'pending',
        bio: applicationData.bio,
        instagram: applicationData.instagram,
        website: applicationData.portfolioUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return encodedRedirect(
        'error',
        '/profile/application',
        'Failed to update profile'
      );
    }

    // Track application submission
    await trackOnboardingStep(user.id, 'artist_application');

    return encodedRedirect(
      'success',
      '/artist/verification',
      'Application submitted successfully. Start your verification journey!'
    );
  } catch (error) {
    console.error('Error in submitArtistApplication:', error);
    return encodedRedirect(
      'error',
      '/profile/application',
      'Failed to submit application'
    );
  }
} 