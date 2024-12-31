'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { encodedRedirect } from '@/lib/utils/common-utils';
import { trackOnboardingStep } from '@/lib/actions/analytics';

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

    const applicationData = {
      user_id: user.id,
      status: 'pending',
      bio: formData.get('bio')?.toString() || '',
      portfolioUrl: formData.get('portfolioUrl')?.toString() || '',
      instagram: formData.get('instagram')?.toString() || '',
      termsAccepted,
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

    // Track application submission
    await trackOnboardingStep({
      step: 'artist_application',
      completed: true,
      metadata: {
        userId: user.id,
        hasPortfolio: !!applicationData.portfolioUrl,
        hasInstagram: !!applicationData.instagram,
        hasBio: !!applicationData.bio
      }
    });

    return encodedRedirect(
      'success',
      '/profile',
      'Application submitted successfully'
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