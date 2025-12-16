"use server";

import { createClient } from "@/lib/supabase/supabaseServer";
import { redirect } from "next/navigation";

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient();
  const redirectToParam = formData?.get("redirectTo")?.toString();

  const options: { redirectTo: string } = {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
  };

  if (redirectToParam) {
    options.redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?redirect_to=${encodeURIComponent(redirectToParam)}`;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options,
  });

  if (error) {
    console.error("Google Sign-In failed:", error.message);
    return redirect("/login?message=Could not initiate Google Sign-In");
  }

  if (data.url) {
    return redirect(data.url);
  }
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout failed:", error.message);
    return redirect("/?message=Could not log out");
  }

  return redirect("/");
}
