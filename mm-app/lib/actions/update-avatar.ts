'use server'

import { createClient } from '@/lib/supabase/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateAvatarAction(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Get the avatar file
    const avatarFile = formData.get('avatar') as File
    if (!avatarFile) {
      return { error: 'No file provided' }
    }

    // Check file size (5MB limit)
    if (avatarFile.size > 5 * 1024 * 1024) {
      return { error: 'File size too large. Maximum size is 5MB.' }
    }

    // Check file type
    if (!avatarFile.type.startsWith('image/')) {
      return { error: 'Invalid file type. Please upload an image.' }
    }

    // Upload to storage
    const fileName = `${user.id}-${Date.now()}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload image' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { error: 'Failed to update profile' }
    }

    // Revalidate profile pages
    revalidatePath('/profile')
    revalidatePath('/profile/edit')
    
    return { success: true, avatarUrl: publicUrl }
  } catch (error) {
    console.error('Avatar update error:', error)
    return { error: 'Failed to update avatar' }
  }
}

export async function removeAvatarAction() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Update profile to remove avatar_url
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { error: 'Failed to update profile' }
    }

    // Revalidate profile pages
    revalidatePath('/profile')
    revalidatePath('/profile/edit')
    
    return { success: true }
  } catch (error) {
    console.error('Avatar removal error:', error)
    return { error: 'Failed to remove avatar' }
  }
} 