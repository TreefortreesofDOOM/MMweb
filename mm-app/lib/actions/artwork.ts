'use server';

import { createActionClient } from '@/lib/supabase/action';
import { updateArtworkEmbeddings, findSimilarArtworks } from '@/lib/ai/embeddings';
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
      .select()
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
        await updateArtworkEmbeddings(artwork.id, title, fullText);
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

export async function publishArtwork(artworkId: string) {
  const supabase = await createActionClient();
  const user = await getArtist();

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
  const supabase = await createActionClient();
  const user = await getArtist();

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