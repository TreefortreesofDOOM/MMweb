'use server';

import { createActionClient } from '@/lib/supabase/supabase-action-utils';
import { encodedRedirect } from "@/lib/utils/common-utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { trackOnboardingStep } from '@/lib/actions/analytics';
import { getGhostProfileByEmail, claimGhostProfile } from '@/lib/actions/ghost-profiles';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createActionClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  // Sign up the user
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error("Signup error:", signUpError);
    return encodedRedirect("error", "/sign-up", signUpError.message);
  }

  if (!data?.session || !data.user) {
    console.error("No session or user returned from signUp");
    return encodedRedirect("error", "/sign-up", "Failed to create account");
  }

  // Track successful signup
  await trackOnboardingStep(data.user.id, 'signup');

  // Check for ghost profile after successful sign-up
  try {
    const ghostProfile = await getGhostProfileByEmail(email);
    if (ghostProfile) {
      // Claim the ghost profile silently
      await claimGhostProfile(ghostProfile.id, data.user.id);
    }
  } catch (error) {
    // Log error but don't block the flow
    console.error("Error claiming ghost profile:", error);
  }

  return redirect("/role-selection");
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createActionClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/profile");
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