"use server";

import { encodedRedirect } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Database } from "@/lib/database.types";
import { sendArtistApplicationEmail } from "@/lib/emails/artist-notifications"
import { updateArtworkEmbeddings, findSimilarArtworks } from '@/lib/ai/embeddings';

type Profile = Database['public']['Tables']['profiles']['Update'];

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/profile");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Password update failed",
    );
  }

  return encodedRedirect("success", "/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  // Build update data, filtering out null/empty values
  const updateData: Partial<Profile> = {};
  const fields = ['name', 'bio', 'website', 'instagram'] as const;
  
  fields.forEach(field => {
    const value = formData.get(field) as string;
    if (value?.trim()) {
      updateData[field] = value.trim();
    }
  });

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

export async function submitArtistApplication(formData: FormData) {
  const supabase = await createClient()
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

export async function approveArtistApplication(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  const userId = formData.get('userId') as string

  if (!userId) {
    return encodedRedirect(
      'error',
      '/admin/applications',
      'User ID is required'
    )
  }

  try {
    // Verify admin status
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Get user's email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (!userProfile?.email) {
      throw new Error('User email not found')
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
      .eq('id', userId)

    if (updateError) throw updateError

    // Send approval email
    await sendArtistApplicationEmail({
      userId,
      email: userProfile.email,
      type: 'approval'
    })

    return redirect('/admin/applications')
  } catch (error) {
    console.error('Error approving artist application:', error)
    return encodedRedirect(
      'error',
      '/admin/applications',
      'Failed to approve application'
    )
  }
}

export async function rejectArtistApplication(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/sign-in')
  }

  const userId = formData.get('userId') as string
  const rejectionReason = formData.get('rejectionReason') as string

  if (!userId || !rejectionReason) {
    return encodedRedirect(
      'error',
      '/admin/applications',
      'User ID and rejection reason are required'
    )
  }

  try {
    // Verify admin status
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Get user's email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (!userProfile?.email) {
      throw new Error('User email not found')
    }

    // Update user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        artist_status: 'rejected',
        artist_rejection_reason: rejectionReason
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // Send rejection email
    await sendArtistApplicationEmail({
      userId,
      email: userProfile.email,
      type: 'rejection',
      rejectionReason
    })

    return redirect('/admin/applications')
  } catch (error) {
    console.error('Error rejecting artist application:', error)
    return encodedRedirect(
      'error',
      '/admin/applications',
      'Failed to reject application'
    )
  }
}

export async function createArtwork(formData: FormData) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const isPublished = formData.get('publish') === 'true';
  const imagesJson = formData.get('images') as string;
  const stylesJson = formData.get('styles') as string;
  const techniquesJson = formData.get('techniques') as string;
  const keywordsJson = formData.get('keywords') as string;

  if (!title || !price || !imagesJson) {
    return { error: 'Missing required fields' };
  }

  try {
    const images = JSON.parse(imagesJson);
    const styles = stylesJson ? JSON.parse(stylesJson) : [];
    const techniques = techniquesJson ? JSON.parse(techniquesJson) : [];
    const keywords = keywordsJson ? JSON.parse(keywordsJson) : [];
    
    if (!Array.isArray(images) || images.length === 0) {
      return { error: 'At least one image is required' };
    }

    if (!images.some(img => img.isPrimary)) {
      return { error: 'Primary image is required' };
    }

    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .insert({
        title,
        description,
        price,
        artist_id: user.id,
        images,
        styles,
        techniques,
        keywords,
        status: isPublished ? 'published' : 'draft'
      })
      .select()
      .single();

    if (artworkError) throw artworkError;

    // Generate and store embeddings for the artwork
    if (artwork) {
      try {
        // Include styles, techniques, and keywords in the text for embeddings
        const fullText = [
          title,
          description || '',
          ...styles,
          ...techniques,
          ...keywords
        ].join(' ');
        
        await updateArtworkEmbeddings(artwork.id, title, fullText);
      } catch (embeddingError) {
        console.error('Error generating embeddings:', embeddingError);
        // Don't fail the artwork creation if embeddings fail
      }
    }

    return { artwork };
  } catch (error: any) {
    console.error('Error creating artwork:', error);
    return { error: error.message };
  }
}

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Verify artist status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'artist') return null;

  return user;
}

