'use server';

import { createActionClient } from '@/lib/supabase/supabase-action';
import { GalleryShow, GalleryWallType } from '@/lib/types/gallery-types';
import { GalleryError } from '@/lib/types/gallery-error-types';
import { GALLERY_ERROR_CODES } from '@/lib/constants/error-codes';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/supabase-server';

// Validation utilities
const validateWallType = (artworkId: string, wallType: GalleryWallType, price: number) => {
  if (!artworkId) {
    throw new GalleryError(
      'Artwork ID is required',
      GALLERY_ERROR_CODES.VALIDATION.INVALID_WALL_TYPE,
      'artworkId'
    );
  }
  if (!wallType) {
    throw new GalleryError(
      'Wall type is required',
      GALLERY_ERROR_CODES.VALIDATION.INVALID_WALL_TYPE,
      'wallType'
    );
  }
  if (price < 0) {
    throw new GalleryError(
      'Price must be non-negative',
      GALLERY_ERROR_CODES.VALIDATION.INVALID_PRICE,
      'price'
    );
  }
};

const validateShow = (data: GalleryShow) => {
  if (!data.title?.trim()) {
    throw new GalleryError(
      'Show title is required',
      GALLERY_ERROR_CODES.VALIDATION.INVALID_TITLE,
      'title'
    );
  }
  if (!data.startDate) {
    throw new GalleryError(
      'Start date is required',
      GALLERY_ERROR_CODES.VALIDATION.INVALID_DATES,
      'startDate'
    );
  }
  if (!data.endDate) {
    throw new GalleryError(
      'End date is required',
      GALLERY_ERROR_CODES.VALIDATION.INVALID_DATES,
      'endDate'
    );
  }
  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new GalleryError(
      'End date must be after start date',
      GALLERY_ERROR_CODES.VALIDATION.INVALID_DATES,
      'endDate'
    );
  }
  if (!data.artworkIds?.length) {
    throw new GalleryError(
      'At least one artwork is required',
      GALLERY_ERROR_CODES.VALIDATION.MISSING_ARTWORKS,
      'artworkIds'
    );
  }
};

export const updateArtworkWallType = async (
  artworkId: string,
  wallType: GalleryWallType,
  price: number
) => {
  validateWallType(artworkId, wallType, price);
  const supabase = await createActionClient();
  
  const { data, error } = await supabase
    .from('artworks')
    .update({
      gallery_wall_type: wallType,
      gallery_price: price
    })
    .eq('id', artworkId)
    .select()
    .single();

  if (error) {
    throw new GalleryError(
      'Failed to update artwork wall type',
      GALLERY_ERROR_CODES.DATABASE.UPDATE_FAILED
    );
  }
  return data;
};

export const createGalleryShow = async (data: GalleryShow) => {
  validateShow(data);
  const supabase = await createActionClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new GalleryError(
      'Not authenticated',
      GALLERY_ERROR_CODES.AUTHORIZATION.UNAUTHORIZED
    );
  }

  // Start transaction
  const { data: show, error: showError } = await supabase
    .from('gallery_shows')
    .insert({
      title: data.title,
      start_date: data.startDate,
      end_date: data.endDate,
      status: 'pending',
      created_by: user.id
    })
    .select()
    .single();

  if (showError) {
    throw new GalleryError(
      'Failed to create show',
      GALLERY_ERROR_CODES.DATABASE.INSERT_FAILED
    );
  }

  try {
    // Add artworks to show
    const { error: artworksError } = await supabase
      .from('gallery_show_artworks')
      .insert(
        data.artworkIds.map(artworkId => ({
          show_id: show.id,
          artwork_id: artworkId
        }))
      );

    if (artworksError) throw artworksError;
    return show;
  } catch (error) {
    // Rollback show creation if artwork assignment fails
    await supabase
      .from('gallery_shows')
      .delete()
      .eq('id', show.id);
    
    throw new GalleryError(
      'Failed to assign artworks to show',
      GALLERY_ERROR_CODES.DATABASE.TRANSACTION_FAILED
    );
  }
};

