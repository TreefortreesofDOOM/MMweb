'use server';

import { createActionClient } from '@/lib/supabase/action';
import { revalidatePath } from 'next/cache';
import { updateCommunityEngagement } from './verification';

export async function followArtist(artistId: string) {
  const supabase = await createActionClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: artistId
      });

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { success: false, error: 'Already following this artist' };
      }
      throw error;
    }

    // Update engagement score for social action
    await updateCommunityEngagement(user.id, 'follow');

    revalidatePath(`/artists/${artistId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error following artist:', error);
    return { success: false, error: error.message };
  }
}

export async function unfollowArtist(artistId: string) {
  const supabase = await createActionClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .match({
        follower_id: user.id,
        following_id: artistId
      });

    if (error) throw error;

    revalidatePath(`/artists/${artistId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error unfollowing artist:', error);
    return { success: false, error: error.message };
  }
}

export async function favoriteArtwork(artworkId: string) {
  const supabase = await createActionClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('artwork_favorites')
      .insert({
        user_id: user.id,
        artwork_id: artworkId
      });

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { success: false, error: 'Already favorited this artwork' };
      }
      throw error;
    }

    // Update engagement score for social action
    await updateCommunityEngagement(user.id, 'like');

    revalidatePath(`/artworks/${artworkId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error favoriting artwork:', error);
    return { success: false, error: error.message };
  }
}

export async function unfavoriteArtwork(artworkId: string) {
  const supabase = await createActionClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const { error } = await supabase
      .from('artwork_favorites')
      .delete()
      .match({
        user_id: user.id,
        artwork_id: artworkId
      });

    if (error) throw error;

    revalidatePath(`/artworks/${artworkId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error unfavoriting artwork:', error);
    return { success: false, error: error.message };
  }
}

export async function isFollowingArtist(artistId: string) {
  const supabase = await createActionClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { isFollowing: false };
  }

  try {
    const { data, error } = await supabase
      .from('follows')
      .select()
      .match({
        follower_id: user.id,
        following_id: artistId
      })
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

    return { isFollowing: !!data };
  } catch (error: any) {
    console.error('Error checking follow status:', error);
    return { isFollowing: false };
  }
}

export async function hasFavoritedArtwork(artworkId: string) {
  const supabase = await createActionClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { hasFavorited: false };
  }

  try {
    const { data, error } = await supabase
      .from('artwork_favorites')
      .select()
      .match({
        user_id: user.id,
        artwork_id: artworkId
      })
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

    return { hasFavorited: !!data };
  } catch (error: any) {
    console.error('Error checking favorite status:', error);
    return { hasFavorited: false };
  }
} 