export async function publishArtwork(artworkId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    // Verify ownership
    const { data: artwork, error: fetchError } = await supabase
      .from('artworks')
      .select('artist_id')
      .eq('id', artworkId)
      .single();

    if (fetchError) throw fetchError;
    if (artwork.artist_id !== user.id) {
      return { error: 'Not authorized' };
    }

    // Update status
    const { error: updateError } = await supabase
      .from('artworks')
      .update({ status: 'published' })
      .eq('id', artworkId);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error: any) {
    console.error('Error publishing artwork:', error);
    return { error: error.message };
  }
}

export async function unpublishArtwork(artworkId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    // Verify ownership
    const { data: artwork, error: fetchError } = await supabase
      .from('artworks')
      .select('artist_id')
      .eq('id', artworkId)
      .single();

    if (fetchError) throw fetchError;
    if (artwork.artist_id !== user.id) {
      return { error: 'Not authorized' };
    }

    // Update status
    const { error: updateError } = await supabase
      .from('artworks')
      .update({ status: 'draft' })
      .eq('id', artworkId);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error: any) {
    console.error('Error unpublishing artwork:', error);
    return { error: error.message };
  }
}

export async function signOut() {
  'use server';
  
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/');
}

export async function updateArtwork(artworkId: string, formData: FormData) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const imagesJson = formData.get('images') as string;

  if (!title || !price || !imagesJson) {
    return { error: 'Missing required fields' };
  }

  try {
    const images = JSON.parse(imagesJson);
    
    if (!Array.isArray(images) || images.length === 0) {
      return { error: 'At least one image is required' };
    }

    if (!images.some(img => img.isPrimary)) {
      return { error: 'Primary image is required' };
    }

    // First check if the artwork belongs to the user
    const { data: existingArtwork } = await supabase
      .from('artworks')
      .select('artist_id')
      .eq('id', artworkId)
      .single();

    if (!existingArtwork || existingArtwork.artist_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .update({
        title,
        description,
        price,
        images,
      })
      .eq('id', artworkId)
      .select()
      .single();

    if (artworkError) throw artworkError;

    // Update embeddings for the artwork
    if (artwork) {
      try {
        await updateArtworkEmbeddings(artwork.id, title, description || '');
      } catch (embeddingError) {
        console.error('Error updating embeddings:', embeddingError);
        // Don't fail the artwork update if embeddings fail
      }
    }

    return { artwork };
  } catch (error: any) {
    console.error('Error updating artwork:', error);
    return { error: error.message };
  }
}

export async function getSimilarArtworks(artworkId: string) {
  const supabase = await createClient();

  try {
    // First get the artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('title, description')
      .eq('id', artworkId)
      .single();

    if (artworkError) throw artworkError;
    if (!artwork) throw new Error('Artwork not found');

    // Use the artwork's title and description to find similar artworks
    const queryText = `${artwork.title} ${artwork.description || ''}`;
    const similarArtworks = await findSimilarArtworks(queryText, {
      match_threshold: 0.7,
      match_count: 6
    });

    if (!similarArtworks) return { artworks: [] };

    // Get the full artwork details for the similar artworks
    const { data: artworksData, error: artworksError } = await supabase
      .from('artworks')
      .select('*')
      .in('id', similarArtworks.map(a => a.artwork_id))
      .neq('id', artworkId) // Exclude the current artwork
      .eq('status', 'published'); // Only include published artworks

    if (artworksError) throw artworksError;

    // Sort by similarity score
    const sortedArtworks = artworksData
      .map(artwork => ({
        ...artwork,
        similarity: similarArtworks.find(a => a.artwork_id === artwork.id)?.similarity || 0
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return { artworks: sortedArtworks };
  } catch (error: any) {
    console.error('Error finding similar artworks:', error);
    return { error: error.message };
  }
}

export async function analyzeArtwork(imageUrl: string) {
  try {
    // Get the origin for the full URL
    const headersList = await headers();
    const origin = headersList.get('origin') || '';
    const response = await fetch(`${origin}/api/ai/analyze-artwork`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      return { error: 'Failed to analyze artwork' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing artwork:', error);
    return { error: 'Failed to analyze artwork' };
  }
}