export const updateShowStatus = async (
  showId: string,
  status: 'approved' | 'rejected'
) => {
  if (!showId) {
    throw new GalleryError(
      'Show ID is required',
      GALLERY_ERROR_CODES.VALIDATION.INVALID_TITLE,
      'showId'
    );
  }

  const supabase = await createActionClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new GalleryError(
      'Not authenticated',
      GALLERY_ERROR_CODES.AUTHORIZATION.UNAUTHORIZED
    );
  }

  // Get the show details first
  const { data: show, error: showError } = await supabase
    .from('gallery_shows')
    .select('*')
    .eq('id', showId)
    .single();

  if (showError || !show) {
    throw new GalleryError(
      'Failed to fetch show details',
      GALLERY_ERROR_CODES.DATABASE.FETCH_FAILED
    );
  }

  if (status === 'approved') {
    // Check for date conflicts with other approved shows
    const { data: conflictingShows, error: conflictError } = await supabase
      .from('gallery_shows')
      .select('*')
      .eq('status', 'approved')
      .neq('id', showId)
      .or(`start_date.lte.${show.end_date},end_date.gte.${show.start_date}`);

    if (conflictError) {
      throw new GalleryError(
        'Failed to check date conflicts',
        GALLERY_ERROR_CODES.DATABASE.FETCH_FAILED
      );
    }

    if (conflictingShows && conflictingShows.length > 0) {
      throw new GalleryError(
        'Show dates conflict with existing approved shows',
        GALLERY_ERROR_CODES.VALIDATION.DATE_CONFLICT
      );
    }

    // Start a transaction to update both show status and dates
    const { data: updatedShow, error: updateError } = await supabase.rpc(
      'approve_gallery_show',
      { 
        p_show_id: showId,
        p_user_id: user.id,
        p_start_date: show.start_date,
        p_end_date: show.end_date
      }
    );

    if (updateError) {
      throw new GalleryError(
        'Failed to approve show',
        GALLERY_ERROR_CODES.DATABASE.TRANSACTION_FAILED
      );
    }

    return updatedShow;
  } else {
    // For rejected shows, just update the status
    const { data, error } = await supabase
      .from('gallery_shows')
      .update({
        status,
        approved_at: null,
        approved_by: null
      })
      .eq('id', showId)
      .select()
      .single();

    if (error) {
      throw new GalleryError(
        'Failed to update show status',
        GALLERY_ERROR_CODES.DATABASE.UPDATE_FAILED
      );
    }
    return data;
  }
};

export const updateGalleryShow = async (showId: string, data: GalleryShow) => {
  validateShow(data);
  const supabase = await createClient();

  // Get current user using Supabase's built-in auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new GalleryError(
      'Not authenticated',
      GALLERY_ERROR_CODES.AUTHORIZATION.UNAUTHORIZED
    );
  }

  // Get current show to check status and dates
  const { data: currentShow, error: showError } = await supabase
    .from('gallery_shows')
    .select('start_date, end_date, status, created_by')
    .eq('id', showId)
    .single();

  if (showError) {
    throw new GalleryError(
      'Failed to fetch show details',
      GALLERY_ERROR_CODES.DATABASE.FETCH_FAILED
    );
  }

  // Verify user owns the show or is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isOwner = currentShow.created_by === user.id;

  if (!isAdmin && !isOwner) {
    throw new GalleryError(
      'Unauthorized to edit this show',
      GALLERY_ERROR_CODES.AUTHORIZATION.UNAUTHORIZED
    );
  }

  try {
    if (currentShow.status === 'pending' || isAdmin) {
      // Full update including dates for pending shows or admin
      const { data: updatedShow, error: updateError } = await supabase
        .from('gallery_shows')
        .update({
          title: data.title,
          start_date: data.startDate,
          end_date: data.endDate
        })
        .eq('id', showId);

      if (updateError) {
        throw new GalleryError(
          'Failed to update show',
          GALLERY_ERROR_CODES.DATABASE.UPDATE_FAILED
        );
      }
    } else {
      // For approved shows, artist can only update title
      const { error: titleError } = await supabase
        .from('gallery_shows')
        .update({ title: data.title })
        .eq('id', showId);

      if (titleError) throw titleError;
    }

    // Update artwork associations
    const { error: deleteError } = await supabase
      .from('gallery_show_artworks')
      .delete()
      .eq('show_id', showId);

    if (deleteError) throw deleteError;

    const { error: artworksError } = await supabase
      .from('gallery_show_artworks')
      .insert(
        data.artworkIds.map(artworkId => ({
          show_id: showId,
          artwork_id: artworkId
        }))
      );

    if (artworksError) throw artworksError;

    return { success: true };
  } catch (error) {
    if (error instanceof GalleryError) throw error;
    
    throw new GalleryError(
      'Failed to update show',
      GALLERY_ERROR_CODES.DATABASE.UPDATE_FAILED
    );
  }
}; 