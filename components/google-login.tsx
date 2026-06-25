"use client";

import { supabase } from "@/lib/supabase";

// Note: This component is superseded by auth-button.tsx which is used in the Navbar.
// Kept here in case it's needed standalone elsewhere.
export default function GoogleLogin() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <button
      onClick={signInWithGoogle}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
    >
      Login with Google
    </button>
  );
}
