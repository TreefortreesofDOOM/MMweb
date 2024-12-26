'use server';

import { createActionClient } from '@/lib/supabase/action';
import { encodedRedirect } from "@/lib/utils";
import { redirect } from "next/navigation";
import { sendArtistApplicationEmail } from "@/lib/emails/artist-notifications";

export async function submitArtistApplication(formData: FormData) {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  const artistStatement = formData.get('artistStatement') as string
  const portfolioUrl = formData.get('portfolioUrl') as string
  const instagram = formData.get('instagram') as string
  const termsAccepted = formData.get('termsAccepted') === 'true'

  if (!artistStatement || !termsAccepted) {
    return encodedRedirect(
      'error',
      '/profile/application',
      'Artist statement and terms acceptance are required'
    )
  }

  try {
    // Get user's email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    if (!profile?.email) {
      throw new Error('User email not found')
    }

    // Update profile with application data
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        artist_application: {
          artistStatement,
          portfolioUrl,
          instagram,
          termsAccepted,
          submittedAt: new Date().toISOString()
        },
        artist_status: 'pending'
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Send confirmation email
    await sendArtistApplicationEmail({
      userId: user.id,
      email: profile.email,
      type: 'submission'
    })

    return redirect('/profile')
  } catch (error) {
    console.error('Error submitting artist application:', error)
    return encodedRedirect(
      'error',
      '/profile/application',
      'Failed to submit application'
    )
  }
} 