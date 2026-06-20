"use client";

import { supabase } from "@/lib/supabase";

export default function GoogleLogin() {

    const signInWithGoogle = async () => {

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo:
                    "http://localhost:3000",
            },
        });

    };

    return (
        <button
            onClick={signInWithGoogle}
            className="bg-blue-600 text-white px-4 py-2 rounded"
        >
            Login with Google
        </button>
    );
}