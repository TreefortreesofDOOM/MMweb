'use server';

import { createActionClient } from '@/lib/supabase/action';
import { encodedRedirect } from "@/lib/utils";
import { headers } from "next/headers";
import { Database } from "@/lib/database.types";

interface PartialRegistrationData {
  email?: string;
  password?: string;
  termsAccepted?: boolean;
}

type PartialRegistration = Database["public"]["Tables"]["partial_registrations"]["Row"];
type PartialRegistrationInsert = Database["public"]["Tables"]["partial_registrations"]["Insert"];
type PartialRegistrationUpdate = Database["public"]["Tables"]["partial_registrations"]["Update"];

export async function savePartialRegistration(data: PartialRegistrationData) {
  if (!data.email) {
    return { error: "Email is required" };
  }

  // Remove sensitive data before storing
  const safeData = {
    ...data,
    password: undefined
  };

  try {
    const supabase = await createActionClient();
    
    const { data: existingData, error: fetchError } = await supabase
      .from("partial_registrations")
      .select<"*", PartialRegistration>()
      .eq("email", data.email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return { error: "Failed to check existing registration" };
    }

    if (existingData) {
      const updateData: PartialRegistrationUpdate = {
        data: safeData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const { error: updateError } = await supabase
        .from("partial_registrations")
        .update(updateData)
        .eq("email", data.email);

      if (updateError) {
        return { error: "Failed to update partial registration" };
      }
    } else {
      const insertData: PartialRegistrationInsert = {
        email: data.email,
        data: safeData
      };

      const { error: insertError } = await supabase
        .from("partial_registrations")
        .insert(insertData);

      if (insertError) {
        return { error: "Failed to save partial registration" };
      }
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to save partial registration" };
  }
}

export async function getPartialRegistration(email: string) {
  try {
    const supabase = await createActionClient();
    
    const { data, error } = await supabase
      .from("partial_registrations")
      .select<"*", PartialRegistration>()
      .eq("email", email)
      .single();

    if (error) {
      return { error: "Failed to retrieve partial registration" };
    }

    if (!data) {
      return { data: null };
    }

    return { data: data.data as PartialRegistrationData };
  } catch (error) {
    return { error: "Failed to retrieve partial registration" };
  }
}

export async function deletePartialRegistration(email: string) {
  try {
    const supabase = await createActionClient();
    
    const { error } = await supabase
      .from("partial_registrations")
      .delete()
      .eq("email", email);

    if (error) {
      return { error: "Failed to delete partial registration" };
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to delete partial registration" };
  }
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const termsAccepted = formData.get("termsAccepted") === "true";
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  if (!termsAccepted) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "You must accept the terms and privacy policy"
    );
  }

  try {
    const supabase = await createActionClient();

    // Save partial registration first
    await savePartialRegistration({ email, termsAccepted });

    // Attempt to sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/callback`
      }
    });

    if (signUpError) {
      return encodedRedirect(
        "error",
        "/sign-up",
        signUpError.message
      );
    }

    // Clean up partial registration on successful signup
    await deletePartialRegistration(email);

    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  } catch (error) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Failed to sign up"
    );
  }
} 