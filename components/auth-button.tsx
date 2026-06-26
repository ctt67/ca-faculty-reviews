"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { signInWithGoogle } from "@/lib/auth";

export default function AuthButton() {

    const [user, setUser] = useState<any>(null);

    useEffect(() => {

        const getUser = async () => {

            const {
                data: { user },
            } = await supabase.auth.getUser();

            setUser(user);

        };

        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {

                setUser(session?.user ?? null);

            }
        );

        return () => {

            subscription.unsubscribe();

        };

    }, []);

    const signIn = async () => {
        await signInWithGoogle();
    };

    const signOut = async () => {

        await supabase.auth.signOut();

    };

    if (user) {

        return (

            <div className="flex items-center gap-3">

                <span className="text-sm text-slate-300">
                    {user.email?.split("@")[0]}
                </span>

                <button
                    onClick={signOut}
                    className="text-slate-400 hover:text-white text-sm font-medium transition"
                >
                    Logout
                </button>

            </div>

        );

    }

    return (

        <button
            onClick={signIn}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
            Login with Google
        </button>

    );

}