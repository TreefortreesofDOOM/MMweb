'use server';

import { createActionClient } from '@/lib/supabase/supabase-action';
import { GalleryShow, GalleryWallType } from '@/lib/types/gallery-types';
import { GalleryError } from '@/lib/types/gallery-error-types';
import { GALLERY_ERROR_CODES } from '@/lib/constants/error-codes';

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

  const { data, error } = await supabase
    .from('gallery_shows')
    .update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      approved_by: status === 'approved' ? user.id : null
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
};

export const updateGalleryShow = async (showId: string, data: GalleryShow) => {
  validateShow(data);
  const supabase = await createActionClient();

  // Start transaction
  const { data: show, error: showError } = await supabase
    .from('gallery_shows')
    .update({
      title: data.title,
      start_date: data.startDate,
      end_date: data.endDate
    })
    .eq('id', showId)
    .select()
    .single();

  if (showError) {
    throw new GalleryError(
      'Failed to update show',
      GALLERY_ERROR_CODES.DATABASE.UPDATE_FAILED
    );
  }

  try {
    // Remove existing artwork associations
    const { error: deleteError } = await supabase
      .from('gallery_show_artworks')
      .delete()
      .eq('show_id', showId);

    if (deleteError) throw deleteError;

    // Add new artwork associations
    const { error: artworksError } = await supabase
      .from('gallery_show_artworks')
      .insert(
        data.artworkIds.map(artworkId => ({
          show_id: showId,
          artwork_id: artworkId
        }))
      );

    if (artworksError) throw artworksError;
    return show;
  } catch (error) {
    throw new GalleryError(
      'Failed to update show artworks',
      GALLERY_ERROR_CODES.DATABASE.TRANSACTION_FAILED
    );
  }
}; 