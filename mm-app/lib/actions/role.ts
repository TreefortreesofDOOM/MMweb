'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import type { UserRole } from '@/lib/navigation/types';
import { trackOnboardingStep } from '@/lib/actions/analytics';

export async function updateUserRole(role: UserRole) {
  try {
    const supabase = await createActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Track role selection
    await trackOnboardingStep({
      step: 'role_selection',
      completed: true,
      metadata: {
        userId: user.id,
        selectedRole: role
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
} 