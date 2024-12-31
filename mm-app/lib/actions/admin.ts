'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { redirect } from 'next/navigation';
import { sendArtistApplicationEmail } from '@/lib/emails/artist-notifications';
import { getAdmin } from './helpers';
import { encodedRedirect } from "@/lib/utils/common-utils";

export async function getArtistApplications() {
  const user = await getAdmin();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createActionClient();
  
  try {
    const { data: applications, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        artist_application,
        artist_status,
        artist_rejection_reason,
        artist_approved_at,
        artist_approved_by
      `)
      .not('artist_application', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { applications };
  } catch (error: any) {
    console.error('Error fetching artist applications:', error);
    return { error: error.message };
  }
}

export async function approveArtistApplication(formData: FormData) {
  const user = await getAdmin();
  if (!user) {
    return redirect('/sign-in');
  }

  const userId = formData.get('userId') as string;
  if (!userId) {
    return encodedRedirect(
      'error',
      '/admin/applications',
      'User ID is required'
    );
  }

  const supabase = await createActionClient();
  
  try {
    // Get user's email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!userProfile?.email) {
      throw new Error('User email not found');
    }

    // Update user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        artist_status: 'approved',
        role: 'artist',
        artist_approved_at: new Date().toISOString(),
        artist_approved_by: user.id
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Send approval email
    await sendArtistApplicationEmail({
      userId,
      email: userProfile.email,
      type: 'approval'
    });

    return redirect('/admin/applications');
  } catch (error: any) {
    console.error('Error approving artist application:', error);
    return encodedRedirect(
      'error',
      '/admin/applications',
      'Failed to approve application'
    );
  }
}

export async function rejectArtistApplication(formData: FormData) {
  const user = await getAdmin();
  if (!user) {
    return redirect('/sign-in');
  }

  const userId = formData.get('userId') as string;
  const rejectionReason = formData.get('rejectionReason') as string;

  if (!userId || !rejectionReason) {
    return encodedRedirect(
      'error',
      '/admin/applications',
      'User ID and rejection reason are required'
    );
  }

  const supabase = await createActionClient();
  
  try {
    // Get user's email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!userProfile?.email) {
      throw new Error('User email not found');
    }

    // Update user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        artist_status: 'rejected',
        artist_rejection_reason: rejectionReason
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Send rejection email
    await sendArtistApplicationEmail({
      userId,
      email: userProfile.email,
      type: 'rejection',
      rejectionReason
    });

    return redirect('/admin/applications');
  } catch (error: any) {
    console.error('Error rejecting artist application:', error);
    return encodedRedirect(
      'error',
      '/admin/applications',
      'Failed to reject application'
    );
  }
}

export async function getAdminStats() {
  const user = await getAdmin();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const supabase = await createActionClient();
  
  try {
    const [
      { count: totalArtists },
      { count: totalArtworks },
      { count: pendingApplications }
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'artist'),
      supabase
        .from('artworks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('artist_status', 'pending')
    ]);

    return {
      stats: {
        totalArtists: totalArtists || 0,
        totalArtworks: totalArtworks || 0,
        pendingApplications: pendingApplications || 0
      }
    };
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return { error: error.message };
  }
} 