'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { updateArtworkEmbeddings, findSimilarArtworks } from '@/lib/ai/embeddings/index';
import { getArtist } from './helpers';

export async function uploadArtworkImage(formData: FormData) {
  try {
    const supabase = await createActionClient();

    // Verify user is authenticated
    const user = await getArtist();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    const fileExt = file.name.split('.').pop();
    // Use timestamp and user ID for stable file naming
    const fileName = `${Date.now()}_${user.id}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Attempting upload:', {
      bucket: 'artwork-images',
      fileName,
      fileType: file.type,
      fileSize: buffer.length,
      userId: user.id
    });

    const { error: uploadError, data } = await supabase.storage
      .from('artwork-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: `Failed to upload file: ${uploadError.message}` };
    }

    // Get the public URL using the correct path format
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork-images/${fileName}`;
    console.log('Generated public URL:', url);
    
    return { url };
  } catch (error) {
    console.error('Upload error:', error);
    return { error: error instanceof Error ? error.message : 'Internal server error' };
  }
}

export async function createArtwork(formData: FormData) {
  const supabase = await createActionClient();
  const user = await getArtist();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get user's role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Profile not found' };
  }

  // Check artwork count limit for emerging artists
  if (profile.role === 'emerging_artist') {
    const { count } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', user.id);

    if (count && count >= 10) {
      return { error: 'Emerging artists are limited to 10 artworks. Please apply for verification to upload more.' };
    }
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

    // Get the current max display_order for the artist
    const { data: maxOrder } = await supabase
      .from('artworks')
      .select('display_order')
      .eq('artist_id', user.id)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrder?.display_order ?? -1) + 1;

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
        status: isPublished ? 'published' : 'draft',
        display_order: nextOrder
      })
      .select('id')
      .single();

    if (artworkError) throw artworkError;

    // Get the full artwork details from the view
    const { data: artworkWithArtist, error: viewError } = await supabase
      .from('artworks_with_artist')
      .select('*')
      .eq('id', artwork.id)
      .single();

    if (viewError) throw viewError;

    // Generate and store embeddings for the artwork
    if (artworkWithArtist) {
      try {
        // Include styles, techniques, and keywords in the text for embeddings
        const fullText = [
          title,
          description || '',
          ...styles,
          ...techniques,
          ...keywords
        ].join(' ');
        
        await updateArtworkEmbeddings({
          artwork_id: artworkWithArtist.id,
          title,
          description: fullText
        });
      } catch (embeddingError) {
        console.error('Error generating embeddings:', embeddingError);
        // Don't fail the artwork creation if embeddings fail
      }
    }

    return { artwork: artworkWithArtist };
  } catch (error: any) {
    console.error('Error creating artwork:', error);
    return { error: error.message };
  }
}

export async function updateArtwork(artworkId: string, formData: FormData) {
  const supabase = await createActionClient();
  const user = await getArtist();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const imagesJson = formData.get('images') as string;
  const stylesJson = formData.get('styles') as string;
  const techniquesJson = formData.get('techniques') as string;
  const keywordsJson = formData.get('keywords') as string;

  console.log('Update Artwork - Form Data:', {
    artworkId,
    title,
    description,
    price,
    imagesJson,
    stylesJson,
    techniquesJson,
    keywordsJson
  });

  if (!title || !price || !imagesJson) {
    console.log('Missing required fields:', { title, price, imagesJson });
    return { error: 'Missing required fields' };
  }

  try {
    const images = JSON.parse(imagesJson);
    const styles = stylesJson ? JSON.parse(stylesJson) : [];
    const techniques = techniquesJson ? JSON.parse(techniquesJson) : [];
    const keywords = keywordsJson ? JSON.parse(keywordsJson) : [];
    
    console.log('Parsed data:', { images, styles, techniques, keywords });

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

    console.log('Existing artwork check:', existingArtwork);

    if (!existingArtwork || existingArtwork.artist_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    console.log('Attempting database update with:', {
      title,
      description,
      price,
      images,
      styles,
      techniques,
      keywords
    });

    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .update({
        title,
        description,
        price,
        images,
        styles,
        techniques,
        keywords,
      })
      .eq('id', artworkId)
      .select(`
        *,
        profiles (
          id,
          name,
          avatar_url,
          bio
        )
      `)
      .single();

    if (artworkError) {
      console.error('Database update error:', artworkError);
      throw artworkError;
    }

    console.log('Update successful:', artwork);

    // Update embeddings for the artwork
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
        await updateArtworkEmbeddings({
          artwork_id: artwork.id,
          title,
          description: fullText
        });
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

export async function publishArtwork(id: string) {
  console.log('Server: Starting publish for artwork:', id);
  const supabase = await createActionClient();
  const user = await getArtist();

  if (!user) {
    console.log('Server: Not authenticated');
    return { error: 'Not authenticated' };
  }

  // First check if the artwork belongs to the user
  const { data: existingArtwork, error: fetchError } = await supabase
    .from('artworks')
    .select('artist_id, status')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Server: Error fetching artwork:', fetchError);
    return { error: 'Failed to fetch artwork' };
  }

  if (!existingArtwork || existingArtwork.artist_id !== user.id) {
    console.log('Server: Unauthorized - artwork not found or wrong artist');
    return { error: 'Unauthorized' };
  }

  // Check if already published
  if (existingArtwork.status === 'published') {
    console.log('Server: Artwork is already published');
    return { error: 'Artwork is already published' };
  }

  // Get user's role from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Server: Error fetching profile:', profileError);
    return { error: 'Failed to fetch profile' };
  }

  if (!profile) {
    console.log('Server: Profile not found');
    return { error: 'Profile not found' };
  }

  // Check artwork count limit for emerging artists
  if (profile.role === 'emerging_artist') {
    const { count, error: countError } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', user.id)
      .eq('status', 'published');

    if (countError) {
      console.error('Server: Error counting published artworks:', countError);
      return { error: 'Failed to check artwork limit' };
    }

    if (count && count >= 10) {
      console.log('Server: Emerging artist at publish limit');
      return { error: 'Emerging artists are limited to 10 published artworks' };
    }
  }

  const { data: artwork, error: updateError } = await supabase
    .from('artworks')
    .update({ status: 'published' })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Server: Error publishing artwork:', updateError);
    return { error: updateError.message };
  }

  console.log('Server: Successfully published artwork:', artwork);
  return { artwork };
}

