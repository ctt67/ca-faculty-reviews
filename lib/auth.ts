import { supabase } from "@/lib/supabase";

export async function signInWithGoogle(next?: string) {
  const safePath =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${safePath}`,
    },
  });
}