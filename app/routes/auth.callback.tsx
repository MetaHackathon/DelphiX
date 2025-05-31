import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createClient } from "~/lib/supabase.server";
import { createOrUpdateUserProfile } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard";
  const error = url.searchParams.get("error");
  const error_description = url.searchParams.get("error_description");

  // If there's an error, redirect to sign-in with error
  if (error) {
    console.error("Auth error:", { error, error_description });
    return redirect(`/auth/signin?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    const supabase = createClient();

    try {
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        console.error("Session exchange error:", sessionError);
        throw sessionError;
      }

      // Create or update user profile
      if (data.user) {
        await createOrUpdateUserProfile(data.user);
      }

      // Redirect to the intended page
      // The client will pick up the session automatically
      return redirect(redirectTo);
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      return redirect(`/auth/signin?error=${encodeURIComponent("Failed to sign in")}`);
    }
  }

  // If no code and no error, redirect to sign-in
  return redirect("/auth/signin");
} 