export async function unpublishArtwork(id: string) {
  console.log('Server: Starting unpublish for artwork:', id);
  const supabase = await createActionClient();
  const user = await getArtist();

  if (!user) {
    console.log('Server: Not authenticated');
    return { error: 'Not authenticated' };
  }

  // First check if the artwork belongs to the user
  const { data: existingArtwork, error: fetchError } = await supabase
    .from('artworks')
    .select('artist_id, status')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Server: Error fetching artwork:', fetchError);
    return { error: 'Failed to fetch artwork' };
  }

  if (!existingArtwork || existingArtwork.artist_id !== user.id) {
    console.log('Server: Unauthorized - artwork not found or wrong artist');
    return { error: 'Unauthorized' };
  }

  // Check if already unpublished
  if (existingArtwork.status === 'draft') {
    console.log('Server: Artwork is already unpublished');
    return { error: 'Artwork is already unpublished' };
  }

  const { data: artwork, error: updateError } = await supabase
    .from('artworks')
    .update({ status: 'draft' })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Server: Error unpublishing artwork:', updateError);
    return { error: updateError.message };
  }

  console.log('Server: Successfully unpublished artwork:', artwork);
  return { artwork };
}

export async function getSimilarArtworks(artworkId: string) {
  const supabase = await createActionClient();

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
    const { data: similarArtworkDetails, error: artworksError } = await supabase
      .from('artworks_with_artist')
      .select('*')
      .in('id', similarArtworks.map(match => match.id))
      .neq('id', artworkId)
      .eq('status', 'published');

    if (artworksError) throw artworksError;
    if (!similarArtworkDetails) return { artworks: [] };

    // Sort by similarity score
    const sortedArtworks = similarArtworkDetails
      .map(artwork => ({
        ...artwork,
        similarity: similarArtworks.find(match => match.id === artwork.id)?.similarity || 0
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return { artworks: sortedArtworks };
  } catch (error: any) {
    console.error('Error finding similar artworks:', error);
    return { error: error.message };
  }
}

export async function updateArtworkOrder(artworkIds: string[]) {
  try {
    const supabase = await createActionClient();
    const user = await getArtist();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify all artworks belong to the user
    const { data: artworks, error: fetchError } = await supabase
      .from('artworks')
      .select('id')
      .eq('artist_id', user.id)
      .in('id', artworkIds);

    if (fetchError) {
      console.error('Error fetching artworks:', fetchError);
      return { error: 'Failed to verify artwork ownership' };
    }

    if (!artworks || artworks.length !== artworkIds.length) {
      return { error: 'Invalid artwork selection' };
    }

    // Update each artwork's order
    const updates = artworkIds.map((id, index) => 
      supabase
        .from('artworks')
        .update({ display_order: index })
        .eq('id', id)
        .eq('artist_id', user.id)
    );

    await Promise.all(updates);

    return { success: true };
  } catch (error) {
    console.error('Error updating artwork order:', error);
    return { error: 'Failed to update artwork order' };
  }
}

export async function getArtworkDetails(id: string) {
  const supabase = await createActionClient();
  
  const { data: artwork, error } = await supabase
    .from('artworks_with_artist')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching artwork:', error);
    return { error: error.message };
  }

  return { artwork };
}

export async function getArtworkStats(artistId: string) {
  const supabase = await createActionClient();

  try {
    // Get total artworks and published artworks
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select('id, status')
      .eq('artist_id', artistId);

    if (artworksError) throw artworksError;

    const totalArtworks = artworks?.length || 0;
    const publishedArtworks = artworks?.filter(a => a.status === 'published').length || 0;

    // Get total favorites
    const { data: favorites, error: favoritesError } = await supabase
      .from('artwork_favorites')
      .select('artwork_id')
      .in('artwork_id', artworks?.map(a => a.id) || []);

    if (favoritesError) throw favoritesError;

    const totalFavorites = favorites?.length || 0;

    // Get total views from analytics - using a different approach for JSON field
    const { data: views, error: viewsError } = await supabase
      .from('user_events')
      .select('id')
      .eq('event_type', 'artwork_view')
      .contains('event_data', { artwork_id: artworks?.map(a => a.id) });

    if (viewsError) throw viewsError;

    const totalViews = views?.length || 0;

    return {
      stats: {
        totalArtworks,
        publishedArtworks,
        totalViews,
        totalFavorites
      }
    };
  } catch (error: any) {
    console.error('Error fetching artwork stats:', error);
    return { error: error.message };
  }
} 