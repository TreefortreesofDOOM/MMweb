'use server';

import { createActionClient } from '@/utils/supabase/action';

export async function uploadArtworkImage(formData: FormData) {
  try {
    const supabase = await createActionClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
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