'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { encodedRedirect } from "@/lib/utils/common-utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { trackOnboardingStep } from '@/lib/actions/analytics';
import { getGhostProfileByEmail, claimGhostProfile } from '@/lib/actions/ghost-profiles';
import { logAuthError } from '@/lib/utils/error-utils';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createActionClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    logAuthError('AUTH_MISSING_CREDENTIALS', 'Email and password are required', 'signUpAction');
    return encodedRedirect("error", "/sign-up", "Email and password are required");
  }

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    logAuthError('AUTH_SIGNUP_FAILED', signUpError.message, 'signUpAction', { error: signUpError });
    return encodedRedirect("error", "/sign-up", signUpError.message);
  }

  if (!data?.session || !data.user) {
    logAuthError('AUTH_NO_SESSION', 'No session or user returned from signUp', 'signUpAction');
    return encodedRedirect("error", "/sign-up", "Failed to create account");
  }

  await trackOnboardingStep(data.user.id, 'signup');

  try {
    const ghostProfile = await getGhostProfileByEmail(email);
    if (ghostProfile && !ghostProfile.isClaimed) {
      await claimGhostProfile(ghostProfile.id, data.user.id);
    }
  } catch (error) {
    logAuthError(
      'AUTH_GHOST_PROFILE_ERROR',
      error instanceof Error ? error.message : 'Error claiming ghost profile',
      'signUpAction',
      { error },
      data.user.id
    );
  }

  return redirect("/role-selection");
};

export const signInAction = async (formData: FormData) => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createActionClient();

    if (!email || !password) {
      logAuthError('AUTH_MISSING_CREDENTIALS', 'Email and password are required', 'signInAction');
      return encodedRedirect("error", "/sign-in", "Email and password are required");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logAuthError('AUTH_SIGNIN_FAILED', error.message, 'signInAction', { error });
      return encodedRedirect("error", "/sign-in", error.message);
    }

    if (!data?.session) {
      logAuthError('AUTH_NO_SESSION', 'Failed to create session', 'signInAction');
      return encodedRedirect("error", "/sign-in", "Failed to create session");
    }

    // Get user's role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.session.user.id)
      .single();

    // Redirect based on role
    switch (profile?.role) {
      case 'admin':
        return redirect("/admin-dashboard");
      case 'verified_artist':
      case 'emerging_artist':
        return redirect("/artist/dashboard");
      case 'patron':
        return redirect("/patron/dashboard");
      case 'user':
        return redirect("/dashboard");
      default:
        return redirect("/profile");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    logAuthError(
      'AUTH_UNEXPECTED_ERROR',
      error instanceof Error ? error.message : 'An unexpected error occurred',
      'signInAction',
      { error }
    );
    return encodedRedirect("error", "/sign-in", "An unexpected error occurred");
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createActionClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/callback?redirect_to=/reset-password`,
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
  const supabase = await createActionClient();

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
  const supabase = await createActionClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
}; 