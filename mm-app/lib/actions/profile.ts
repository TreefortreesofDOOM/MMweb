'use server';

import { createActionClient } from '@/lib/supabase/action';
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/lib/utils";
import { Database } from "@/lib/database.types";

type Profile = Database['public']['Tables']['profiles']['Update'];

export async function getProfileAction() {
  const supabase = await createActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return { profile };
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return { error: error.message };
  }
}

export const updateProfileAction = async (formData: FormData) => {
  const supabase = await createActionClient();
  
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