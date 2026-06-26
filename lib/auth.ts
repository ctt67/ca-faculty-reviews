import { supabase } from "@/lib/supabase";

export async function signInWithGoogle(next?: string) {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${
        next ?? ""
      }`,
    },
  });
}